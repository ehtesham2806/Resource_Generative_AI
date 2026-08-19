import { forwardRef, useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

interface GuideMockupProps {
  imageUrl?: string;
  isLoading?: boolean;
  dominantColor?: string;
  objectFit?: 'contain' | 'cover';
  coverPosition?: string;
  coverLeft?: string;
  coverScale?: number;
  frameScale?: number;
  backgroundColor?: string;
  backgroundImage?: string;
  outputWidth: number;
  outputHeight: number;
  heading: string;
  description: string;
  headingColor?: string;
  headingSize?: number;
  descriptionColor?: string;
  descriptionSize?: number;
  showDescription?: boolean;
  onHeadingChange?: (val: string) => void;
  onHeadingColorChange?: (val: string) => void;
  onHeadingSizeChange?: (val: number) => void;
  onDescriptionChange?: (val: string) => void;
  onDescriptionColorChange?: (val: string) => void;
  onDescriptionSizeChange?: (val: number) => void;
  onShowDescriptionChange?: (val: boolean) => void;
}

const GuideMockup = forwardRef<HTMLDivElement, GuideMockupProps>(
  ({
    imageUrl,
    isLoading,
    dominantColor,
    objectFit = 'contain',
    coverPosition = '0px',
    coverLeft = '0px',
    coverScale = 1,
    frameScale = 1,
    backgroundColor,
    backgroundImage,
    outputWidth,
    outputHeight,
    heading,
    description,
    headingColor = '#1e293b',
    headingSize = 36,
    descriptionColor = '#64748b',
    descriptionSize = 14,
    showDescription = true,
    onHeadingChange,
    onHeadingColorChange,
    onHeadingSizeChange,
    onDescriptionChange,
    onDescriptionColorChange,
    onDescriptionSizeChange,
    onShowDescriptionChange,
  }, ref) => {
    const [activePopover, setActivePopover] = useState<'heading' | 'description' | null>(null);
    const [popoverCoords, setPopoverCoords] = useState<{ top: number; left: number } | null>(null);
    const popoverRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
          const target = event.target as HTMLElement;
          if (target.closest('.clickable-trigger')) {
            return;
          }
          setActivePopover(null);
          setPopoverCoords(null);
        }
      };
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleTriggerClick = (
      event: React.MouseEvent<HTMLElement>,
      section: 'heading' | 'description'
    ) => {
      event.stopPropagation();
      if (activePopover === section) {
        setActivePopover(null);
        setPopoverCoords(null);
        return;
      }

      const rect = event.currentTarget.getBoundingClientRect();
      const isPortraitLayout = outputHeight > outputWidth;

      let top = 0;
      let left = 0;

      if (isPortraitLayout) {
        if (section === 'description') {
          top = rect.top + window.scrollY - 100 - 8;
        } else {
          top = rect.bottom + window.scrollY + 8;
        }
        left = Math.max(8, rect.left + window.scrollX);
      } else {
        left = rect.right + window.scrollX + 16;
        if (section === 'description') {
          top = rect.bottom + window.scrollY - 80;
        } else {
          top = rect.top + window.scrollY;
        }
      }

      setPopoverCoords({
        top: top,
        left: left,
      });
      setActivePopover(section);
    };

    const isPortrait = outputHeight > outputWidth;
    const isHeadingEmpty = !heading || heading.trim() === '';
    const isDescriptionEmpty = !description || description.trim() === '';

    return (
      <>
        <div
          ref={ref}
          className="relative w-full overflow-hidden flex items-stretch"
          style={{
            aspectRatio: `${outputWidth} / ${outputHeight}`,
            backgroundColor: backgroundImage ? 'transparent' : (backgroundColor || '#faf7f5'),
            backgroundImage: backgroundImage ? `url(${backgroundImage})` : undefined,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            boxSizing: 'border-box',
            padding: isPortrait ? '24px' : '0',
          }}
        >
          {/* Subtle warm gradient orbs */}
          {!backgroundImage && (
            <>
              <div className="absolute top-0 right-0 w-[60%] h-[60%] bg-gradient-to-bl from-amber-200/30 via-orange-100/20 to-transparent rounded-full blur-3xl pointer-events-none"></div>
              <div className="absolute bottom-0 right-1/4 w-[40%] h-[40%] bg-gradient-to-t from-rose-200/25 via-pink-100/15 to-transparent rounded-full blur-3xl pointer-events-none"></div>
            </>
          )}

          {/* Content Layout */}
          <div className={`w-full h-full flex ${
            isPortrait ? 'flex-col items-center justify-center gap-4' : 'flex-row items-stretch'
          } relative z-10`}>

            {/* LEFT: Image with half-circular clip */}
            <div
              className="shrink-0 relative overflow-hidden flex items-center justify-center"
              style={
                isPortrait
                  ? {
                      width: '80%',
                      height: '50%',
                      backgroundColor: dominantColor || '#1a1a2e',
                      transform: `scale(${coverScale})`,
                      transformOrigin: 'center center'
                    }
                  : {
                      width: '45%',
                      backgroundColor: dominantColor || '#1a1a2e',
                      transform: `scale(${coverScale})`,
                      transformOrigin: 'center center'
                    }
              }
            >
              {isLoading ? (
                <div className="w-full h-full flex items-center justify-center bg-black/20">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-600"></div>
                </div>
              ) : imageUrl ? (
                <div className="relative w-full h-full overflow-hidden">
                  <img
                    src={imageUrl}
                    alt="Guide content"
                    className={`absolute left-0 right-0 mx-auto w-full h-full ${
                      objectFit === 'contain'
                        ? 'object-contain max-w-full max-h-full w-auto h-auto'
                        : 'object-cover'
                    }`}
                    style={
                      objectFit === 'contain'
                        ? {
                            top: '50%',
                            left: '50%',
                            transform: `translate(-50%, -50%) translate(${coverLeft}, ${coverPosition})`,
                          }
                        : {
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            width: '100%',
                            height: '100%',
                            objectPosition: `calc(50% + ${coverLeft}) calc(50% + ${coverPosition})`,
                          }
                    }
                    crossOrigin="anonymous"
                  />
                </div>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-200/60 to-slate-300/40 p-6 text-center">
                  <div className="w-12 h-12 rounded-xl bg-white/60 border border-slate-300/40 flex items-center justify-center mb-3">
                    <span className="text-slate-500 text-xl">📄</span>
                  </div>
                  <h4 className="text-[10px] font-bold text-slate-500 tracking-wider uppercase mb-1">
                    Guide Preview
                  </h4>
                  <p className="text-[9px] text-slate-400 max-w-[160px]">
                    Your image will display here with a half-circular crop
                  </p>
                </div>
              )}
            </div>

            {/* RIGHT: Text Content */}
            <div className={`flex flex-col justify-center ${
              isPortrait
                ? 'items-center text-center px-6'
                : 'items-start text-left px-[6%] flex-1'
            }`}>

              {/* Heading */}
              <div className="relative w-full mb-3 clickable-trigger">
                <h1
                  contentEditable
                  suppressContentEditableWarning
                  data-placeholder="Enter title..."
                  onBlur={(e) => onHeadingChange?.(e.currentTarget.innerText)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      e.currentTarget.blur();
                    }
                  }}
                  onClick={(e) => handleTriggerClick(e, 'heading')}
                  className={`relative font-extrabold tracking-tight mb-0 font-['Outfit'] leading-tight break-words cursor-text rounded-lg p-1 transition-all select-text w-full outline-none focus:outline-none focus:ring-0 focus-visible:outline-none min-h-[1.5em] ${
                    isHeadingEmpty ? 'is-empty' : ''
                  } ${
                    activePopover === 'heading'
                      ? 'ring-0 outline-none'
                      : 'hover:ring-1 hover:ring-fuchsia-500/50'
                  }`}
                  style={{
                    color: headingColor,
                    fontSize: `${headingSize}px`,
                  }}
                >
                  {heading}
                </h1>

                {activePopover === 'heading' && (
                  <div className="absolute -inset-2 border-2 border-fuchsia-500 pointer-events-none rounded-lg mockup-popover-exclude z-20">
                    {/* Corner circles */}
                    <div className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-white border-2 border-fuchsia-500 rounded-full"></div>
                    <div className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-white border-2 border-fuchsia-500 rounded-full"></div>
                    <div className="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-white border-2 border-fuchsia-500 rounded-full"></div>
                    <div className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-white border-2 border-fuchsia-500 rounded-full"></div>
                    {/* Side pills */}
                    <div className="absolute top-1/2 -left-1.5 -translate-y-1/2 w-1.5 h-3.5 bg-white border-2 border-fuchsia-500 rounded-full"></div>
                    <div className="absolute top-1/2 -right-1.5 -translate-y-1/2 w-1.5 h-3.5 bg-white border-2 border-fuchsia-500 rounded-full"></div>
                  </div>
                )}
              </div>

              {/* Description */}
              {showDescription && (
                <div className="relative w-full clickable-trigger">
                  <p
                    contentEditable
                    suppressContentEditableWarning
                    data-placeholder="Enter description..."
                    onBlur={(e) => onDescriptionChange?.(e.currentTarget.innerText.slice(0, 100))}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        e.currentTarget.blur();
                      }
                    }}
                    onClick={(e) => handleTriggerClick(e, 'description')}
                    className={`relative font-medium leading-relaxed break-words cursor-text rounded-lg p-1 transition-all select-text w-full outline-none focus:outline-none focus:ring-0 focus-visible:outline-none min-h-[1.5em] ${
                      isDescriptionEmpty ? 'is-empty' : ''
                    } ${
                      activePopover === 'description'
                        ? 'ring-0 outline-none'
                        : 'hover:ring-1 hover:ring-fuchsia-500/50'
                    }`}
                    style={{
                      color: descriptionColor,
                      fontSize: `${descriptionSize}px`,
                    }}
                  >
                    {description}
                  </p>

                  {activePopover === 'description' && (
                    <div className="absolute -inset-2 border-2 border-fuchsia-500 pointer-events-none rounded-lg mockup-popover-exclude z-20">
                      {/* Corner circles */}
                      <div className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-white border-2 border-fuchsia-500 rounded-full"></div>
                      <div className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-white border-2 border-fuchsia-500 rounded-full"></div>
                      <div className="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-white border-2 border-fuchsia-500 rounded-full"></div>
                      <div className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-white border-2 border-fuchsia-500 rounded-full"></div>
                      {/* Side pills */}
                      <div className="absolute top-1/2 -left-1.5 -translate-y-1/2 w-1.5 h-3.5 bg-white border-2 border-fuchsia-500 rounded-full"></div>
                      <div className="absolute top-1/2 -right-1.5 -translate-y-1/2 w-1.5 h-3.5 bg-white border-2 border-fuchsia-500 rounded-full"></div>
                    </div>
                  )}
                </div>
              )}
            </div>

          </div>
        </div>

        {/* Floating editing toolbars */}
        {activePopover && popoverCoords && createPortal(
          <div
            ref={popoverRef}
            className="absolute p-2 bg-[#0d0d1dfa] backdrop-blur-md border border-slate-700/80 rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.6)] z-[9999] flex items-center gap-3 select-none mockup-popover-exclude font-sans text-xs text-white"
            style={{
              top: `${popoverCoords.top}px`,
              left: `${popoverCoords.left}px`,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {activePopover === 'heading' && (
              <>
                {/* Font Size decrease */}
                <button
                  onClick={() => onHeadingSizeChange?.(Math.max(10, headingSize - 1))}
                  className="w-7 h-7 flex items-center justify-center rounded-lg bg-slate-800/60 hover:bg-slate-700/80 border border-slate-700/50 text-white font-bold text-sm cursor-pointer select-none transition-colors"
                >
                  -
                </button>
                <span className="text-xs font-bold text-slate-300 w-6 text-center select-none">{headingSize}</span>
                {/* Font Size increase */}
                <button
                  onClick={() => onHeadingSizeChange?.(Math.min(72, headingSize + 1))}
                  className="w-7 h-7 flex items-center justify-center rounded-lg bg-slate-800/60 hover:bg-slate-700/80 border border-slate-700/50 text-white font-bold text-sm cursor-pointer select-none transition-colors"
                >
                  +
                </button>

                <div className="w-[1px] h-5 bg-slate-800"></div>

                {/* Color Button */}
                <div className="flex items-center gap-1.5 relative">
                  <span className="text-[10px] font-bold text-slate-500 uppercase select-none">A</span>
                  <div className="relative w-6 h-6 rounded-md border border-slate-700 overflow-hidden cursor-pointer flex-shrink-0">
                    <input
                      type="color"
                      value={headingColor}
                      onChange={(e) => onHeadingColorChange?.(e.target.value)}
                      className="absolute inset-0 w-full h-full p-0 border-0 cursor-pointer bg-transparent"
                    />
                  </div>
                </div>

                <div className="w-[1px] h-5 bg-slate-800"></div>

                {/* Description Toggle */}
                <button
                  onClick={() => onShowDescriptionChange?.(!showDescription)}
                  className={`px-2.5 py-1 rounded-lg border text-[10px] font-bold uppercase transition-all cursor-pointer select-none ${
                    showDescription
                      ? 'bg-fuchsia-500/20 border-fuchsia-500 text-fuchsia-300 hover:bg-fuchsia-500/30'
                      : 'bg-slate-800/60 border-slate-700/50 text-slate-400 hover:bg-slate-700/80 hover:text-white'
                  }`}
                >
                  Description
                </button>
              </>
            )}

            {activePopover === 'description' && (
              <>
                {/* Font Size decrease */}
                <button
                  onClick={() => onDescriptionSizeChange?.(Math.max(10, descriptionSize - 1))}
                  className="w-7 h-7 flex items-center justify-center rounded-lg bg-slate-800/60 hover:bg-slate-700/80 border border-slate-700/50 text-white font-bold text-sm cursor-pointer select-none transition-colors"
                >
                  -
                </button>
                <span className="text-xs font-bold text-slate-300 w-6 text-center select-none">{descriptionSize}</span>
                {/* Font Size increase */}
                <button
                  onClick={() => onDescriptionSizeChange?.(Math.min(32, descriptionSize + 1))}
                  className="w-7 h-7 flex items-center justify-center rounded-lg bg-slate-800/60 hover:bg-slate-700/80 border border-slate-700/50 text-white font-bold text-sm cursor-pointer select-none transition-colors"
                >
                  +
                </button>

                <div className="w-[1px] h-5 bg-slate-800"></div>

                {/* Color Button */}
                <div className="flex items-center gap-1.5 relative">
                  <span className="text-[10px] font-bold text-slate-500 uppercase select-none">A</span>
                  <div className="relative w-6 h-6 rounded-md border border-slate-700 overflow-hidden cursor-pointer flex-shrink-0">
                    <input
                      type="color"
                      value={descriptionColor}
                      onChange={(e) => onDescriptionColorChange?.(e.target.value)}
                      className="absolute inset-0 w-full h-full p-0 border-0 cursor-pointer bg-transparent"
                    />
                  </div>
                </div>
              </>
            )}
          </div>,
          document.body
        )}
      </>
    );
  }
);

GuideMockup.displayName = 'GuideMockup';

export default GuideMockup;
