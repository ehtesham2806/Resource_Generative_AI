import React, { useCallback, useState } from 'react';
import { Upload, FileImage, FileText, X } from 'lucide-react';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  isLoading: boolean;
  disabled?: boolean;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect, isLoading, disabled = false }) => {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragOver(true);
    }
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    if (disabled) return;
    
    const files = Array.from(e.dataTransfer.files);
    const validFile = files.find(file => 
      file.type.startsWith('image/') || file.type === 'application/pdf'
    );
    
    if (validFile) {
      onFileSelect(validFile);
    }
  }, [onFileSelect, disabled]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && !disabled) {
      onFileSelect(file);
    }
  }, [onFileSelect, disabled]);

  const isDisabled = isLoading || disabled;

  return (
    <div className="w-full max-w-md mx-auto">
      <div
        className={`
          relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300
          ${isDragOver && !isDisabled
            ? 'border-blue-500 bg-blue-50 scale-105' 
            : isDisabled
            ? 'border-gray-200 bg-gray-50 opacity-50'
            : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
          }
          ${isDisabled ? 'cursor-not-allowed' : 'cursor-pointer'}
        `}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !isDisabled && document.getElementById('file-input')?.click()}
      >
        <input
          id="file-input"
          type="file"
          accept="image/*,.pdf"
          onChange={handleFileInput}
          className="hidden"
          disabled={isDisabled}
        />
        
        <div className="space-y-4">
          <div className="flex justify-center space-x-2">
            <div className={`p-3 rounded-full transition-colors ${
              isDragOver && !isDisabled ? 'bg-blue-100' : 'bg-gray-100'
            }`}>
              <Upload className={`w-6 h-6 ${
                isDragOver && !isDisabled ? 'text-blue-600' : 'text-gray-600'
              }`} />
            </div>
          </div>
          
          <div>
            <p className="text-lg font-medium text-gray-900 mb-2">
              {isDisabled 
                ? (disabled ? 'Backend server required' : 'Processing...')
                : 'Drop your file here or click to browse'
              }
            </p>
            <p className="text-sm text-gray-500">
              {isDisabled 
                ? (disabled ? 'Please start the Python backend server' : 'Please wait while processing')
                : 'Supports images (JPG, PNG, GIF) and PDF files'
              }
            </p>
          </div>
          
          {!isDisabled && (
            <div className="flex justify-center space-x-4 text-xs text-gray-400">
              <div className="flex items-center space-x-1">
                <FileImage className="w-4 h-4" />
                <span>Images</span>
              </div>
              <div className="flex items-center space-x-1">
                <FileText className="w-4 h-4" />
                <span>PDF</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};