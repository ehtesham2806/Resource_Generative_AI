import React, { forwardRef } from 'react';

interface LaptopMockupProps {
  imageUrl?: string;
  isLoading?: boolean;
  dominantColor?: string;
  objectFit?: 'contain' | 'cover';
}

export const LaptopMockup = forwardRef<HTMLDivElement, LaptopMockupProps>(
  ({ imageUrl, isLoading, dominantColor, objectFit = 'contain' }, ref) => {
    return (
      <div ref={ref} className="relative max-w-2xl mx-auto">
        {/* Laptop base image */}
        <img 
          src="/Lapi.png"
          alt="Laptop mockup"
          className="w-full h-auto"
        />
        
        {/* Screen area - using your exact .lapi-screen class */}
        <div className="absolute lapi-screen overflow-hidden flex items-center justify-center"
          style={{ backgroundColor: dominantColor || '#1a1a2e' }}>
          
          {isLoading ? (
            <div className="w-full h-full flex items-center justify-center bg-black bg-opacity-50">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            </div>
          ) : imageUrl ? (
            <div className="relative w-full h-full">
              <img
                src={imageUrl}
                alt="Display content"
                className={`absolute inset-0 m-auto ${objectFit === 'contain' ? 
                  'object-contain max-w-full max-h-full w-auto h-auto' : 
                  'object-cover'}`}
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

LaptopMockup.displayName = 'LaptopMockup';