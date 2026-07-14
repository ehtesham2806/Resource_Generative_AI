import { forwardRef } from 'react';

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
    badgeBgColor = 'rgba(217, 70, 239, 0.15)',
    badgeBorderColor = 'rgba(217, 70, 239, 0.2)',
    badgeTextColor = '#d946ef',
    badgeDotColor = '#d946ef',
  }, ref) => {
    const isPortrait = outputHeight > outputWidth;

    return (
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
              <div 
                className="inline-flex items-center space-x-2 px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase border mb-4"
                style={{
                  backgroundColor: badgeBgColor,
                  borderColor: badgeBorderColor,
                  color: badgeTextColor,
                }}
              >
                <span 
                  className="w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: badgeDotColor }}
                ></span>
                <span>{badgeText}</span>
              </div>
            )}

            {/* Heading */}
            <h1 
              className="font-extrabold tracking-tight mb-3 font-['Outfit'] leading-tight break-words"
              style={{
                color: headingColor,
                fontSize: `${headingSize}px`,
              }}
            >
              {heading || 'Webinar Title'}
            </h1>

            {/* Description - Optional & Truncated to max 100 characters */}
            {description ? (
              <p 
                className="font-medium leading-relaxed break-words"
                style={{
                  color: descriptionColor,
                  fontSize: `${descriptionSize}px`,
                }}
              >
                {description.slice(0, 100)}
              </p>
            ) : null}
          </div>

          {/* Right Side: PDF first page / Image Screen container (dynamic sizing based on aspect ratio orientation) */}
          <div 
            className="shrink-0 aspect-[3/4] rounded-2xl overflow-hidden border border-white/20 dark:border-white/10 shadow-[0_15px_35px_rgba(0,0,0,0.4)] relative bg-slate-900/40 backdrop-blur-md flex items-center justify-center group"
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
    );
  }
);

WebinarMockup.displayName = 'WebinarMockup';

export default WebinarMockup;
