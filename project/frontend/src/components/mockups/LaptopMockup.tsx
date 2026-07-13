import { forwardRef } from 'react';

interface LaptopMockupProps {
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
}

const LaptopMockup = forwardRef<HTMLDivElement, LaptopMockupProps>(
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
  }, ref) => {
    return (
      <div
        ref={ref}
        className="relative w-full overflow-hidden flex items-center justify-center laptop-main-div"
        style={{ 
          aspectRatio: `${outputWidth} / ${outputHeight}`,
          backgroundColor: backgroundImage ? 'transparent' : (backgroundColor || '#f0f0f0'),
          backgroundImage: backgroundImage ? `url(${backgroundImage})` : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        <div className="relative w-full max-w-[500px] p-4 flex items-center justify-center">
          <div className="relative w-full">
            {/* Laptop base image */}
            <img
              src="/Lapi.png"
              alt="Laptop mockup"
              className="w-full h-auto"
            />

            {/* Screen area */}
            <div
              className="absolute lapi-screen overflow-hidden"
              style={{ backgroundColor: dominantColor || '#1a1a2e' }}
            >
              {isLoading ? (
                <div className="w-full h-full flex items-center justify-center bg-black bg-opacity-50">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                </div>
              ) : imageUrl ? (
                <div className="relative w-full h-full overflow-hidden">
                  <img
                    src={imageUrl}
                    alt="Display content"
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
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-900 to-purple-900">
                  {/* Default empty state */}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }
);

LaptopMockup.displayName = 'LaptopMockup';

export default LaptopMockup;