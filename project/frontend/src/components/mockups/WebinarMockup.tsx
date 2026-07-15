import { forwardRef, useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

interface WebinarMockupProps {
  imageUrl?: string;
  isLoading?: boolean;
  dominantColor?: string;
  objectFit?: 'contain' | 'cover';
  coverPosition?: string;
  coverLeft?: string;
  coverScale?: number;
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
  showBadge?: boolean;
  badgeText?: string;
  badgeBgColor?: string;
  badgeBorderColor?: string;
  badgeTextColor?: string;
  badgeDotColor?: string;
  onHeadingChange?: (val: string) => void;
  onHeadingColorChange?: (val: string) => void;
  onHeadingSizeChange?: (val: number) => void;
  onDescriptionChange?: (val: string) => void;
  onDescriptionColorChange?: (val: string) => void;
  onDescriptionSizeChange?: (val: number) => void;
  onBadgeTextChange?: (val: string) => void;
  onBadgeBgColorChange?: (val: string) => void;
  onBadgeBorderColorChange?: (val: string) => void;
  onBadgeTextColorChange?: (val: string) => void;
  onBadgeDotColorChange?: (val: string) => void;
  onShowBadgeChange?: (val: boolean) => void;
  showDescription?: boolean;
  onShowDescriptionChange?: (val: boolean) => void;
}

const WebinarMockup = forwardRef<HTMLDivElement, WebinarMockupProps>(
  ({
    imageUrl,
    isLoading,
    dominantColor,
    objectFit = 'contain',
    coverPosition = '0px',
    coverLeft = '0px',
    coverScale = 1,
    backgroundColor,
    backgroundImage,
    outputWidth,
    outputHeight,
    heading,
    description,
    headingColor = '#ffffff',
    headingSize = 36,
    descriptionColor = '#cbd5e1',
    descriptionSize = 14,
    showBadge = true,
    badgeText = 'Live Webinar',
    badgeBgColor = '#2b1133',
    badgeBorderColor = '#3b1547',
    badgeTextColor = '#d946ef',
    badgeDotColor = '#d946ef',
    onHeadingChange,
    onHeadingColorChange,
    onHeadingSizeChange,
    onDescriptionChange,
    onDescriptionColorChange,
    onDescriptionSizeChange,
    onBadgeTextChange,
    onBadgeBgColorChange,
    onBadgeBorderColorChange,
    onBadgeTextColorChange,
    onBadgeDotColorChange,
    onShowBadgeChange,
    showDescription = true,
    onShowDescriptionChange,
  }, ref) => {
    const [activePopover, setActivePopover] = useState<'badge' | 'heading' | 'description' | null>(null);
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
      section: 'badge' | 'heading' | 'description'
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
        // Landscape layout: place popover on the right side of the content
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
          className="relative w-full overflow-hidden flex items-center justify-center"
          style={{
            aspectRatio: `${outputWidth} / ${outputHeight}`,
            backgroundColor: backgroundImage ? 'transparent' : (backgroundColor || '#0b0b18'),
            backgroundImage: backgroundImage ? `url(${backgroundImage})` : undefined,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            boxSizing: 'border-box',
            padding: isPortrait ? '24px' : '4% 6%',
          }}
        >
          {/* Glowing Ambient Background Orbs */}
          <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-fuchsia-600/15 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-blue-600/15 rounded-full blur-3xl pointer-events-none"></div>

          {/* Content Layout - dynamically adjusts flex direction based on aspect ratio */}
          <div className={`w-full h-full max-w-[950px] mx-auto flex ${
            isPortrait ? 'flex-col items-center justify-center text-center gap-4' : 'flex-col md:flex-row items-center justify-between gap-4'
          } relative z-10`}>
            
            {/* Webinar Info */}
            <div className={`flex flex-col ${
              isPortrait ? 'items-center text-center' : 'items-start text-left'
            } max-w-[300px]`}>
              
              {/* Live Indicator Badge */}
              {showBadge && (
                <div className="relative clickable-trigger mb-4 inline-flex">
                  <div 
                    onClick={(e) => handleTriggerClick(e, 'badge')}
                    className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase border cursor-pointer transition-all select-none relative ${
                      activePopover === 'badge'
                        ? 'ring-0 outline-none border-fuchsia-500'
                        : 'hover:ring-1 hover:ring-fuchsia-500/50'
                    }`}
                    style={{
                      backgroundColor: badgeBgColor,
                      borderColor: badgeBorderColor,
                      color: badgeTextColor,
                    }}
                  >
                    <span 
                      className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: badgeDotColor }}
                    ></span>
                    <span
                      contentEditable
                      suppressContentEditableWarning
                      onBlur={(e) => onBadgeTextChange?.(e.currentTarget.innerText)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          e.currentTarget.blur();
                        }
                      }}
                      onClick={(e) => e.stopPropagation()}
                      className="outline-none focus:outline-none focus:ring-0 focus-visible:outline-none cursor-text select-text"
                    >
                      {badgeText}
                    </span>
                  </div>

                  {activePopover === 'badge' && (
                    <div className="absolute -inset-1 border-2 border-fuchsia-500 pointer-events-none rounded-full mockup-popover-exclude z-20">
                      {/* Left/Right middle handles */}
                      <div className="absolute top-1/2 -left-1 -translate-y-1/2 w-1.5 h-2.5 bg-white border border-fuchsia-500 rounded-full"></div>
                      <div className="absolute top-1/2 -right-1 -translate-y-1/2 w-1.5 h-2.5 bg-white border border-fuchsia-500 rounded-full"></div>
                    </div>
                  )}
                </div>
              )}

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

              {/* Description - Optional & Truncated to max 100 characters */}
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

            {/* Right Side: PDF first page / Image Screen container (dynamic sizing based on aspect ratio orientation) */}
            <div 
              className="shrink-0 aspect-[3/4] rounded-2xl overflow-hidden border border-white/20 dark:border-white/10 shadow-[0_15px_35px_rgba(0,0,0,0.4)] relative bg-slate-900/40 flex items-center justify-center group"
              style={
                isPortrait
                  ? { width: '56%', height: 'auto', backgroundColor: dominantColor || undefined }
                  : { height: '82%', width: 'auto', backgroundColor: dominantColor || undefined }
              }
            >
              {isLoading ? (
                <div className="w-full h-full flex items-center justify-center bg-black/50">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                </div>
              ) : imageUrl ? (
                <div className="relative w-full h-full overflow-hidden">
                  <img
                    src={imageUrl}
                    alt="Webinar poster content"
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
                            transform: `translate(-50%, -50%) scale(${coverScale}) translate(${coverLeft}, ${coverPosition})`,
                          }
                        : {
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            width: `${100 * coverScale}%`,
                            height: `${100 * coverScale}%`,
                            objectPosition: `calc(50% + ${coverLeft}) calc(50% + ${coverPosition})`,
                          }
                    }
                    crossOrigin="anonymous"
                  />
                </div>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-indigo-950/40 to-purple-950/40 p-6 text-center">
                  <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-3">
                    <span className="text-white text-xl">📄</span>
                  </div>
                  <h4 className="text-[10px] font-bold text-white/70 tracking-wider uppercase mb-1">
                    Mockup Preview Screen
                  </h4>
                  <p className="text-[9px] text-slate-400 max-w-[160px]">
                    PDF Cover or slide image will display here
                  </p>
                </div>
              )}
            </div>

          </div>
        </div>

        {/* Floating Canva-style compact editing toolbars */}
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
                {/* Font Size decrease button */}
                <button 
                  onClick={() => onHeadingSizeChange?.(Math.max(10, headingSize - 1))}
                  className="w-7 h-7 flex items-center justify-center rounded-lg bg-slate-800/60 hover:bg-slate-700/80 border border-slate-700/50 text-white font-bold text-sm cursor-pointer select-none transition-colors"
                >
                  -
                </button>
                {/* Font Size Display */}
                <span className="text-xs font-bold text-slate-300 w-6 text-center select-none">{headingSize}</span>
                {/* Font Size increase button */}
                <button 
                  onClick={() => onHeadingSizeChange?.(Math.min(72, headingSize + 1))}
                  className="w-7 h-7 flex items-center justify-center rounded-lg bg-slate-800/60 hover:bg-slate-700/80 border border-slate-700/50 text-white font-bold text-sm cursor-pointer select-none transition-colors"
                >
                  +
                </button>

                {/* Divider */}
                <div className="w-[1px] h-5 bg-slate-800"></div>

                {/* Color Button with active underline */}
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

                {/* Divider */}
                <div className="w-[1px] h-5 bg-slate-800"></div>

                {/* Live Badge Toggle Icon Button */}
                <button
                  onClick={() => onShowBadgeChange?.(!showBadge)}
                  className={`px-2.5 py-1 rounded-lg border text-[10px] font-bold uppercase transition-all cursor-pointer select-none ${
                    showBadge 
                      ? 'bg-fuchsia-500/20 border-fuchsia-500 text-fuchsia-300 hover:bg-fuchsia-500/30' 
                      : 'bg-slate-800/60 border-slate-700/50 text-slate-400 hover:bg-slate-700/80 hover:text-white'
                  }`}
                >
                  Badge
                </button>

                {/* Description Toggle Icon Button */}
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
                {/* Font Size decrease button */}
                <button 
                  onClick={() => onDescriptionSizeChange?.(Math.max(10, descriptionSize - 1))}
                  className="w-7 h-7 flex items-center justify-center rounded-lg bg-slate-800/60 hover:bg-slate-700/80 border border-slate-700/50 text-white font-bold text-sm cursor-pointer select-none transition-colors"
                >
                  -
                </button>
                {/* Font Size Display */}
                <span className="text-xs font-bold text-slate-300 w-6 text-center select-none">{descriptionSize}</span>
                {/* Font Size increase button */}
                <button 
                  onClick={() => onDescriptionSizeChange?.(Math.min(32, descriptionSize + 1))}
                  className="w-7 h-7 flex items-center justify-center rounded-lg bg-slate-800/60 hover:bg-slate-700/80 border border-slate-700/50 text-white font-bold text-sm cursor-pointer select-none transition-colors"
                >
                  +
                </button>

                {/* Divider */}
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

            {activePopover === 'badge' && (
              <>
                {/* Text Color option */}
                <div className="flex items-center gap-1">
                  <span className="text-[9px] font-bold text-slate-500 uppercase select-none">Txt</span>
                  <div className="relative w-6 h-6 rounded-md border border-slate-700 overflow-hidden cursor-pointer flex-shrink-0">
                    <input 
                      type="color"
                      value={badgeTextColor}
                      onChange={(e) => onBadgeTextColorChange?.(e.target.value)}
                      className="absolute inset-0 w-full h-full p-0 border-0 cursor-pointer bg-transparent"
                    />
                  </div>
                </div>

                {/* Bg Color option */}
                <div className="flex items-center gap-1">
                  <span className="text-[9px] font-bold text-slate-500 uppercase select-none">Bg</span>
                  <div className="relative w-6 h-6 rounded-md border border-slate-700 overflow-hidden cursor-pointer flex-shrink-0">
                    <input 
                      type="color"
                      value={badgeBgColor}
                      onChange={(e) => onBadgeBgColorChange?.(e.target.value)}
                      className="absolute inset-0 w-full h-full p-0 border-0 cursor-pointer bg-transparent"
                    />
                  </div>
                </div>

                {/* Border Color option */}
                <div className="flex items-center gap-1">
                  <span className="text-[9px] font-bold text-slate-500 uppercase select-none">Brd</span>
                  <div className="relative w-6 h-6 rounded-md border border-slate-700 overflow-hidden cursor-pointer flex-shrink-0">
                    <input 
                      type="color"
                      value={badgeBorderColor}
                      onChange={(e) => onBadgeBorderColorChange?.(e.target.value)}
                      className="absolute inset-0 w-full h-full p-0 border-0 cursor-pointer bg-transparent"
                    />
                  </div>
                </div>

                {/* Dot Color option */}
                <div className="flex items-center gap-1">
                  <span className="text-[9px] font-bold text-slate-500 uppercase select-none">Dot</span>
                  <div className="relative w-6 h-6 rounded-md border border-slate-700 overflow-hidden cursor-pointer flex-shrink-0">
                    <input 
                      type="color"
                      value={badgeDotColor}
                      onChange={(e) => onBadgeDotColorChange?.(e.target.value)}
                      className="absolute inset-0 w-full h-full p-0 border-0 cursor-pointer bg-transparent"
                    />
                  </div>
                </div>

                {/* Divider */}
                <div className="w-[1px] h-5 bg-slate-800"></div>

                {/* Remove Badge Button */}
                <button
                  onClick={() => { onShowBadgeChange?.(false); setActivePopover(null); setPopoverCoords(null); }}
                  className="px-2 py-1 rounded-lg border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-[10px] font-bold uppercase transition-all cursor-pointer select-none"
                >
                  Remove
                </button>
              </>
            )}
          </div>,
          document.body
        )}
      </>
    );
  }
);

WebinarMockup.displayName = 'WebinarMockup';

export default WebinarMockup;
