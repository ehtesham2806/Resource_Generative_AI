import { forwardRef } from 'react';

interface PhoneMockupProps {
  imageUrl?: string;
  isLoading?: boolean;
  dominantColor?: string;
  objectFit?: 'contain' | 'cover';
  coverPosition?: string;
  coverLeft?: string;
  coverScale?: number;
  frameVerticalOffset?: number;
  frameScale?: number;
  backgroundColor?: string;
  backgroundImage?: string;
  outputWidth: number;
  outputHeight: number;
}

const PhoneMockup = forwardRef<HTMLDivElement, PhoneMockupProps>(
  ({
    imageUrl,
    isLoading,
    dominantColor,
    objectFit = 'contain',
    coverPosition = '0px',
    coverLeft = '0px',
    coverScale = 1,
    frameVerticalOffset = 0,
    frameScale = 1,
    backgroundColor,
    backgroundImage,
    outputWidth,
    outputHeight,
  }, ref) => {
    return (
      <div
        ref={ref}
        className="relative w-full flex items-center justify-center overflow-hidden rounded-xl phone-main-div"
        style={{ 
          aspectRatio: `${outputWidth} / ${outputHeight}`,
          backgroundColor: backgroundImage ? 'transparent' : (backgroundColor || '#0b0b18'),
          backgroundImage: backgroundImage ? `url(${backgroundImage})` : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        {/* Soft back glowing highlight behind phone */}
        <div className="absolute w-[280px] h-[280px] rounded-full bg-blue-500/10 blur-[100px] pointer-events-none"></div>
        <div className="absolute w-[220px] h-[340px] rounded-full bg-purple-500/10 blur-[120px] pointer-events-none"></div>

        {/* Smartphone Device container */}
        <div 
          className="relative h-[90%] aspect-[1061/1408] phone-container"
          style={{ 
            position: 'relative', 
            top: `${frameVerticalOffset}px`,
            transform: `scale(${frameScale})`,
            transformOrigin: 'center center'
          }}
        >
          {/* Phone base image */}
          <img
            src="/Mobile.png"
            alt="Phone mockup"
            className="w-full h-full object-contain pointer-events-none select-none z-10 relative"
          />

          {/* Screen area */}
          <div
            className="phone-screen"
            style={{ backgroundColor: dominantColor || '#0c0c1d' }}
          >
            {/* Dynamic Island / Pill Notch */}
            <div className="phone-notch" />

            {isLoading ? (
              <div className="w-full h-full flex items-center justify-center bg-black bg-opacity-70 z-10">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
              </div>
            ) : imageUrl ? (
              <div className="relative w-full h-full overflow-hidden">
                <img
                  src={imageUrl}
                  alt="Phone display content"
                  className={`absolute left-0 right-0 mx-auto w-full h-full transition-transform duration-75 ${
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
              /* Gorgeous default gradient theme matching the screenshot phone */
              <div className="w-full h-full flex flex-col justify-between p-6 bg-gradient-to-b from-[#4e65ff] via-[#925ff3] to-[#7015f7] box-border relative overflow-hidden">
                <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, transparent 0%, rgba(0,0,0,0.3) 100%)' }}></div>
                <div className="absolute -top-12 -left-12 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
                <div className="absolute -bottom-16 -right-16 w-36 h-36 bg-blue-400/20 rounded-full blur-3xl"></div>

                <div className="mt-8 flex flex-col items-center text-center z-10">
                  <div className="w-10 h-10 rounded-full bg-white/15 backdrop-blur-md flex items-center justify-center shadow-lg border border-white/20">
                    <span className="text-white text-base">✨</span>
                  </div>
                </div>

                <div className="mb-6 text-center z-10">
                  <h4 className="text-xs font-semibold text-white/50 tracking-widest uppercase mb-1">
                    AI Studio
                  </h4>
                  <p className="text-[10px] text-white/70">
                    Device Preview Mode
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
);

PhoneMockup.displayName = 'PhoneMockup';

export default PhoneMockup;
