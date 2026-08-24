import { forwardRef } from 'react';

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
  activeTextSection?: 'heading' | 'description' | 'badge' | null;
  onSelectSection?: (section: 'heading' | 'description') => void;
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
    activeTextSection,
    onSelectSection,
    onHeadingChange,
    onHeadingColorChange,
    onHeadingSizeChange,
    onDescriptionChange,
    onDescriptionColorChange,
    onDescriptionSizeChange,
    onShowDescriptionChange,
  }, ref) => {
    const handleTriggerClick = (
      event: React.MouseEvent<HTMLElement>,
      section: 'heading' | 'description'
    ) => {
      event.stopPropagation();
      onSelectSection?.(section);
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

                {activeTextSection === 'heading' && (
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
                      activeTextSection === 'description'
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

                  {activeTextSection === 'description' && (
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
      </>
    );
  }
);

GuideMockup.displayName = 'GuideMockup';

export default GuideMockup;
