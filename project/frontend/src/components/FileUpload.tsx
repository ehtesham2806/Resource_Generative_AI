import React, { useCallback, useState } from 'react';
import { Upload, FileImage, FileText } from 'lucide-react';

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
          relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 group
          ${isDragOver && !isDisabled
            ? 'border-indigo-500 bg-indigo-500/10 scale-[1.02] shadow-[0_0_25px_rgba(99,102,241,0.15)]' 
            : isDisabled
            ? 'border-slate-200 dark:border-[#1c1c38] bg-slate-100/50 dark:bg-[#0c0c1c]/40 opacity-50'
            : 'border-slate-200 dark:border-indigo-500/30 bg-slate-50/50 dark:bg-[#0c0c1c]/30 hover:border-indigo-500/70 hover:bg-indigo-500/5 dark:hover:bg-indigo-500/5'
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
              isDragOver && !isDisabled ? 'bg-indigo-500/20 text-brand' : 'bg-indigo-500/10 text-brand group-hover:bg-indigo-500/20'
            }`}>
              <Upload className="w-6 h-6" />
            </div>
          </div>
          
          <div>
            <p className={`text-base font-semibold transition-colors mb-2 ${
              isDragOver && !isDisabled ? 'text-indigo-600 dark:text-white' : 'text-slate-700 dark:text-slate-200 group-hover:text-slate-900 dark:group-hover:text-white'
            }`}>
              {isDisabled 
                ? (disabled ? 'Backend server required' : 'Processing...')
                : 'Drop your file here or click to browse'
              }
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {isDisabled 
                ? (disabled ? 'Please start the Python backend server' : 'Please wait while processing')
                : 'Supports images (JPG, PNG, GIF) and PDF files'
              }
            </p>
          </div>
          
          {!isDisabled && (
            <div className="flex justify-center space-x-4 text-xs text-slate-500 dark:text-slate-400">
              <div className="flex items-center space-x-1.5 hover:text-slate-800 dark:hover:text-slate-300">
                <FileImage className="w-3.5 h-3.5 text-brand dark:text-brand" />
                <span>Images</span>
              </div>
              <div className="flex items-center space-x-1.5 hover:text-slate-800 dark:hover:text-slate-300">
                <FileText className="w-3.5 h-3.5 text-brand dark:text-brand" />
                <span>PDF</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};