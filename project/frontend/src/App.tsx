import { useState, useEffect, useRef } from 'react';
import {
  Monitor,
  Sparkles,
  RotateCcw,
  AlertCircle,
  CheckCircle,
  Download,
} from 'lucide-react';
import { LaptopMockup } from './components/LaptopMockup';
import { FileUpload } from './components/FileUpload';
import { checkBackendHealth } from './utils/fileProcessor';
import html2canvas from 'html2canvas';

function App() {
  const [imageUrl, setImageUrl] = useState<string>('');
  const [dominantColor, setDominantColor] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [fileName, setFileName] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [backendStatus, setBackendStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const [objectFit, setObjectFit] = useState<'contain' | 'cover'>('contain');
  const laptopMockupRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [coverPosition, setCoverPosition] = useState('0px');
  const [coverLeft, setCoverLeft] = useState('0px'); // ✅ NEW
  const [coverScale, setCoverScale] = useState(1.0);

  useEffect(() => {
    const checkHealth = async () => {
      const isHealthy = await checkBackendHealth();
      setBackendStatus(isHealthy ? 'online' : 'offline');
    };
    
    checkHealth();
    const interval = setInterval(checkHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleFileSelect = async (file: File) => {
    setIsLoading(true);
    setFileName(file.name);
    setError('');
    setDominantColor('');

    try {
      const formData = new FormData();
      formData.append("file", file);

      const isPdf = file.type === "application/pdf";
      const endpoint = isPdf ? "extract-pdf-image" : "process-image";

      const res = await fetch(`http://localhost:8000/${endpoint}`, {
        method: "POST",
        body: formData
      });

      const data = await res.json();

      if (data.success) {
        setImageUrl(data.image_data);
        setDominantColor(data.dominant_color || '#1a1a2e');
      } else {
        throw new Error(data.detail || "Unknown error");
      }
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
    setDominantColor('');
    setCoverScale(1.0);
  };

  const handleDownload = async () => {
    if (!laptopMockupRef.current || !imageUrl) return;

    try {
      setIsDownloading(true);
      
      // Create a temporary container outside the visible DOM
      const tempDiv = document.createElement('div');
      tempDiv.style.position = 'fixed';
      tempDiv.style.left = '-9999px';
      document.body.appendChild(tempDiv);

      // Clone the mockup without React state
      const clone = laptopMockupRef.current.cloneNode(true) as HTMLElement;
      
      // Remove any loading elements from the clone
      const loadingElements = clone.querySelectorAll('.animate-spin');
      loadingElements.forEach(el => el.remove());
      
      // Force display the image in the clone with proper type casting
      const screenImg = clone.querySelector('.lapi-screen img') as HTMLImageElement | null;
      if (screenImg) {
        screenImg.style.display = 'block';
      }

      tempDiv.appendChild(clone);

      // Wait for images to load
      const images = clone.querySelectorAll('img');
      await Promise.all(Array.from(images).map(img => {
        if (img.complete) return Promise.resolve();
        return new Promise((resolve) => {
          img.onload = resolve;
          img.onerror = resolve;
        });
      }));

      const canvas = await html2canvas(clone, {
        backgroundColor: null,
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false
      });

      // Create and trigger download
      const link = document.createElement('a');
      link.download = `laptop-mockup-${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Cleanup
      document.body.removeChild(tempDiv);
    } catch (error) {
      console.error('Download failed:', error);
      setError('Download failed. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
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

      <header className="relative overflow-hidden">
        <div className="absolute inset-0"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
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
      <hr/>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-5 mt-5">
        <div className="grid lg:grid-cols-2 gap-12 items-start">
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

          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Live Preview</h2>
              <p className="text-gray-600 mb-8">
                See your content displayed on a realistic laptop mockup
              </p>
            </div>

            <div className="flex justify-center">
              <LaptopMockup
                ref={laptopMockupRef}
                imageUrl={imageUrl}
                isLoading={isLoading}
                dominantColor={dominantColor}
                objectFit={objectFit}
                coverPosition={coverPosition}
                coverLeft={coverLeft}
                coverScale={coverScale}
              />
            </div>

            {imageUrl && !isLoading && (
              <div className="flex flex-col items-center space-y-4">
                <div className="w-full space-y-4">
                  <div className="flex items-center space-x-4 bg-white p-3 rounded-lg shadow-sm">
                    <span className="text-sm font-medium text-gray-700">Image Fit:</span>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          setObjectFit('contain');
                          setCoverPosition('0px');
                          setCoverLeft('0px'); // ✅ RESET horizontal position
                        }}
                        className={`px-3 py-1 text-sm rounded-md ${
                          objectFit === 'contain'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        Contain
                      </button>
                      <button
                        onClick={() => setObjectFit('cover')}
                        className={`px-3 py-1 text-sm rounded-md ${
                          objectFit === 'cover'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        Cover
                      </button>
                    </div>
                  </div>

                  {objectFit === 'cover' && (
                    <>
                      {/* ✅ Vertical Position Input (unchanged) */}
                      <div className="bg-white p-3 rounded-lg shadow-sm">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Vertical Position:
                        </label>
                        <div className="flex items-center space-x-2">
                          <input
                            type="text"
                            value={coverPosition}
                            onChange={(e) => {
                              const value = e.target.value;
                              if (/^-?\d*\.?\d*px?$/.test(value) || value === '') {
                                setCoverPosition(value.includes('px') ? value : `${value}px`);
                              }
                            }}
                            onBlur={(e) => {
                              let value = e.target.value;
                              if (value === '') value = '0px';
                              else if (!value.endsWith('px')) value = `${value}px`;
                              const numericValue = value.replace(/[^\d.-]/g, '');
                              setCoverPosition(`${numericValue}px`);
                            }}
                            placeholder="e.g. 50px or -20px"
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          />
                          <button
                            onClick={() =>
                              setCoverPosition(`${(parseInt(coverPosition) || 0) + 10}px`)
                            }
                            className="px-3 py-2 bg-gray-100 rounded-md"
                          >
                            +10
                          </button>
                          <button
                            onClick={() =>
                              setCoverPosition(`${(parseInt(coverPosition) || 0) - 10}px`)
                            }
                            className="px-3 py-2 bg-gray-100 rounded-md"
                          >
                            -10
                          </button>
                        </div>
                      </div>

                      {/* ✅ Horizontal Position Input */}
                      <div className="bg-white p-3 rounded-lg shadow-sm">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Horizontal Position:
                        </label>
                        <div className="flex items-center space-x-2">
                          <input
                            type="text"
                            value={coverLeft}
                            onChange={(e) => {
                              const value = e.target.value;
                              if (/^-?\d*\.?\d*px?$/.test(value) || value === '') {
                                setCoverLeft(value.includes('px') ? value : `${value}px`);
                              }
                            }}
                            onBlur={(e) => {
                              let value = e.target.value;
                              if (value === '') value = '0px';
                              else if (!value.endsWith('px')) value = `${value}px`;
                              const numericValue = value.replace(/[^\d.-]/g, '');
                              setCoverLeft(`${numericValue}px`);
                            }}
                            placeholder="e.g. 30px or -15px"
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          />
                          <button
                            onClick={() =>
                              setCoverLeft(`${(parseInt(coverLeft) || 0) + 10}px`)
                            }
                            className="px-3 py-2 bg-gray-100 rounded-md"
                          >
                            +10
                          </button>
                          <button
                            onClick={() =>
                              setCoverLeft(`${(parseInt(coverLeft) || 0) - 10}px`)
                            }
                            className="px-3 py-2 bg-gray-100 rounded-md"
                          >
                            -10
                          </button>
                        </div>
                      </div>

                      <div className="my-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Zoom (Scale):
                        </label>
                        <div className="flex items-center space-x-2">
                          <input
                            type="number"
                            step={0.1}
                            min={0}
                            max={3}
                            value={coverScale}
                            onChange={(e) => {
                              const value = parseFloat(e.target.value);
                              if (!isNaN(value) && value >= 0 && value <= 3) {
                                setCoverScale(parseFloat(value.toFixed(2)));
                              }
                            }}
                            className="w-full px-3 py-2 border rounded-md"
                            placeholder="e.g. 1"
                          />
                          <button
                            onClick={() =>
                              setCoverScale((prev) => {
                                const next = parseFloat((prev + 0.1).toFixed(2));
                                return next <= 3 ? next : prev;
                              })
                            }
                            className="px-3 py-2 bg-gray-200 rounded-md"
                          >
                            +
                          </button>
                          <button
                            onClick={() =>
                              setCoverScale((prev) => {
                                const next = parseFloat((prev - 0.1).toFixed(2));
                                return next >= 0 ? next : prev;
                              })
                            }
                            className="px-3 py-2 bg-gray-200 rounded-md"
                          >
                            -
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                <button
                  onClick={handleDownload}
                  disabled={isLoading || isDownloading}
                  className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                >
                  {isDownloading ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Preparing Download...</span>
                    </div>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      <span>Download Mockup</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="bg-white border-t border-gray-200">
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
