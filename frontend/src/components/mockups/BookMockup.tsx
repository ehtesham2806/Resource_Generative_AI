import { forwardRef } from 'react';
import '../../assets/BookMockup.css';

interface BookMockupProps {
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

const BookMockup = forwardRef<HTMLDivElement, BookMockupProps>(
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
        className="relative w-full overflow-hidden flex items-center justify-center book-wrapper-div"
        style={{ 
          aspectRatio: `${outputWidth} / ${outputHeight}`,
          backgroundColor: backgroundImage ? 'transparent' : (backgroundColor || '#f0f0f0'),
          backgroundImage: backgroundImage ? `url(${backgroundImage})` : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          padding: '40px',
          boxSizing: 'border-box'
        }}
      >
        <div 
          className='w-full relative max-w-[300px] mx-auto book-main-div' 
          style={{ 
            position: 'relative', 
            top: `${frameVerticalOffset}px`,
            transform: `scale(${frameScale})`,
            transformOrigin: 'center center'
          }}
        >
          {/* Book base image */}
        <img
          src="/Book.png"
          alt="Book mockup"
          className="w-full h-auto"
        />

        {/* Cover area */}
        <div
          className="absolute book-cover overflow-hidden"
          style={{ backgroundColor: dominantColor || '#ffffff' }}
        >
          {isLoading ? (
            <div className="w-full h-full flex items-center justify-center bg-black bg-opacity-50">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            </div>
          ) : imageUrl ? (
            <div className="relative w-full h-full overflow-hidden">
              <img
                src={imageUrl}
                alt="Book cover content"
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
    );
  }
);

BookMockup.displayName = 'BookMockup';

export default BookMockup;