import { forwardRef } from 'react';

interface DefaultMockupProps {
  imageUrl?: string;
  isLoading?: boolean;
  dominantColor?: string;
  objectFit?: 'contain' | 'cover';
  coverPosition?: string;
  coverLeft?: string;
  coverScale?: number;
  backgroundColor?: string;
  backgroundImage?: string;
  imageWidth?: number;
  imageHeight?: number;
  outputWidth: number;
  outputHeight: number;
}

const DefaultMockup = forwardRef<HTMLDivElement, DefaultMockupProps>(
  ({
    imageUrl,
    isLoading,
    coverPosition = '0px',
    coverLeft = '0px',
    coverScale = 1,
    backgroundColor,
    backgroundImage,
    imageWidth = 0,
    imageHeight = 0,
    outputWidth,
    outputHeight,
  }, ref) => {
    // Twist correction:
    // If height > width (portrait), place in bottom center (items-end). 
    // If height <= width (landscape), place in center (items-center).
    const isPortrait = imageHeight > imageWidth;

    return (
      <div
        ref={ref}
        className={`relative w-full overflow-hidden flex justify-center default-main-div ${
          isPortrait ? 'items-end' : 'items-center'
        }`}
        style={{ 
          aspectRatio: `${outputWidth} / ${outputHeight}`,
          width: '100%',
          backgroundColor: backgroundImage ? 'transparent' : (backgroundColor || '#0b0b18'),
          backgroundImage: backgroundImage ? `url(${backgroundImage})` : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          paddingTop: '40px',
          paddingLeft: '40px',
          paddingRight: '40px',
          paddingBottom: isPortrait ? '0px' : '40px',
          boxSizing: 'border-box'
        }}
      >
        {isLoading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-70 z-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          </div>
        ) : imageUrl ? (
          <img
            src={imageUrl}
            alt="Default content"
            className="max-w-full max-h-full object-contain"
            style={{
              transform: `scale(${coverScale}) translate(${coverLeft}, ${coverPosition})`,
              transformOrigin: isPortrait ? 'bottom center' : 'center center',
              transition: 'transform 0.075s ease-out',
            }}
            crossOrigin="anonymous"
          />
        ) : (
          /* Empty state placeholder */
          <div className="w-full h-full flex flex-col items-center justify-center p-8 bg-gradient-to-br from-indigo-950/20 via-purple-950/20 to-blue-950/20 min-h-[300px]">
            <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-4">
              <span className="text-white text-3xl">✨</span>
            </div>
            <h4 className="text-sm font-semibold text-white/80 tracking-wider uppercase mb-1">
              No Content Uploaded
            </h4>
            <p className="text-xs text-slate-400 text-center max-w-[240px]">
              Upload an image or PDF to see it rendered in the default template.
            </p>
          </div>
        )}
      </div>
    );
  }
);

DefaultMockup.displayName = 'DefaultMockup';

export default DefaultMockup;
