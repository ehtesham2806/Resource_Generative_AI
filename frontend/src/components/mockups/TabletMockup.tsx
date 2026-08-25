import { forwardRef } from 'react';

interface TabletMockupProps {
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

const TabletMockup = forwardRef<HTMLDivElement, TabletMockupProps>(
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
        className="relative w-full flex items-center justify-center overflow-hidden rounded-xl tablet-main-div"
        style={{ 
          aspectRatio: `${outputWidth} / ${outputHeight}`,
          backgroundColor: backgroundImage ? 'transparent' : (backgroundColor || '#0b0b18'),
          backgroundImage: backgroundImage ? `url(${backgroundImage})` : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        {/* Soft background glow */}
        <div className="absolute w-[320px] h-[320px] rounded-full bg-indigo-500/10 blur-[120px] pointer-events-none"></div>
        <div className="absolute w-[260px] h-[260px] rounded-full bg-cyan-500/10 blur-[100px] pointer-events-none"></div>

        {/* Tablet Device container */}
        <div 
          className="relative h-[88%] aspect-[1/1.38] rounded-[12px] border-[6px] border-[#181826] bg-[#0c0c1b] shadow-[0_25px_65px_-15px_rgba(0,0,0,0.85),_0_0_50px_rgba(6,182,212,0.06)] flex flex-col overflow-hidden"
          style={{ 
            boxSizing: 'border-box', 
            position: 'relative', 
            top: `${frameVerticalOffset}px`,
            transform: `scale(${frameScale})`,
            transformOrigin: 'center center',
            transition: 'top 0.45s cubic-bezier(0.34, 1.56, 0.64, 1), transform 0.45s cubic-bezier(0.34, 1.56, 0.64, 1)'
          }}
        >
          {/* Top Camera Dot */}
          <div className="absolute top-[6px] left-1/2 -translate-x-1/2 w-[8px] h-[8px] rounded-full bg-[#08080f] z-30 flex items-center justify-center shadow-inner">
            <div className="w-[3px] h-[3px] rounded-full bg-blue-900"></div>
          </div>

          {/* Screen area */}
          <div
            className="relative w-full h-full overflow-hidden rounded-[8px]"
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
                  alt="Tablet display content"
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
              /* Sleek gradient background matching tablet */
              <div className="w-full h-full flex flex-col justify-between p-8 bg-gradient-to-tr from-[#1e3a8a] via-[#3b82f6] to-[#06b6d4] box-border relative overflow-hidden">
                <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, transparent 0%, rgba(0,0,0,0.25) 100%)' }}></div>
                <div className="absolute -top-16 -right-16 w-44 h-44 bg-cyan-400/20 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-16 -left-16 w-44 h-44 bg-indigo-500/25 rounded-full blur-3xl"></div>

                <div className="mt-12 flex flex-col items-center text-center z-10">
                  <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center shadow-xl border border-white/20">
                    <span className="text-white text-lg">💻</span>
                  </div>
                </div>

                <div className="mb-8 text-center z-10">
                  <h4 className="text-xs font-semibold text-white/60 tracking-widest uppercase mb-1">
                    Craftora
                  </h4>
                  <p className="text-[10px] text-white/80">
                    Tablet Screen Preview
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

TabletMockup.displayName = 'TabletMockup';

export default TabletMockup;
