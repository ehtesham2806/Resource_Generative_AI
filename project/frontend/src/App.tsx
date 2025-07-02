import React, { useState, useEffect } from 'react';
import { Monitor, Sparkles, RotateCcw, AlertCircle, CheckCircle } from 'lucide-react';
import { LaptopMockup } from './components/LaptopMockup';
import { FileUpload } from './components/FileUpload';
import { processFile, checkBackendHealth } from './utils/fileProcessor';

function App() {
  const [imageUrl, setImageUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [fileName, setFileName] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [backendStatus, setBackendStatus] = useState<'checking' | 'online' | 'offline'>('checking');

  // Check backend health on component mount
  useEffect(() => {
    const checkHealth = async () => {
      const isHealthy = await checkBackendHealth();
      setBackendStatus(isHealthy ? 'online' : 'offline');
    };
    
    checkHealth();
    
    // Check health every 30 seconds
    const interval = setInterval(checkHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleFileSelect = async (file: File) => {
    setIsLoading(true);
    setFileName(file.name);
    setError('');
    
    try {
      const processedImageUrl = await processFile(file);
      setImageUrl(processedImageUrl);
    } catch (error) {
      console.error('Error processing file:', error);
      setError(error instanceof Error ? error.message : 'Error processing file. Please try again.');
      setImageUrl('');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setImageUrl('');
    setFileName('');
    setIsLoading(false);
    setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Backend Status Banner */}
      {backendStatus !== 'online' && (
        <div className={`w-full px-4 py-3 text-center text-sm font-medium ${
          backendStatus === 'checking' 
            ? 'bg-yellow-100 text-yellow-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          {backendStatus === 'checking' ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-600"></div>
              <span>Checking backend connection...</span>
            </div>
          ) : (
            <div className="flex items-center justify-center space-x-2">
              <AlertCircle className="w-4 h-4" />
              <span>Backend server is offline. Please start the Python server: <code className="bg-red-200 px-1 rounded">cd backend && python run.py</code></span>
            </div>
          )}
        </div>
      )}

      {/* Header */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="flex justify-center items-center space-x-3 mb-6">
              <div className="p-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-lg">
                <Monitor className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                AI Display Studio
              </h1>
              <Sparkles className="w-6 h-6 text-purple-500 animate-pulse" />
            </div>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Transform your images and PDFs into stunning laptop displays with Python-powered PDF extraction
            </p>
            
            {/* Backend Status Indicator */}
            <div className="mt-4 flex justify-center">
              <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full text-sm ${
                backendStatus === 'online' 
                  ? 'bg-green-100 text-green-800' 
                  : backendStatus === 'checking'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-red-100 text-red-800'
              }`}>
                {backendStatus === 'online' ? (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    <span>Python Backend Online</span>
                  </>
                ) : backendStatus === 'checking' ? (
                  <>
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-yellow-600"></div>
                    <span>Connecting...</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-4 h-4" />
                    <span>Backend Offline</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Upload Section */}
          <div className="space-y-8">
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Upload Your Content</h2>
                <p className="text-gray-600">
                  Select an image or PDF file to display on the laptop screen
                </p>
              </div>
              
              <FileUpload 
                onFileSelect={handleFileSelect} 
                isLoading={isLoading} 
                disabled={backendStatus !== 'online'}
              />
              
              {fileName && (
                <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                      <span className="text-sm font-medium text-blue-900">
                        {fileName}
                      </span>
                    </div>
                    <button
                      onClick={handleReset}
                      className="p-1 hover:bg-blue-100 rounded-full transition-colors"
                      title="Reset"
                    >
                      <RotateCcw className="w-4 h-4 text-blue-600" />
                    </button>
                  </div>
                </div>
              )}

              {error && (
                <div className="mt-4 p-4 bg-red-50 rounded-lg border border-red-200">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <span className="text-2xl">🖼️</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">Image Processing</h3>
                <p className="text-sm text-gray-600">
                  Upload JPG, PNG, GIF with Python-powered optimization
                </p>
              </div>
              
              <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                  <span className="text-2xl">📄</span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">PDF Extraction</h3>
                <p className="text-sm text-gray-600">
                  High-quality first page extraction using PyMuPDF
                </p>
              </div>
            </div>
          </div>

          {/* Display Section */}
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Live Preview</h2>
              <p className="text-gray-600 mb-8">
                See your content displayed on a realistic laptop mockup
              </p>
            </div>
            
            <div className="flex justify-center">
              <LaptopMockup imageUrl={imageUrl} isLoading={isLoading} />
            </div>
            
            {imageUrl && !isLoading && (
              <div className="text-center">
                <div className="inline-flex items-center space-x-2 bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-medium">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Successfully processed and displayed</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-500">
            <p>&copy; 2025 AI Display Studio. Powered by Python + React architecture.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;