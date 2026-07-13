import { useState, useEffect, useRef } from 'react';
import {
  Monitor,
  Sparkles,
  RotateCcw,
  AlertCircle,
  CheckCircle,
  Download,
  BookOpen,
  Laptop,
  Smartphone,
  Tablet as TabletIcon,
  Plus,
  Minus,
  Maximize2,
  Zap,
  FileText,
  Image as ImageIcon,
  ExternalLink,
  HelpCircle,
  Tv,
  Sliders,
  ChevronDown,
  Check,
  Sun,
  Moon,
} from 'lucide-react';
import LaptopMockup from './components/LaptopMockup.tsx';
import BookMockup from './components/BookMockup.tsx';
import PhoneMockup from './components/PhoneMockup.tsx';
import TabletMockup from './components/TabletMockup.tsx';
import DefaultMockup from './components/DefaultMockup.tsx';
import { FileUpload } from './components/FileUpload';
import { checkBackendHealth } from './utils/fileProcessor';
import html2canvas from 'html2canvas';
import * as htmlToImage from 'html-to-image';
import { DROPDOWN_OPTIONS } from './utils/brands';
import { SearchableBrandDropdown } from './components/SearchableBrandDropdown';

function App() {
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme');
      if (saved === 'light' || saved === 'dark') return saved;
    }
    return 'dark'; // default
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const [imageUrl, setImageUrl] = useState<string>('');
  const [dominantColor, setDominantColor] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [fileName, setFileName] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [backendStatus, setBackendStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const [objectFit, setObjectFit] = useState<'contain' | 'cover'>('contain');
  
  const defaultMockupRef = useRef<HTMLDivElement>(null);
  const laptopMockupRef = useRef<HTMLDivElement>(null);
  const bookMockupRef = useRef<HTMLDivElement>(null);
  const phoneMockupRef = useRef<HTMLDivElement>(null);
  const tabletMockupRef = useRef<HTMLDivElement>(null);
  
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [coverPosition, setCoverPosition] = useState<string>('0px');
  const [coverLeft, setCoverLeft] = useState<string>('0px');
  const [coverScale, setCoverScale] = useState<number>(1.0);
  const [outputWidth, setOutputWidth] = useState<number>(1200);
  const [outputHeight, setOutputHeight] = useState<number>(800);
  const [backgroundColor, setBackgroundColor] = useState<string>('#0b0b18');
  const [backgroundImage, setBackgroundImage] = useState<string>('');
  const [mockupTemplate, setMockupTemplate] = useState<string>('default');
  const [selectedBrand, setSelectedBrand] = useState<string>('');
  const [imageWidth, setImageWidth] = useState<number>(0);
  const [imageHeight, setImageHeight] = useState<number>(0);

  const [exportScale, setExportScale] = useState<number>(1);
  const [isScaleDropdownOpen, setIsScaleDropdownOpen] = useState<boolean>(false);
  const [isHeaderScaleDropdownOpen, setIsHeaderScaleDropdownOpen] = useState<boolean>(false);

  const bottomScaleDropdownRef = useRef<HTMLDivElement>(null);
  const headerScaleDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        bottomScaleDropdownRef.current &&
        !bottomScaleDropdownRef.current.contains(event.target as Node)
      ) {
        setIsScaleDropdownOpen(false);
      }
      if (
        headerScaleDropdownRef.current &&
        !headerScaleDropdownRef.current.contains(event.target as Node)
      ) {
        setIsHeaderScaleDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
      formData.append('file', file);

      const isPdf = file.type === 'application/pdf';
      const endpoint = isPdf ? 'extract-pdf-image' : 'process-image';

      const res = await fetch(`http://localhost:8000/${endpoint}`, {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (data.success) {
        setImageUrl(data.image_data);
        setDominantColor(data.dominant_color || '#1a1a2e');
        if (data.image_size) {
          setImageWidth(data.image_size.width);
          setImageHeight(data.image_size.height);
        }
      } else {
        throw new Error(data.detail || 'Unknown error');
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
    setCoverPosition('0px');
    setCoverLeft('0px');
    setSelectedBrand('');
    setImageWidth(0);
    setImageHeight(0);
  };

  const handleBrandChange = (brandKey: string) => {
    setSelectedBrand(brandKey);
    if (brandKey && DROPDOWN_OPTIONS[brandKey]) {
      const brand = DROPDOWN_OPTIONS[brandKey];
      setOutputWidth(brand.width);
      setOutputHeight(brand.height);
      setBackgroundColor(brand.bgcolor);
    }
  };

  const handleDownload = async () => {
    if (mockupTemplate === 'default') {
      await downloadDefaultMockup();
    } else if (mockupTemplate === 'laptop') {
      await downloadLaptopMockup();
    } else if (mockupTemplate === 'book') {
      await downloadBookMockup();
    } else if (mockupTemplate === 'phone') {
      await downloadPhoneMockup();
    } else if (mockupTemplate === 'tablet') {
      await downloadTabletMockup();
    }
  };

  const drawCanvasBackground = async (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    if (backgroundImage) {
      const img = new Image();
      img.src = backgroundImage;
      await new Promise<void>((resolve) => {
        img.onload = () => resolve();
        img.onerror = () => resolve();
      });
      const imgRatio = img.width / img.height;
      const canvasRatio = width / height;
      let sWidth = img.width;
      let sHeight = img.height;
      let sx = 0;
      let sy = 0;
      
      if (imgRatio > canvasRatio) {
        sWidth = img.height * canvasRatio;
        sx = (img.width - sWidth) / 2;
      } else {
        sHeight = img.width / canvasRatio;
        sy = (img.height - sHeight) / 2;
      }
      ctx.drawImage(img, sx, sy, sWidth, sHeight, 0, 0, width, height);
    } else if (backgroundColor !== 'transparent') {
      ctx.fillStyle = backgroundColor || '#0b0b18';
      ctx.fillRect(0, 0, width, height);
    } else {
      ctx.clearRect(0, 0, width, height);
    }
  };

  // ==============================
  // DEFAULT MOCKUP (html-to-image)
  // ==============================
  const downloadDefaultMockup = async () => {
    if (!defaultMockupRef.current || !imageUrl) return;

    try {
      setIsDownloading(true);

      const images = defaultMockupRef.current.querySelectorAll(
        'img'
      ) as NodeListOf<HTMLImageElement>;

      await Promise.all(
        Array.from(images).map((img) => {
          if (img.complete) return Promise.resolve();

          return new Promise((resolve) => {
            img.onload = resolve;
            img.onerror = resolve;
          });
        })
      );

      const canvas = await htmlToImage.toCanvas(defaultMockupRef.current, {
        backgroundColor: undefined,
        pixelRatio: 2 * exportScale,
        filter: (element) => {
          if (element instanceof HTMLElement) {
            return !element.classList.contains('animate-spin');
          }
          return true;
        },
      });

      const finalCanvas = document.createElement('canvas');
      finalCanvas.width = outputWidth * exportScale;
      finalCanvas.height = outputHeight * exportScale;

      const ctx = finalCanvas.getContext('2d');

      if (ctx) {
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        await drawCanvasBackground(ctx, outputWidth * exportScale, outputHeight * exportScale);

        const scaleX = (outputWidth * exportScale) / canvas.width;
        const scaleY = (outputHeight * exportScale) / canvas.height;
        const scale = Math.min(scaleX, scaleY);

        const scaledWidth = canvas.width * scale;
        const scaledHeight = canvas.height * scale;

        const x = (outputWidth * exportScale - scaledWidth) / 2;
        const y = (outputHeight * exportScale - scaledHeight) / 2;

        ctx.drawImage(canvas, x, y, scaledWidth, scaledHeight);
      }

      const link = document.createElement('a');
      link.download = `default-mockup-${Date.now()}-${exportScale}x.png`;
      link.href = finalCanvas.toDataURL('image/png');

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Default download failed:', error);
      setError('Default download failed. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  // ==============================
  // LAPTOP MOCKUP (html2canvas)
  // ==============================
  const downloadLaptopMockup = async () => {
    if (!laptopMockupRef.current || !imageUrl) return;

    try {
      setIsDownloading(true);

      const images = laptopMockupRef.current.querySelectorAll(
        'img'
      ) as NodeListOf<HTMLImageElement>;

      await Promise.all(
        Array.from(images).map((img) => {
          if (img.complete) return Promise.resolve();

          return new Promise((resolve) => {
            img.onload = resolve;
            img.onerror = resolve;
          });
        })
      );

      const canvas = await htmlToImage.toCanvas(laptopMockupRef.current, {
        backgroundColor: undefined,
        pixelRatio: 2 * exportScale,
        filter: (element) => {
          if (element instanceof HTMLElement) {
            return !element.classList.contains('animate-spin');
          }
          return true;
        },
      });

      const finalCanvas = document.createElement('canvas');
      finalCanvas.width = outputWidth * exportScale;
      finalCanvas.height = outputHeight * exportScale;

      const ctx = finalCanvas.getContext('2d');

      if (ctx) {
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        await drawCanvasBackground(ctx, outputWidth * exportScale, outputHeight * exportScale);

        const scaleX = (outputWidth * exportScale) / canvas.width;
        const scaleY = (outputHeight * exportScale) / canvas.height;
        const scale = Math.min(scaleX, scaleY);

        const scaledWidth = canvas.width * scale;
        const scaledHeight = canvas.height * scale;

        const x = (outputWidth * exportScale - scaledWidth) / 2;
        const y = (outputHeight * exportScale - scaledHeight) / 2;

        ctx.drawImage(canvas, x, y, scaledWidth, scaledHeight);
      }

      const link = document.createElement('a');
      link.download = `laptop-mockup-${Date.now()}-${exportScale}x.png`;
      link.href = finalCanvas.toDataURL('image/png');

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Laptop download failed:', error);
      setError('Laptop download failed. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  // ==============================
  // BOOK MOCKUP (html-to-image)
  // ==============================
  const downloadBookMockup = async () => {
    if (!bookMockupRef.current || !imageUrl) return;

    try {
      setIsDownloading(true);

      // Wait for images
      const images = bookMockupRef.current.querySelectorAll(
        'img'
      ) as NodeListOf<HTMLImageElement>;

      await Promise.all(
        Array.from(images).map((img) => {
          if (img.complete) return Promise.resolve();

          return new Promise((resolve) => {
            img.onload = resolve;
            img.onerror = resolve;
          });
        })
      );

      // Render using html-to-image
      const canvas = await htmlToImage.toCanvas(bookMockupRef.current, {
        backgroundColor: undefined,
        pixelRatio: 2 * exportScale,
        filter: (element) => {
          if (element instanceof HTMLElement) {
            return !element.classList.contains('animate-spin');
          }
          return true;
        },
      });

      // Final output
      const finalCanvas = document.createElement('canvas');
      finalCanvas.width = outputWidth * exportScale;
      finalCanvas.height = outputHeight * exportScale;

      const ctx = finalCanvas.getContext('2d');

      if (ctx) {
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        await drawCanvasBackground(ctx, outputWidth * exportScale, outputHeight * exportScale);

        const scaleX = (outputWidth * exportScale) / canvas.width;
        const scaleY = (outputHeight * exportScale) / canvas.height;
        const scale = Math.min(scaleX, scaleY);

        const scaledWidth = canvas.width * scale;
        const scaledHeight = canvas.height * scale;

        const x = (outputWidth * exportScale - scaledWidth) / 2;
        const y = (outputHeight * exportScale - scaledHeight) / 2;

        ctx.drawImage(canvas, x, y, scaledWidth, scaledHeight);
      }

      const link = document.createElement('a');
      link.download = `book-mockup-${Date.now()}-${exportScale}x.png`;
      link.href = finalCanvas.toDataURL('image/png');

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Book download failed:', error);
      setError('Book download failed. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  // ==============================
  // PHONE MOCKUP (html-to-image)
  // ==============================
  const downloadPhoneMockup = async () => {
    if (!phoneMockupRef.current || !imageUrl) return;

    try {
      setIsDownloading(true);

      const images = phoneMockupRef.current.querySelectorAll(
        'img'
      ) as NodeListOf<HTMLImageElement>;

      await Promise.all(
        Array.from(images).map((img) => {
          if (img.complete) return Promise.resolve();

          return new Promise((resolve) => {
            img.onload = resolve;
            img.onerror = resolve;
          });
        })
      );

      const canvas = await htmlToImage.toCanvas(phoneMockupRef.current, {
        backgroundColor: undefined,
        pixelRatio: 2 * exportScale,
        filter: (element) => {
          if (element instanceof HTMLElement) {
            return !element.classList.contains('animate-spin');
          }
          return true;
        },
      });

      const finalCanvas = document.createElement('canvas');
      finalCanvas.width = outputWidth * exportScale;
      finalCanvas.height = outputHeight * exportScale;

      const ctx = finalCanvas.getContext('2d');

      if (ctx) {
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        await drawCanvasBackground(ctx, outputWidth * exportScale, outputHeight * exportScale);

        const scaleX = (outputWidth * exportScale) / canvas.width;
        const scaleY = (outputHeight * exportScale) / canvas.height;
        const scale = Math.min(scaleX, scaleY);

        const scaledWidth = canvas.width * scale;
        const scaledHeight = canvas.height * scale;

        const x = (outputWidth * exportScale - scaledWidth) / 2;
        const y = (outputHeight * exportScale - scaledHeight) / 2;

        ctx.drawImage(canvas, x, y, scaledWidth, scaledHeight);
      }

      const link = document.createElement('a');
      link.download = `phone-mockup-${Date.now()}-${exportScale}x.png`;
      link.href = finalCanvas.toDataURL('image/png');

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Phone download failed:', error);
      setError('Phone download failed. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  // ==============================
  // TABLET MOCKUP (html-to-image)
  // ==============================
  const downloadTabletMockup = async () => {
    if (!tabletMockupRef.current || !imageUrl) return;

    try {
      setIsDownloading(true);

      const images = tabletMockupRef.current.querySelectorAll(
        'img'
      ) as NodeListOf<HTMLImageElement>;

      await Promise.all(
        Array.from(images).map((img) => {
          if (img.complete) return Promise.resolve();

          return new Promise((resolve) => {
            img.onload = resolve;
            img.onerror = resolve;
          });
        })
      );

      const canvas = await htmlToImage.toCanvas(tabletMockupRef.current, {
        backgroundColor: undefined,
        pixelRatio: 2 * exportScale,
        filter: (element) => {
          if (element instanceof HTMLElement) {
            return !element.classList.contains('animate-spin');
          }
          return true;
        },
      });

      const finalCanvas = document.createElement('canvas');
      finalCanvas.width = outputWidth * exportScale;
      finalCanvas.height = outputHeight * exportScale;

      const ctx = finalCanvas.getContext('2d');

      if (ctx) {
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';

        await drawCanvasBackground(ctx, outputWidth * exportScale, outputHeight * exportScale);

        const scaleX = (outputWidth * exportScale) / canvas.width;
        const scaleY = (outputHeight * exportScale) / canvas.height;
        const scale = Math.min(scaleX, scaleY);

        const scaledWidth = canvas.width * scale;
        const scaledHeight = canvas.height * scale;

        const x = (outputWidth * exportScale - scaledWidth) / 2;
        const y = (outputHeight * exportScale - scaledHeight) / 2;

        ctx.drawImage(canvas, x, y, scaledWidth, scaledHeight);
      }

      const link = document.createElement('a');
      link.download = `tablet-mockup-${Date.now()}-${exportScale}x.png`;
      link.href = finalCanvas.toDataURL('image/png');

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Tablet download failed:', error);
      setError('Tablet download failed. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  // Color preset quick selects
  const colorPresets = [
    { name: 'Ink', value: '#0b0b18' },
    { name: 'Snow', value: '#f8fafc' },
    { name: 'Vermilion', value: '#e11d48' },
    { name: 'Azure', value: '#0284c7' },
    { name: 'Mint', value: '#059669' },
    { name: 'None', value: 'transparent' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 dark:bg-[#07070c] dark:text-[#e2e8f0] flex flex-col font-['Plus_Jakarta_Sans',sans-serif] transition-colors duration-300">
      {/* Top Banner Alert when Backend Offline */}
      {backendStatus !== 'online' && (
        <div
          className={`w-full px-4 py-2.5 text-center text-xs font-semibold border-b transition-all ${
            backendStatus === 'checking' 
              ? 'bg-yellow-950/40 text-yellow-300 border-yellow-800/30' 
              : 'bg-red-950/40 text-red-300 border-red-800/30'
          }`}
        >
          {backendStatus === 'checking' ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-yellow-400"></div>
              <span>Checking backend connection...</span>
            </div>
          ) : (
            <div className="flex items-center justify-center space-x-2">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>
                Backend server is offline. Run inside workspace: <code className="bg-red-950/80 px-2 py-0.5 rounded border border-red-800/30 text-red-400 text-[10px] ml-1">python run.py</code>
              </span>
            </div>
          )}
        </div>
      )}

      {/* Modern Top Header */}
      <header className="border-b border-slate-200 dark:border-[#1c1c38] bg-white/80 dark:bg-[#090915]/80 backdrop-blur-md sticky top-0 z-40 transition-colors duration-300">
        <div className="max-w-[1600px] mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-gradient-to-r from-fuchsia-600 via-violet-600 to-purple-600 rounded-xl shadow-[0_4px_15px_rgba(168,85,247,0.3)]">
              <Monitor className="w-5 h-5 text-white" />
            </div>
            <div className="flex items-center space-x-1.5">
              <h1 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white font-['Outfit']">
                AI Display Studio
              </h1>
              <Sparkles className="w-4 h-4 text-brand animate-pulse" />
            </div>
          </div>

          <div className="flex items-center space-x-5">
            <div className="flex items-center">
              {backendStatus === 'online' ? (
                <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-green-500/10 text-green-400 border border-green-500/20 shadow-[0_0_15px_rgba(34,197,94,0.1)]">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-ping"></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 absolute"></span>
                  <span>Backend online</span>
                </div>
              ) : backendStatus === 'checking' ? (
                <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-medium bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
                  <div className="animate-spin rounded-full h-2 w-2 border-b-2 border-yellow-400"></div>
                  <span>Connecting...</span>
                </div>
              ) : (
                <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                  <span>Backend offline</span>
                </div>
              )}
            </div>

            <a
              href="#"
              className="text-xs font-semibold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors py-1.5"
            >
              Docs
            </a>

            {/* Theme Toggle Button */}
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 bg-white/60 hover:bg-indigo-50/80 dark:bg-[#0e0e24] dark:hover:bg-[#181836] border border-slate-200/80 dark:border-[#1c1c38] text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-xl transition-all shadow-sm flex items-center justify-center"
              title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400 transition-transform hover:rotate-45 duration-300" />
              ) : (
                <Moon className="w-4 h-4 text-indigo-600 transition-transform hover:-rotate-12 duration-300" />
              )}
            </button>

            <div className="flex items-stretch relative" ref={headerScaleDropdownRef}>
              <button
                onClick={handleDownload}
                disabled={isLoading || isDownloading || !imageUrl}
                className="bg-gradient-to-r from-fuchsia-600 via-violet-600 to-purple-600 hover:from-fuchsia-700 hover:via-violet-700 hover:to-purple-700 text-white font-semibold text-xs px-4 py-2 rounded-l-full shadow-[0_4px_20px_rgba(139,92,246,0.25)] hover:shadow-[0_4px_25px_rgba(139,92,246,0.4)] hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center space-x-1.5 disabled:opacity-40 disabled:hover:scale-100 disabled:pointer-events-none border-r border-indigo-400/20"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export ({exportScale}x)</span>
              </button>
              <button
                onClick={() => setIsHeaderScaleDropdownOpen(!isHeaderScaleDropdownOpen)}
                disabled={isLoading || isDownloading || !imageUrl}
                className="bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs px-2.5 rounded-r-full shadow-[0_4px_20px_rgba(139,92,246,0.25)] transition-all flex items-center disabled:opacity-40 disabled:pointer-events-none"
              >
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isHeaderScaleDropdownOpen ? 'transform rotate-180' : ''}`} />
              </button>
              {isHeaderScaleDropdownOpen && (
                <div className="absolute right-0 top-full mt-1.5 z-50 w-24 bg-white/95 dark:bg-[#090915]/95 backdrop-blur-md border border-slate-200/80 dark:border-[#1c1c38] rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.08)] dark:shadow-[0_10px_30px_rgba(0,0,0,0.5)] p-1 flex flex-col gap-0.5">
                  {[1, 2, 3].map((scale) => (
                    <button
                      key={scale}
                      type="button"
                      onClick={() => {
                        setExportScale(scale);
                        setIsHeaderScaleDropdownOpen(false);
                      }}
                      className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center justify-between ${
                        exportScale === scale
                          ? 'bg-indigo-600 text-white'
                          : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#181836] hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      <span>{scale}x</span>
                      {exportScale === scale && <Check className="w-3.5 h-3.5" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Layout Area */}
      <main className="flex-1 max-w-[1600px] mx-auto w-full px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column (Templates, Source Uploader, Capabilities) */}
          <div className="lg:col-span-3 flex flex-col gap-6">
            
            {/* 1. Templates selector card */}
            <div className="premium-card rounded-2xl p-5">
              <h3 className="text-[10px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-widest mb-4 flex items-center">
                <Monitor className="w-3 h-3 mr-1.5 text-brand" />
                Templates
              </h3>
              
              <div className="grid grid-cols-2 gap-3">
                {/* Default Template Tile (Spans 2 columns, listed first) */}
                <button
                  onClick={() => {
                    setMockupTemplate('default');
                    setObjectFit('contain');
                    setCoverPosition('0px');
                    setCoverLeft('0px');
                    setCoverScale(1.0);
                  }}
                  className={`col-span-2 flex flex-col items-center justify-center py-4 rounded-xl border transition-all ${
                    mockupTemplate === 'default'
                      ? 'bg-gradient-to-r from-fuchsia-600 via-violet-600 to-purple-600 border-transparent text-white shadow-[0_4px_16px_rgba(168,85,247,0.25)] font-semibold'
                      : 'bg-white/40 dark:bg-[#0c0c1c]/60 border-slate-200/60 dark:border-[#1c1c38] text-slate-500 dark:text-slate-400 hover:bg-white/80 dark:hover:bg-[#181836]/30 hover:border-slate-300 dark:hover:border-[#2b2b54] hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  <ImageIcon className={`w-5 h-5 mb-2 transition-colors ${mockupTemplate === 'default' ? 'text-white' : 'text-brand'}`} />
                  <span className="text-xs">Default</span>
                </button>

                {/* Book Tile */}
                <button
                  onClick={() => setMockupTemplate('book')}
                  className={`flex flex-col items-center justify-center py-4 rounded-xl border transition-all ${
                    mockupTemplate === 'book'
                      ? 'bg-gradient-to-r from-fuchsia-600 via-violet-600 to-purple-600 border-transparent text-white shadow-[0_4px_16px_rgba(168,85,247,0.25)] font-semibold'
                      : 'bg-white/40 dark:bg-[#0c0c1c]/60 border-slate-200/60 dark:border-[#1c1c38] text-slate-500 dark:text-slate-400 hover:bg-white/80 dark:hover:bg-[#181836]/30 hover:border-slate-300 dark:hover:border-[#2b2b54] hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  <BookOpen className={`w-5 h-5 mb-2 transition-colors ${mockupTemplate === 'book' ? 'text-white' : 'text-brand'}`} />
                  <span className="text-xs">Book</span>
                </button>

                {/* Laptop Tile */}
                <button
                  onClick={() => setMockupTemplate('laptop')}
                  className={`flex flex-col items-center justify-center py-4 rounded-xl border transition-all ${
                    mockupTemplate === 'laptop'
                      ? 'bg-gradient-to-r from-fuchsia-600 via-violet-600 to-purple-600 border-transparent text-white shadow-[0_4px_16px_rgba(168,85,247,0.25)] font-semibold'
                      : 'bg-white/40 dark:bg-[#0c0c1c]/60 border-slate-200/60 dark:border-[#1c1c38] text-slate-500 dark:text-slate-400 hover:bg-white/80 dark:hover:bg-[#181836]/30 hover:border-slate-300 dark:hover:border-[#2b2b54] hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  <Laptop className={`w-5 h-5 mb-2 transition-colors ${mockupTemplate === 'laptop' ? 'text-white' : 'text-brand'}`} />
                  <span className="text-xs">Laptop</span>
                </button>

                {/* Phone Tile */}
                <button
                  onClick={() => setMockupTemplate('phone')}
                  className={`flex flex-col items-center justify-center py-4 rounded-xl border transition-all ${
                    mockupTemplate === 'phone'
                      ? 'bg-gradient-to-r from-fuchsia-600 via-violet-600 to-purple-600 border-transparent text-white shadow-[0_4px_16px_rgba(168,85,247,0.25)] font-semibold'
                      : 'bg-white/40 dark:bg-[#0c0c1c]/60 border-slate-200/60 dark:border-[#1c1c38] text-slate-500 dark:text-slate-400 hover:bg-white/80 dark:hover:bg-[#181836]/30 hover:border-slate-300 dark:hover:border-[#2b2b54] hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  <Smartphone className={`w-5 h-5 mb-2 transition-colors ${mockupTemplate === 'phone' ? 'text-white' : 'text-brand'}`} />
                  <span className="text-xs">Phone</span>
                </button>

                {/* Tablet Tile */}
                <button
                  onClick={() => setMockupTemplate('tablet')}
                  className={`flex flex-col items-center justify-center py-4 rounded-xl border transition-all ${
                    mockupTemplate === 'tablet'
                      ? 'bg-gradient-to-r from-fuchsia-600 via-violet-600 to-purple-600 border-transparent text-white shadow-[0_4px_16px_rgba(168,85,247,0.25)] font-semibold'
                      : 'bg-white/40 dark:bg-[#0c0c1c]/60 border-slate-200/60 dark:border-[#1c1c38] text-slate-500 dark:text-slate-400 hover:bg-white/80 dark:hover:bg-[#181836]/30 hover:border-slate-300 dark:hover:border-[#2b2b54] hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  <TabletIcon className={`w-5 h-5 mb-2 transition-colors ${mockupTemplate === 'tablet' ? 'text-white' : 'text-brand'}`} />
                  <span className="text-xs">Tablet</span>
                </button>
              </div>
            </div>

            {/* 2. Source file card */}
            <div className="premium-card rounded-2xl p-5 flex flex-col gap-4">
              <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center">
                <Download className="w-3.5 h-3.5 mr-1.5 text-brand transform rotate-180" />
                Source File
              </h3>

              {/* Uploader Box */}
              <FileUpload 
                onFileSelect={handleFileSelect} 
                isLoading={isLoading} 
                disabled={backendStatus !== 'online'} 
              />

              {/* File details container */}
              {fileName && (
                <div className="bg-white/45 dark:bg-[#101026] border border-slate-200/60 dark:border-[#1c1c3f] rounded-xl px-4 py-3 flex items-center justify-between transition-colors duration-300">
                  <div className="flex items-center space-x-2.5 min-w-0">
                    <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate pr-2 max-w-[140px]" title={fileName}>
                      {fileName}
                    </span>
                  </div>
                  <button
                    onClick={handleReset}
                    className="p-1 hover:bg-indigo-50/80 dark:hover:bg-[#181836] rounded-lg transition-colors group flex-shrink-0"
                    title="Reset File"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-brand group-hover:text-indigo-600 dark:group-hover:text-white transition-colors" />
                  </button>
                </div>
              )}

              {error && (
                <div className="p-3 bg-red-950/40 border border-red-900/30 rounded-xl flex items-start space-x-2">
                  <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                  <p className="text-[11px] text-red-200 leading-normal">{error}</p>
                </div>
              )}
            </div>

            {/* 3. Capabilities Checklist card */}
            <div className="premium-card rounded-2xl p-5 flex flex-col gap-4">
              <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center">
                <Zap className="w-3 h-3 mr-1.5 text-brand" />
                Capabilities
              </h3>

              <div className="flex flex-col gap-3">
                {/* Image optimization */}
                <div className="flex items-center space-x-3 bg-white/40 dark:bg-[#0c0c1c]/60 border border-slate-200/50 dark:border-[#171732] px-3 py-2.5 rounded-xl transition-all duration-300 hover:bg-white/80 dark:hover:bg-[#181836]/30 hover:border-slate-300 dark:hover:border-slate-600 hover:shadow-[0_4px_12px_rgba(0,0,0,0.02)]">
                  <div className="p-1.5 bg-indigo-500/10 rounded-lg text-brand">
                    <ImageIcon className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs font-medium text-slate-700 dark:text-slate-300">Image optimization</span>
                </div>

                {/* PDF first-page extract */}
                <div className="flex items-center space-x-3 bg-white/40 dark:bg-[#0c0c1c]/60 border border-slate-200/50 dark:border-[#171732] px-3 py-2.5 rounded-xl transition-all duration-300 hover:bg-white/80 dark:hover:bg-[#181836]/30 hover:border-slate-300 dark:hover:border-slate-600 hover:shadow-[0_4px_12px_rgba(0,0,0,0.02)]">
                  <div className="p-1.5 bg-indigo-500/10 rounded-lg text-brand">
                    <FileText className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs font-medium text-slate-700 dark:text-slate-300">PDF first-page extract</span>
                </div>

                {/* Live preview engine */}
                <div className="flex items-center space-x-3 bg-white/40 dark:bg-[#0c0c1c]/60 border border-slate-200/50 dark:border-[#171732] px-3 py-2.5 rounded-xl transition-all duration-300 hover:bg-white/80 dark:hover:bg-[#181836]/30 hover:border-slate-300 dark:hover:border-slate-600 hover:shadow-[0_4px_12px_rgba(0,0,0,0.02)]">
                  <div className="p-1.5 bg-indigo-500/10 rounded-lg text-brand">
                    <Tv className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs font-medium text-slate-700 dark:text-slate-300">Live preview engine</span>
                </div>
              </div>
            </div>
          </div>

          {/* Middle Column (Live Mockup Preview Viewport) */}
          <div className="lg:col-span-6 flex flex-col gap-4">
            
            {/* Live Preview Header row */}
            <div className="flex items-center justify-between px-1">
              <div>
                <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white font-['Outfit']">
                  Live Preview
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Your content rendered on the {mockupTemplate.charAt(0).toUpperCase() + mockupTemplate.slice(1)} mockup
                </p>
              </div>

              {/* Contain / Cover toggle pill */}
              <div className={`bg-slate-100/70 dark:bg-[#0e0e24] border border-slate-200/60 dark:border-[#1c1c38] p-1 rounded-full flex items-center shadow-inner transition-all duration-300 ${
                mockupTemplate === 'default' ? 'opacity-40 pointer-events-none select-none' : ''
              }`}>
                <button
                  disabled={mockupTemplate === 'default'}
                  onClick={() => {
                    setObjectFit('contain');
                    setCoverPosition('0px');
                    setCoverLeft('0px');
                    setCoverScale(1.0);
                  }}
                  className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                    objectFit === 'contain'
                      ? 'bg-[#3359e9] text-white shadow-md'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Contain
                </button>
                <button
                  disabled={mockupTemplate === 'default'}
                  onClick={() => setObjectFit('cover')}
                  className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                    objectFit === 'cover'
                      ? 'bg-[#3359e9] text-white shadow-md'
                      : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Cover
                </button>
              </div>
            </div>

            {/* Canvas mockup window panel */}
            <div className="relative bg-white/45 dark:bg-[#0c0c1c] border border-slate-200/65 dark:border-[#1c1c38] rounded-3xl p-6 shadow-2xl flex flex-col items-center transition-all duration-300">
              
              {/* Top Canvas Badges */}
              <div className="absolute top-5 left-6 z-10 flex items-center">
                <div className="bg-white/80 dark:bg-[#080814]/80 backdrop-blur-md border border-slate-200/60 dark:border-[#1c1c38] text-[10px] text-slate-600 dark:text-slate-300 font-semibold px-3 py-1.5 rounded-full flex items-center space-x-1.5 transition-colors duration-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span>{outputWidth} × {outputHeight}</span>
                </div>
              </div>

              <div className="absolute top-5 right-6 z-10">
                <div className="bg-white/80 dark:bg-[#080814]/80 backdrop-blur-md border border-slate-200/60 dark:border-[#1c1c38] text-[10px] text-slate-600 dark:text-slate-300 font-semibold px-3 py-1.5 rounded-full transition-colors duration-300">
                  100%
                </div>
              </div>

              {/* Centered device container */}
              <div className="w-full flex items-center justify-center py-6 mt-4">
                {mockupTemplate === 'default' ? (
                  <DefaultMockup
                    ref={defaultMockupRef}
                    imageUrl={imageUrl}
                    isLoading={isLoading}
                    dominantColor={dominantColor}
                    objectFit={objectFit}
                    coverPosition={coverPosition}
                    coverLeft={coverLeft}
                    coverScale={coverScale}
                    backgroundColor={backgroundColor}
                    backgroundImage={backgroundImage}
                    imageWidth={imageWidth}
                    imageHeight={imageHeight}
                    outputWidth={outputWidth}
                    outputHeight={outputHeight}
                  />
                ) : mockupTemplate === 'laptop' ? (
                  <LaptopMockup
                    ref={laptopMockupRef}
                    imageUrl={imageUrl}
                    isLoading={isLoading}
                    dominantColor={dominantColor}
                    objectFit={objectFit}
                    coverPosition={coverPosition}
                    coverLeft={coverLeft}
                    coverScale={coverScale}
                    backgroundColor={backgroundColor}
                    backgroundImage={backgroundImage}
                    outputWidth={outputWidth}
                    outputHeight={outputHeight}
                  />
                ) : mockupTemplate === 'book' ? (
                  <BookMockup
                    ref={bookMockupRef}
                    imageUrl={imageUrl}
                    isLoading={isLoading}
                    dominantColor={dominantColor}
                    backgroundColor={backgroundColor}
                    backgroundImage={backgroundImage}
                    objectFit={objectFit}
                    coverPosition={coverPosition}
                    coverLeft={coverLeft}
                    coverScale={coverScale}
                    outputWidth={outputWidth}
                    outputHeight={outputHeight}
                  />
                ) : mockupTemplate === 'phone' ? (
                  <PhoneMockup
                    ref={phoneMockupRef}
                    imageUrl={imageUrl}
                    isLoading={isLoading}
                    dominantColor={dominantColor}
                    objectFit={objectFit}
                    coverPosition={coverPosition}
                    coverLeft={coverLeft}
                    coverScale={coverScale}
                    backgroundColor={backgroundColor}
                    backgroundImage={backgroundImage}
                    outputWidth={outputWidth}
                    outputHeight={outputHeight}
                  />
                ) : (
                  <TabletMockup
                    ref={tabletMockupRef}
                    imageUrl={imageUrl}
                    isLoading={isLoading}
                    dominantColor={dominantColor}
                    objectFit={objectFit}
                    coverPosition={coverPosition}
                    coverLeft={coverLeft}
                    coverScale={coverScale}
                    backgroundColor={backgroundColor}
                    backgroundImage={backgroundImage}
                    outputWidth={outputWidth}
                    outputHeight={outputHeight}
                  />
                )}
              </div>

              {/* Bottom Canvas control bar */}
              <div className="w-full mt-4 flex items-center justify-between border-t border-slate-200/70 dark:border-[#1a1a32] pt-5">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleReset}
                    className="bg-white/60 dark:bg-[#0e0e24] hover:bg-indigo-50/80 dark:hover:bg-[#181836] border border-slate-200/80 dark:border-[#1c1c38] hover:border-slate-300 dark:hover:border-slate-600 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white px-3 py-2 rounded-xl text-xs font-semibold transition-all flex items-center space-x-1.5 shadow-sm hover:shadow"
                    title="Reset Preview"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset</span>
                  </button>

                  <button
                    onClick={() => setCoverScale(prev => Math.min(3.0, parseFloat((prev + 0.1).toFixed(2))))}
                    className="p-2 bg-white/60 dark:bg-[#0e0e24] hover:bg-indigo-50/80 dark:hover:bg-[#181836] border border-slate-200/80 dark:border-[#1c1c38] text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-xl transition-all shadow-sm hover:shadow"
                    title="Zoom In"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => setCoverScale(prev => Math.max(0.1, parseFloat((prev - 0.1).toFixed(2))))}
                    className="p-2 bg-white/60 dark:bg-[#0e0e24] hover:bg-indigo-50/80 dark:hover:bg-[#181836] border border-slate-200/80 dark:border-[#1c1c38] text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white rounded-xl transition-all shadow-sm hover:shadow"
                    title="Zoom Out"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => {
                      setCoverPosition('0px');
                      setCoverLeft('0px');
                      setCoverScale(1.0);
                    }}
                    className="bg-white/60 dark:bg-[#0e0e24] hover:bg-indigo-50/80 dark:hover:bg-[#181836] border border-slate-200/80 dark:border-[#1c1c38] text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white px-3 py-2 rounded-xl text-xs font-semibold transition-all flex items-center space-x-1.5 shadow-sm hover:shadow"
                    title="Fit Content"
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                    <span>Fit</span>
                  </button>
                </div>

                <div className="flex items-stretch relative" ref={bottomScaleDropdownRef}>
                  <button
                    onClick={handleDownload}
                    disabled={isLoading || isDownloading || !imageUrl}
                    className="bg-gradient-to-r from-fuchsia-600 via-violet-600 to-purple-600 hover:from-fuchsia-700 hover:via-violet-700 hover:to-purple-700 text-white font-semibold text-xs px-4 py-2 rounded-l-xl shadow-[0_4px_15_rgba(168,85,247,0.2)] hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center space-x-1.5 disabled:opacity-40 disabled:hover:scale-100 disabled:pointer-events-none border-r border-indigo-400/20"
                  >
                    {isDownloading ? (
                      <>
                        <div className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-white"></div>
                        <span>Rendering...</span>
                      </>
                    ) : (
                      <>
                        <Download className="w-3.5 h-3.5" />
                        <span>Download Mockup ({exportScale}x)</span>
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => setIsScaleDropdownOpen(!isScaleDropdownOpen)}
                    disabled={isLoading || isDownloading || !imageUrl}
                    className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white font-semibold text-xs px-2.5 rounded-r-xl shadow-[0_4px_15px_rgba(168,85,247,0.2)] transition-all flex items-center disabled:opacity-40 disabled:pointer-events-none"
                  >
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isScaleDropdownOpen ? 'transform rotate-180' : ''}`} />
                  </button>
                  {isScaleDropdownOpen && (
                    <div className="absolute right-0 bottom-full mb-1.5 z-50 w-24 bg-white/95 dark:bg-[#090915]/95 backdrop-blur-md border border-slate-200/80 dark:border-[#1c1c38] rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.08)] dark:shadow-[0_10px_30px_rgba(0,0,0,0.5)] p-1 flex flex-col gap-0.5">
                      {[1, 2, 3].map((scale) => (
                        <button
                          key={scale}
                          type="button"
                          onClick={() => {
                            setExportScale(scale);
                            setIsScaleDropdownOpen(false);
                          }}
                          className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center justify-between ${
                            exportScale === scale
                              ? 'bg-indigo-600 text-white'
                              : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#181836] hover:text-slate-900 dark:hover:text-white'
                          }`}
                        >
                          <span>{scale}x</span>
                          {exportScale === scale && <Check className="w-3.5 h-3.5" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column (Canvas Settings, Transform controls, Pro Tip) */}
          <div className="lg:col-span-3 flex flex-col gap-6">
            
            {/* 1. Canvas settings card */}
            <div className="premium-card rounded-2xl p-5 flex flex-col gap-4">
              <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center">
                <Sliders className="w-3.5 h-3.5 mr-1.5 text-brand" />
                Canvas
              </h3>

              {/* Brand Selector Dropdown */}
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                  <span>Brand Preset</span>
                </label>
                <SearchableBrandDropdown
                  selectedBrand={selectedBrand}
                  onBrandSelect={handleBrandChange}
                />
              </div>

              {/* Background Color Picker Input */}
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                  Background
                </label>
                <div className="flex items-center space-x-3">
                  <div className="relative w-8 h-8 rounded-lg overflow-hidden border border-slate-200/80 dark:border-[#2b2b54] cursor-pointer flex-shrink-0 shadow-inner">
                    <input
                      type="color"
                      value={backgroundColor === 'transparent' ? '#000000' : backgroundColor}
                      onChange={(e) => {
                        setBackgroundColor(e.target.value);
                        setSelectedBrand('');
                      }}
                      className="absolute inset-0 w-full h-full p-0 border-0 cursor-pointer opacity-0"
                      title="Choose custom background color"
                    />
                    <div 
                      className="w-full h-full"
                      style={{ backgroundColor: backgroundColor === 'transparent' ? '#000000' : backgroundColor }}
                    >
                      {backgroundColor === 'transparent' && (
                        <div className="w-full h-full bg-grid-pattern opacity-40"></div>
                      )}
                    </div>
                  </div>
                  <input
                    type="text"
                    value={backgroundColor}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (/^#([0-9A-Fa-f]{3}){1,2}$/.test(val) || val === 'transparent' || val === '') {
                        setBackgroundColor(val);
                        setSelectedBrand('');
                      }
                    }}
                    placeholder="#0b0b18"
                    className="premium-input flex-1"
                  />
                </div>
              </div>

              {/* Background Image Input */}
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                  <span>Background Image</span>
                  {backgroundImage && (
                    <button
                      onClick={() => setBackgroundImage('')}
                      className="text-red-400 hover:text-red-300 text-[10px] lowercase tracking-normal font-semibold transition-colors"
                    >
                      Clear
                    </button>
                  )}
                </label>
                
                <div className="flex items-center space-x-2">
                  <label className="premium-input flex-1 cursor-pointer text-center flex items-center justify-center space-x-1.5 hover:text-slate-800 dark:hover:text-slate-200">
                    <ImageIcon className="w-3.5 h-3.5 text-brand" />
                    <span className="truncate pr-1">
                      {backgroundImage ? 'Change Image' : 'Upload Image'}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (event) => {
                            if (event.target?.result) {
                              setBackgroundImage(event.target.result as string);
                            }
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Output Dimension Inputs */}
              <div className="grid grid-cols-2 gap-3.5">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                    Width
                  </label>
                  <input
                    type="number"
                    value={outputWidth}
                    onChange={(e) => {
                      setOutputWidth(parseInt(e.target.value) || 1200);
                      setSelectedBrand('');
                    }}
                    className="premium-input w-full"
                    placeholder="1200"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                    Height
                  </label>
                  <input
                    type="number"
                    value={outputHeight}
                    onChange={(e) => {
                      setOutputHeight(parseInt(e.target.value) || 800);
                      setSelectedBrand('');
                    }}
                    className="premium-input w-full"
                    placeholder="800"
                  />
                </div>
              </div>

              {/* Quick Background Theme Presets */}
              <div className="flex flex-wrap gap-2.5 mt-2">
                {colorPresets.map((preset) => (
                  <button
                    key={preset.name}
                    onClick={() => {
                      setBackgroundColor(preset.value);
                      setSelectedBrand('');
                    }}
                    className={`px-3 py-1 rounded-full text-[10px] font-semibold border flex items-center transition-all ${
                      backgroundColor === preset.value
                        ? 'bg-indigo-50/80 dark:bg-[#181836] border-indigo-500 dark:border-[#3b82f6] text-indigo-950 dark:text-white font-bold shadow-sm'
                        : 'bg-white/40 dark:bg-[#0c0c1c]/60 border-slate-200/60 dark:border-[#1c1c38] text-slate-500 dark:text-slate-400 hover:border-slate-350 dark:hover:border-slate-700 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    <span 
                      className="w-2 h-2 rounded-full mr-1.5 border border-white/10 flex-shrink-0"
                      style={{ 
                        backgroundColor: preset.value === 'transparent' ? '#000000' : preset.value,
                        backgroundImage: preset.value === 'transparent' ? 'linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)' : 'none',
                        backgroundSize: preset.value === 'transparent' ? '4px 4px' : 'auto'
                      }}
                    ></span>
                    {preset.name}
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Transform Sliders card */}
            <div className="premium-card rounded-2xl p-5 flex flex-col gap-5">
              <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center">
                <Maximize2 className="w-3.5 h-3.5 mr-1.5 text-brand" />
                Transform
              </h3>

              <div className="flex flex-col gap-4">
                {/* Vertical position slider */}
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-400 text-[10px] uppercase tracking-wider">Vertical</span>
                    <span className="bg-indigo-50 dark:bg-[#10102a] border border-indigo-100 dark:border-[#1c1c3c] text-indigo-600 dark:text-indigo-300 font-bold px-2 py-0.5 rounded-full text-[10px] transition-colors duration-300">
                      {coverPosition}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="-300"
                    max="300"
                    value={parseInt(coverPosition) || 0}
                    onChange={(e) => setCoverPosition(`${e.target.value}px`)}
                    className="slider-gradient-track mt-1"
                  />
                </div>

                {/* Horizontal position slider */}
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-400 text-[10px] uppercase tracking-wider">Horizontal</span>
                    <span className="bg-indigo-50 dark:bg-[#10102a] border border-indigo-100 dark:border-[#1c1c3c] text-indigo-600 dark:text-indigo-300 font-bold px-2 py-0.5 rounded-full text-[10px] transition-colors duration-300">
                      {coverLeft}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="-300"
                    max="300"
                    value={parseInt(coverLeft) || 0}
                    onChange={(e) => setCoverLeft(`${e.target.value}px`)}
                    className="slider-gradient-track mt-1"
                  />
                </div>

                {/* Zoom slider */}
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-400 text-[10px] uppercase tracking-wider">Zoom</span>
                    <span className="bg-indigo-50 dark:bg-[#10102a] border border-indigo-100 dark:border-[#1c1c3c] text-indigo-600 dark:text-indigo-300 font-bold px-2 py-0.5 rounded-full text-[10px] transition-colors duration-300">
                      {coverScale.toFixed(2)}x
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="3.0"
                    step="0.05"
                    value={coverScale}
                    onChange={(e) => setCoverScale(parseFloat(e.target.value))}
                    className="slider-gradient-track mt-1"
                  />
                </div>
              </div>
            </div>

            {/* 3. Pro tip card */}
            <div className="bg-gradient-to-br from-indigo-50/50 to-purple-50/30 dark:from-[#0c0c20]/60 dark:to-[#10082c]/40 border border-indigo-100 dark:border-purple-500/10 rounded-2xl p-5 shadow-lg flex flex-col gap-2.5 transition-colors duration-300">
              <h4 className="text-xs font-semibold text-slate-800 dark:text-white flex items-center">
                <HelpCircle className="w-3.5 h-3.5 mr-1.5 text-brand" />
                Pro tip
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
                Hold the canvas and drag to nudge content. Use Fit to recenter at 100%.
              </p>
              <a 
                href="#" 
                className="text-[10px] font-bold text-indigo-500 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300 flex items-center mt-1 transition-colors"
              >
                Learn shortcuts 
                <ExternalLink className="w-2.5 h-2.5 ml-1" />
              </a>
            </div>

          </div>

        </div>
      </main>

      {/* Crafted Footer */}
      <footer className="border-t border-slate-200 dark:border-[#1c1c38] bg-slate-100 dark:bg-[#05050d] py-6 transition-colors duration-300">
        <div className="max-w-[1600px] mx-auto px-6 flex items-center justify-center text-[11px] text-slate-600 dark:text-slate-500 font-semibold tracking-wide">
          <p>© 2025 AI Display Studio · Crafted with Python + React</p>
        </div>
      </footer>
    </div>
  );
}

export default App;