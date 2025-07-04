import React from 'react';

interface LaptopMockupProps {
  imageUrl?: string;
  isLoading?: boolean;
}

export const LaptopMockup: React.FC<LaptopMockupProps> = ({ imageUrl, isLoading }) => {
  return (
    <div className="relative max-w-2xl mx-auto">
      {/* Base laptop image */}
      <div className="relative">
        <img 
          src="/Lapi.png"
          alt="Laptop mockup"
          className="w-full h-auto"
        />
        
        {/* Overlay content on the laptop screen with your exact CSS positioning */}
        <div 
          className="absolute flex items-center justify-center lapi-screen"
          style={{
            
          }}
        >
          {isLoading ? (
            <div className="w-full h-full bg-black bg-opacity-50 flex items-center justify-center">
              <div className="flex flex-col items-center space-y-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                <p className="text-white text-sm font-medium">Processing...</p>
              </div>
            </div>
          ) : imageUrl ? (
            <img
              src={imageUrl}
              alt="Uploaded content"
              className="w-full h-full object-contain"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-blue-900 to-purple-900 flex items-center justify-center">
              <div className="text-center text-gray-300">
                <div className="w-12 h-12 mx-auto mb-3 opacity-70">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>
                  </svg>
                </div>
                <p className="text-xs font-medium">Upload content</p>
                <p className="text-xs opacity-75 mt-1">Image or PDF</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};