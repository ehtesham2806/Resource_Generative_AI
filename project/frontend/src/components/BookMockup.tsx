import { forwardRef } from 'react';
import '../assets/BookMockup.css';

interface BookMockupProps {
  imageUrl?: string;
  isLoading?: boolean;
  dominantColor?: string;
  objectFit?: 'contain' | 'cover';
  coverPosition?: string;
  coverLeft?: string;
  coverScale?: number;
  backgroundColor?: string;
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
    backgroundColor,
  }, ref) => {
    return (
      <div
        ref={ref}
        className="relative max-w-2xl mx-auto book-main-div"
        style={{ backgroundColor: backgroundColor || '#f0f0f0' }}
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
            <div className="relative w-full h-full">
              <img
                src={imageUrl}
                alt="Book cover content"
                className={`absolute left-0 right-0 mx-auto ${
                  objectFit === 'contain'
                    ? 'object-contain max-w-full max-h-full w-auto h-auto'
                    : 'object-cover'
                }`}
                style={{
                  top: objectFit === 'cover' ? coverPosition : '50%',
                  left: objectFit === 'cover' ? coverLeft : '50%',
                  transform:
                    objectFit === 'contain'
                      ? `translate(-50%, -50%) scale(${coverScale})`
                      : `scale(${coverScale})`,
                }}
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
    );
  }
);

BookMockup.displayName = 'BookMockup';

export default BookMockup;