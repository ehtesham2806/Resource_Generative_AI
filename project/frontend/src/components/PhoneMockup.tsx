import { forwardRef } from 'react';

interface PhoneMockupProps {
  imageUrl?: string;
  isLoading?: boolean;
  dominantColor?: string;
  objectFit?: 'contain' | 'cover';
  coverPosition?: string;
  coverLeft?: string;
  coverScale?: number;
  backgroundColor?: string;
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
    backgroundColor,
  }, ref) => {
    return (
      <div
        ref={ref}
        className="relative w-full aspect-[3/2] flex items-center justify-center overflow-hidden rounded-xl phone-main-div"
        style={{ backgroundColor: backgroundColor || '#0b0b18' }}
      >
        {/* Soft back glowing highlight behind phone */}
        <div className="absolute w-[280px] h-[280px] rounded-full bg-blue-500/10 blur-[100px] pointer-events-none"></div>
        <div className="absolute w-[220px] h-[340px] rounded-full bg-purple-500/10 blur-[120px] pointer-events-none"></div>

        {/* Smartphone Device container */}
        <div 
          className="relative h-[85%] aspect-[1/2.05] rounded-[42px] border-[10px] border-[#181826] bg-[#0c0c1b] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8),_0_0_40px_rgba(99,102,241,0.08)] flex flex-col overflow-hidden"
          style={{ boxSizing: 'border-box' }}
        >
          {/* Dynamic Island / Pill Notch */}
          <div className="absolute top-[12px] left-1/2 -translate-x-1/2 w-[76px] h-[18px] bg-[#07070c] rounded-full z-30 flex items-center justify-end px-[5px] box-border shadow-inner">
            {/* Small camera sensor reflection */}
            <div className="w-[6px] h-[6px] rounded-full bg-[#1e293b] border border-blue-950"></div>
          </div>

          {/* Screen area */}
          <div
            className="relative w-full h-full overflow-hidden rounded-[32px]"
            style={{ backgroundColor: dominantColor || '#0c0c1d' }}
          >
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
