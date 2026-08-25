import { forwardRef } from 'react';

interface WebinarMockupProps {
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
  showBadge?: boolean;
  badgeText?: string;
  badgeBgColor?: string;
  badgeBorderColor?: string;
  badgeTextColor?: string;
  badgeDotColor?: string;
  activeTextSection?: 'heading' | 'description' | 'badge' | null;
  onSelectSection?: (section: 'heading' | 'description' | 'badge') => void;
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
    frameScale = 1,
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
    activeTextSection,
    onSelectSection,
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
    const handleTriggerClick = (
      event: React.MouseEvent<HTMLElement>,
      section: 'badge' | 'heading' | 'description'
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
                      activeTextSection === 'badge'
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

                  {activeTextSection === 'badge' && (
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
                    activeTextSection === 'heading'
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

            {/* Right Side: PDF first page / Image Screen container (dynamic sizing based on aspect ratio orientation) */}
            <div 
              className="shrink-0 aspect-[3/4] rounded-2xl overflow-hidden border border-white/20 dark:border-white/10 shadow-[0_15px_35px_rgba(0,0,0,0.4)] relative bg-slate-900/40 flex items-center justify-center group"
              style={{
                ...(isPortrait
                  ? { width: '56%', height: 'auto', backgroundColor: dominantColor || undefined }
                  : { height: '82%', width: 'auto', backgroundColor: dominantColor || undefined }),
                transform: `scale(${frameScale})`,
                transformOrigin: 'center center',
                transition: 'transform 0.45s cubic-bezier(0.34, 1.56, 0.64, 1)'
              }}
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
                            transition: 'transform 0.45s cubic-bezier(0.34, 1.56, 0.64, 1)'
                          }
                        : {
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            width: `${100 * coverScale}%`,
                            height: `${100 * coverScale}%`,
                            objectPosition: `calc(50% + ${coverLeft}) calc(50% + ${coverPosition})`,
                            transition: 'width 0.45s ease-out, height 0.45s ease-out, object-position 0.45s ease-out'
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
      </>
    );
  }
);

WebinarMockup.displayName = 'WebinarMockup';

export default WebinarMockup;
