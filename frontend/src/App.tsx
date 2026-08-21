import { useState, useEffect, useRef } from 'react';
import {
  Monitor,
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
  MoveVertical,
  Sparkles,
  RefreshCw,
  Pencil,
  Trash2,
  X,
} from 'lucide-react';
import LaptopMockup from './components/mockups/LaptopMockup.tsx';
import BookMockup from './components/mockups/BookMockup.tsx';
import PhoneMockup from './components/mockups/PhoneMockup.tsx';
import TabletMockup from './components/mockups/TabletMockup.tsx';
import DefaultMockup from './components/mockups/DefaultMockup.tsx';
import WebinarMockup from './components/mockups/WebinarMockup.tsx';
import GuideMockup from './components/mockups/GuideMockup.tsx';
import { FileUpload } from './components/FileUpload';
import { checkBackendHealth } from './utils/fileProcessor';
import { API_BASE_URL } from './config';
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
  const [originalImageUrl, setOriginalImageUrl] = useState<string>('');
  const [ocrResults, setOcrResults] = useState<any[]>([]);
  const [ocrStatus, setOcrStatus] = useState<'idle' | 'scanning' | 'ready' | 'error'>('idle');
  const ocrAbortControllerRef = useRef<AbortController | null>(null);
  const [activeEdits, setActiveEdits] = useState<any[]>([]);
  const [appliedEdits, setAppliedEdits] = useState<any[]>([]);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [isPdfDoc, setIsPdfDoc] = useState<boolean>(false);
  const [uploadedPdfFile, setUploadedPdfFile] = useState<File | Blob | null>(null);
  const [hasNativePdfText, setHasNativePdfText] = useState<boolean>(false);
  const [pdfRawData, setPdfRawData] = useState<string>('');
  const [nativePdfTextBlocks, setNativePdfTextBlocks] = useState<any[]>([]);
  const [pdfPageSize, setPdfPageSize] = useState<{ width: number; height: number }>({ width: 0, height: 0 });
  const [isEditingText, setIsEditingText] = useState<boolean>(false);
  const [isApplyingEdits, setIsApplyingEdits] = useState<boolean>(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTextVal, setEditingTextVal] = useState<string>('');
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
  const webinarMockupRef = useRef<HTMLDivElement>(null);
  const guideMockupRef = useRef<HTMLDivElement>(null);
  
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [coverPosition, setCoverPosition] = useState<string>('0px');
  const [coverLeft, setCoverLeft] = useState<string>('0px');
  const [coverScale, setCoverScale] = useState<number>(1.0);
  const [frameVerticalOffset, setFrameVerticalOffset] = useState<number>(0);
  const [frameScale, setFrameScale] = useState<number>(1.0);
  const [outputWidth, setOutputWidth] = useState<number>(1200);
  const [outputHeight, setOutputHeight] = useState<number>(800);
  const [backgroundColor, setBackgroundColor] = useState<string>('#0b0b18');
  const [backgroundImage, setBackgroundImage] = useState<string>('');
  const [mockupTemplate, setMockupTemplate] = useState<string>('default');
  const [selectedBrand, setSelectedBrand] = useState<string>('');
  const [imageWidth, setImageWidth] = useState<number>(0);
  const [imageHeight, setImageHeight] = useState<number>(0);
  
  const [webinarHeading, setWebinarHeading] = useState<string>('Free Live Webinar');
  const [webinarDescription, setWebinarDescription] = useState<string>('Learn the best practices of UI/UX design and premium front-end development patterns.');
  const [webinarHeadingColor, setWebinarHeadingColor] = useState<string>('#ffffff');
  const [webinarHeadingSize, setWebinarHeadingSize] = useState<number>(36);
  const [webinarDescriptionColor, setWebinarDescriptionColor] = useState<string>('#cbd5e1');
  const [webinarDescriptionSize, setWebinarDescriptionSize] = useState<number>(14);
  const [webinarShowBadge, setWebinarShowBadge] = useState<boolean>(true);
  const [webinarBadgeText, setWebinarBadgeText] = useState<string>('Live Webinar');
  const [webinarBadgeBgColor, setWebinarBadgeBgColor] = useState<string>('#2b1133');
  const [webinarBadgeBorderColor, setWebinarBadgeBorderColor] = useState<string>('#3b1547');
  const [webinarBadgeTextColor, setWebinarBadgeTextColor] = useState<string>('#d946ef');
  const [webinarBadgeDotColor, setWebinarBadgeDotColor] = useState<string>('#d946ef');
  const [webinarShowDescription, setWebinarShowDescription] = useState<boolean>(true);

  const [guideHeading, setGuideHeading] = useState<string>('The Complete Beginner\'s Guide to Better Design');
  const [guideDescription, setGuideDescription] = useState<string>('Learn the fundamentals of visual hierarchy, typography, and layout to create stunning designs.');
  const [guideHeadingColor, setGuideHeadingColor] = useState<string>('#1e293b');
  const [guideHeadingSize, setGuideHeadingSize] = useState<number>(36);
  const [guideDescriptionColor, setGuideDescriptionColor] = useState<string>('#64748b');
  const [guideDescriptionSize, setGuideDescriptionSize] = useState<number>(14);
  const [guideShowDescription, setGuideShowDescription] = useState<boolean>(true);

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

  const triggerOcrDetection = async (base64Img: string) => {
    if (!base64Img) return;
    if (ocrAbortControllerRef.current) {
      ocrAbortControllerRef.current.abort();
    }
    const controller = new AbortController();
    ocrAbortControllerRef.current = controller;

    setOcrStatus('scanning');
    try {
      const res = await fetch(`${API_BASE_URL}/detect-ocr`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ image_data: base64Img }),
        signal: controller.signal,
      });

      const data = await res.json();
      if (data.success) {
        setOcrResults(data.ocr_results || []);
        setOcrStatus('ready');
      } else {
        setOcrStatus('error');
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        console.log('OCR request cancelled');
        return;
      }
      console.error('Error running OCR detection:', err);
      setOcrStatus('error');
    }
  };

  const openTextEditor = () => {
    setActiveEdits(appliedEdits);
    setIsEditingText(true);
  };

  const handleFileSelect = async (file: File) => {
    if (ocrAbortControllerRef.current) {
      ocrAbortControllerRef.current.abort();
    }

    setIsLoading(true);
    setFileName(file.name);
    setError('');
    setDominantColor('');
    setOriginalImageUrl('');
    setOcrResults([]);
    setOcrStatus('idle');
    setActiveEdits([]);
    setAppliedEdits([]);
    setIsPdfDoc(false);
    setHasNativePdfText(false);
    setPdfRawData('');
    setNativePdfTextBlocks([]);
    setIsEditingText(false);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
      if (isPdf) {
        setUploadedPdfFile(file);
      } else {
        setUploadedPdfFile(null);
      }
      const endpoint = isPdf ? 'extract-pdf-image' : 'process-image';

      const res = await fetch(`${API_BASE_URL}/${endpoint}`, {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (data.success) {
        setImageUrl(data.image_data);
        setOriginalImageUrl(data.image_data);
        setDominantColor(data.dominant_color || '#1a1a2e');
        if (data.image_size) {
          setImageWidth(data.image_size.width);
          setImageHeight(data.image_size.height);
        }
        
        const isPdfFile = Boolean(data.is_pdf);
        const hasNative = Boolean(data.has_native_text && data.native_text_blocks && data.native_text_blocks.length > 0);
        
        setIsPdfDoc(isPdfFile);
        setHasNativePdfText(hasNative);
        setPdfRawData(data.pdf_data || '');
        setNativePdfTextBlocks(data.native_text_blocks || []);
        if (data.page_size) {
          setPdfPageSize(data.page_size);
        }

        // Immediately stop upload loading so image is displayed on the mockup canvas right away!
        setIsLoading(false);

        // Modal will NOT auto-open on upload; only opens when clicking "Edit PDF Text" or "Edit Image Text"
        setActiveEdits([]);
        setAppliedEdits([]);
        setIsEditingText(false);

        if (!isPdfFile || !hasNative) {
          // Scanned PDF or Image: trigger background EasyOCR
          triggerOcrDetection(data.image_data);
        }
      } else {
        throw new Error(data.detail || 'Unknown error');
      }
    } catch (error) {
      console.error('Error processing file:', error);
      setError(error instanceof Error ? error.message : 'Error processing file. Please try again.');
      setImageUrl('');
      setIsLoading(false);
    }
  };

  const handleApplyAprysePdf = async (modifiedPdfBlob: Blob) => {
    setIsApplyingEdits(true);
    try {
      const formData = new FormData();
      formData.append('file', modifiedPdfBlob, 'modified.pdf');

      const res = await fetch(`${API_BASE_URL}/extract-pdf-image`, {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (data.success) {
        setImageUrl(data.image_data);
        setOriginalImageUrl(data.image_data);
        if (data.dominant_color) {
          setDominantColor(data.dominant_color);
        }
        if (data.image_size) {
          setImageWidth(data.image_size.width);
          setImageHeight(data.image_size.height);
        }
        setUploadedPdfFile(modifiedPdfBlob);
        setIsEditingText(false);
      } else {
        throw new Error(data.detail || 'Failed to render modified PDF');
      }
    } catch (err: any) {
      console.error('Error applying Apryse PDF edits:', err);
      alert('Error rendering modified PDF. Please try again.');
    } finally {
      setIsApplyingEdits(false);
    }
  };

  const handleApplyEdits = async (editsToApply = activeEdits, autoContinue = false) => {
    if (!originalImageUrl) return;
    setIsApplyingEdits(true);
    try {
      if (isPdfDoc && hasNativePdfText && pdfRawData) {
        // Native PDF text editing endpoint
        const response = await fetch(`${API_BASE_URL}/edit-pdf-text`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            pdf_data: pdfRawData,
            edits: editsToApply.map(e => ({
              id: e.id,
              pdf_rect: e.pdf_rect || [0, 0, 0, 0],
              action: e.action,
              new_text: e.new_text || '',
              original_text: e.original_text || '',
              font_size: e.font_size,
              font_name: e.font_name,
              color: e.color
            })),
            page_index: 0
          }),
        });

        const data = await response.json();
        if (data.success) {
          setImageUrl(data.image_data);
          setAppliedEdits(editsToApply);
          if (data.dominant_color) {
            setDominantColor(data.dominant_color);
          }
          if (data.image_size) {
            setImageWidth(data.image_size.width);
            setImageHeight(data.image_size.height);
          }
          if (autoContinue) {
            setIsEditingText(false);
          }
        } else {
          throw new Error(data.detail || 'Failed to edit PDF text');
        }
      } else {
        // Standard EasyOCR image inpainting endpoint
        const response = await fetch(`${API_BASE_URL}/edit-image-text`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            image_data: originalImageUrl,
            edits: editsToApply,
          }),
        });

        const data = await response.json();
        if (data.success) {
          setImageUrl(data.image_data);
          setAppliedEdits(editsToApply);
          if (autoContinue) {
            setIsEditingText(false);
          }
        } else {
          throw new Error(data.detail || 'Failed to edit image text');
        }
      }
    } catch (err: any) {
      console.error('Error applying edits:', err);
      setError(err.message || 'Error applying edits');
    } finally {
      setIsApplyingEdits(false);
    }
  };

  const handleReset = () => {
    if (ocrAbortControllerRef.current) {
      ocrAbortControllerRef.current.abort();
    }
    setImageUrl('');
    setOriginalImageUrl('');
    setOcrResults([]);
    setOcrStatus('idle');
    setActiveEdits([]);
    setAppliedEdits([]);
    setIsPdfDoc(false);
    setHasNativePdfText(false);
    setPdfRawData('');
    setNativePdfTextBlocks([]);
    setUploadedPdfFile(null);
    setIsEditingText(false);
    setIsApplyingEdits(false);
    setEditingId(null);
    setEditingTextVal('');
    setDominantColor('');
    setFileName('');
    setError('');
    setIsLoading(false);
    setCoverScale(1.0);
    setCoverPosition('0px');
    setCoverLeft('0px');
    setSelectedBrand('');
    setImageWidth(0);
    setImageHeight(0);
    setWebinarHeading('Free Live Webinar');
    setWebinarDescription('Learn the best practices of UI/UX design and premium front-end development patterns.');
    setWebinarHeadingColor('#ffffff');
    setWebinarHeadingSize(36);
    setWebinarDescriptionColor('#cbd5e1');
    setWebinarDescriptionSize(14);
    setWebinarShowBadge(true);
    setWebinarBadgeText('Live Webinar');
    setWebinarBadgeBgColor('#2b1133');
    setWebinarBadgeBorderColor('#3b1547');
    setWebinarBadgeTextColor('#d946ef');
    setWebinarBadgeDotColor('#d946ef');
    setWebinarShowDescription(true);
    setFrameVerticalOffset(0);
    setFrameScale(1.0);
    setGuideHeading("The Complete Beginner's Guide to Better Design");
    setGuideDescription("Learn the fundamentals of visual hierarchy, typography, and layout to create stunning designs.");
    setGuideHeadingColor('#1e293b');
    setGuideHeadingSize(36);
    setGuideDescriptionColor('#64748b');
    setGuideDescriptionSize(14);
    setGuideShowDescription(true);
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
    } else if (mockupTemplate === 'webinar') {
      await downloadWebinarMockup();
    } else if (mockupTemplate === 'guide') {
      await downloadGuideMockup();
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

  const getDownloadFileName = (defaultPrefix: string) => {
    if (fileName) {
      const baseName = fileName.replace(/\.[^/.]+$/, '');
      const scaleSuffix = exportScale > 1 ? `@${exportScale}x` : '';
      return `${baseName}${scaleSuffix}.png`;
    }
    return `${defaultPrefix}-${Date.now()}-${exportScale}x.png`;
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
      link.download = getDownloadFileName('default-mockup');
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
      link.download = getDownloadFileName('laptop-mockup');
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
      link.download = getDownloadFileName('book-mockup');
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
      link.download = getDownloadFileName('phone-mockup');
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
      link.download = getDownloadFileName('tablet-mockup');
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

  // ==============================
  // WEBINAR MOCKUP (html-to-image)
  // ==============================
  const downloadWebinarMockup = async () => {
    if (!webinarMockupRef.current || !imageUrl) return;

    try {
      setIsDownloading(true);

      const images = webinarMockupRef.current.querySelectorAll(
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

      const canvas = await htmlToImage.toCanvas(webinarMockupRef.current, {
        backgroundColor: undefined,
        pixelRatio: 2 * exportScale,
        filter: (element) => {
          if (element instanceof HTMLElement) {
            return !element.classList.contains('animate-spin') && !element.classList.contains('mockup-popover-exclude');
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
      link.download = getDownloadFileName('webinar-mockup');
      link.href = finalCanvas.toDataURL('image/png');

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Webinar download failed:', error);
      setError('Webinar download failed. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  const downloadGuideMockup = async () => {
    if (!guideMockupRef.current || !imageUrl) return;

    try {
      setIsDownloading(true);

      const images = guideMockupRef.current.querySelectorAll(
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

      const canvas = await htmlToImage.toCanvas(guideMockupRef.current, {
        backgroundColor: undefined,
        pixelRatio: 2 * exportScale,
        filter: (element) => {
          if (element instanceof HTMLElement) {
            return !element.classList.contains('animate-spin') && !element.classList.contains('mockup-popover-exclude');
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
      link.download = getDownloadFileName('guide-mockup');
      link.href = finalCanvas.toDataURL('image/png');

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Guide download failed:', error);
      setError('Guide download failed. Please try again.');
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
          <div className="flex items-center">
              <img 
                src={theme === 'dark' ? '/Logo/logo_white.svg' : '/Logo/logo.svg'} 
                alt="Craftora Logo" 
                className="h-8"
              />
          </div>

          <div className="flex items-center space-x-5">
            <div className="flex items-center">
              {backendStatus === 'online' ? (
                <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-green-500/10 text-green-400 border border-green-500/20 shadow-[0_0_15px_rgba(34,197,94,0.1)]">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                  </span>
                  <span>Backend online</span>
                </div>
              ) : backendStatus === 'checking' ? (
                <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-medium bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
                  <div className="animate-spin rounded-full h-2 w-2 border-b-2 border-yellow-400"></div>
                  <span>Connecting...</span>
                </div>
              ) : (
                <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20">
                  <span className="w-2 h-2 rounded-full bg-red-500"></span>
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
            <div className="premium-card rounded-2xl p-4">
              <h3 className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest mb-3 flex items-center">
                <Monitor className="w-3 h-3 mr-1.5 text-brand" />
                Templates
              </h3>
              
              <div className="grid grid-cols-2 gap-2">
                {/* Default Template Tile */}
                <button
                  onClick={() => {
                    setMockupTemplate('default');
                    setObjectFit('contain');
                    setCoverPosition('0px');
                    setCoverLeft('0px');
                    setCoverScale(1.0);
                  }}
                  className={`col-span-1 flex flex-col items-center justify-center py-2.5 rounded-xl border transition-all ${
                    mockupTemplate === 'default'
                      ? 'bg-gradient-to-r from-fuchsia-600 via-violet-600 to-purple-600 border-transparent text-white shadow-[0_4px_16px_rgba(168,85,247,0.25)] font-semibold'
                      : 'bg-white/40 dark:bg-[#0c0c1c]/60 border-slate-200/60 dark:border-[#1c1c38] text-slate-500 dark:text-slate-400 hover:bg-white/80 dark:hover:bg-[#181836]/30 hover:border-slate-300 dark:hover:border-[#2b2b54] hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  <ImageIcon className={`w-4 h-4 mb-1 transition-colors ${mockupTemplate === 'default' ? 'text-white' : 'text-brand'}`} />
                  <span className="text-[10px]">Default</span>
                </button>

                {/* Webinar Tile */}
                <button
                  onClick={() => setMockupTemplate('webinar')}
                  className={`col-span-1 flex flex-col items-center justify-center py-2.5 rounded-xl border transition-all ${
                    mockupTemplate === 'webinar'
                      ? 'bg-gradient-to-r from-fuchsia-600 via-violet-600 to-purple-600 border-transparent text-white shadow-[0_4px_16px_rgba(168,85,247,0.25)] font-semibold'
                      : 'bg-white/40 dark:bg-[#0c0c1c]/60 border-slate-200/60 dark:border-[#1c1c38] text-slate-500 dark:text-slate-400 hover:bg-white/80 dark:hover:bg-[#181836]/30 hover:border-slate-300 dark:hover:border-[#2b2b54] hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  <Tv className={`w-4 h-4 mb-1 transition-colors ${mockupTemplate === 'webinar' ? 'text-white' : 'text-brand'}`} />
                  <span className="text-[10px]">Webinar</span>
                </button>

                {/* Book Tile */}
                <button
                  onClick={() => setMockupTemplate('book')}
                  className={`flex flex-col items-center justify-center py-2.5 rounded-xl border transition-all ${
                    mockupTemplate === 'book'
                      ? 'bg-gradient-to-r from-fuchsia-600 via-violet-600 to-purple-600 border-transparent text-white shadow-[0_4px_16px_rgba(168,85,247,0.25)] font-semibold'
                      : 'bg-white/40 dark:bg-[#0c0c1c]/60 border-slate-200/60 dark:border-[#1c1c38] text-slate-500 dark:text-slate-400 hover:bg-white/80 dark:hover:bg-[#181836]/30 hover:border-slate-300 dark:hover:border-[#2b2b54] hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  <BookOpen className={`w-4 h-4 mb-1 transition-colors ${mockupTemplate === 'book' ? 'text-white' : 'text-brand'}`} />
                  <span className="text-[10px]">Book</span>
                </button>

                {/* Laptop Tile */}
                <button
                  onClick={() => setMockupTemplate('laptop')}
                  className={`flex flex-col items-center justify-center py-2.5 rounded-xl border transition-all ${
                    mockupTemplate === 'laptop'
                      ? 'bg-gradient-to-r from-fuchsia-600 via-violet-600 to-purple-600 border-transparent text-white shadow-[0_4px_16px_rgba(168,85,247,0.25)] font-semibold'
                      : 'bg-white/40 dark:bg-[#0c0c1c]/60 border-slate-200/60 dark:border-[#1c1c38] text-slate-500 dark:text-slate-400 hover:bg-white/80 dark:hover:bg-[#181836]/30 hover:border-slate-300 dark:hover:border-[#2b2b54] hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  <Laptop className={`w-4 h-4 mb-1 transition-colors ${mockupTemplate === 'laptop' ? 'text-white' : 'text-brand'}`} />
                  <span className="text-[10px]">Laptop</span>
                </button>

                {/* Phone Tile */}
                <button
                  onClick={() => setMockupTemplate('phone')}
                  className={`flex flex-col items-center justify-center py-2.5 rounded-xl border transition-all ${
                    mockupTemplate === 'phone'
                      ? 'bg-gradient-to-r from-fuchsia-600 via-violet-600 to-purple-600 border-transparent text-white shadow-[0_4px_16px_rgba(168,85,247,0.25)] font-semibold'
                      : 'bg-white/40 dark:bg-[#0c0c1c]/60 border-slate-200/60 dark:border-[#1c1c38] text-slate-500 dark:text-slate-400 hover:bg-white/80 dark:hover:bg-[#181836]/30 hover:border-slate-300 dark:hover:border-[#2b2b54] hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  <Smartphone className={`w-4 h-4 mb-1 transition-colors ${mockupTemplate === 'phone' ? 'text-white' : 'text-brand'}`} />
                  <span className="text-[10px]">Phone</span>
                </button>

                {/* Tablet Tile */}
                <button
                  onClick={() => setMockupTemplate('tablet')}
                  className={`flex flex-col items-center justify-center py-2.5 rounded-xl border transition-all ${
                    mockupTemplate === 'tablet'
                      ? 'bg-gradient-to-r from-fuchsia-600 via-violet-600 to-purple-600 border-transparent text-white shadow-[0_4px_16px_rgba(168,85,247,0.25)] font-semibold'
                      : 'bg-white/40 dark:bg-[#0c0c1c]/60 border-slate-200/60 dark:border-[#1c1c38] text-slate-500 dark:text-slate-400 hover:bg-white/80 dark:hover:bg-[#181836]/30 hover:border-slate-300 dark:hover:border-[#2b2b54] hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  <TabletIcon className={`w-4 h-4 mb-1 transition-colors ${mockupTemplate === 'tablet' ? 'text-white' : 'text-brand'}`} />
                  <span className="text-[10px]">Tablet</span>
                </button>

                {/* Guide Tile */}
                <button
                  onClick={() => setMockupTemplate('guide')}
                  className={`col-span-1 flex flex-col items-center justify-center py-2.5 rounded-xl border transition-all ${
                    mockupTemplate === 'guide'
                      ? 'bg-gradient-to-r from-fuchsia-600 via-violet-600 to-purple-600 border-transparent text-white shadow-[0_4px_16px_rgba(168,85,247,0.25)] font-semibold'
                      : 'bg-white/40 dark:bg-[#0c0c1c]/60 border-slate-200/60 dark:border-[#1c1c38] text-slate-500 dark:text-slate-400 hover:bg-white/80 dark:hover:bg-[#181836]/30 hover:border-slate-300 dark:hover:border-[#2b2b54] hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  <FileText className={`w-4 h-4 mb-1 transition-colors ${mockupTemplate === 'guide' ? 'text-white' : 'text-brand'}`} />
                  <span className="text-[10px]">Guide</span>
                </button>
              </div>
            </div>

            {/* 2. Source file card */}
            <div className="premium-card rounded-2xl p-5 flex flex-col gap-4">
              <h3 className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest flex items-center">
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
                  <div className="flex items-center space-x-1.5 flex-shrink-0">
                    <button
                      onClick={openTextEditor}
                      className="p-1 hover:bg-indigo-50/80 dark:hover:bg-[#181836] rounded-lg transition-colors group relative"
                      title={ocrStatus === 'scanning' ? "AI Text Scan in progress... Click to view" : "Edit Detected Text"}
                    >
                      {ocrStatus === 'scanning' ? (
                        <div className="relative flex items-center justify-center w-3.5 h-3.5">
                          <span className="animate-ping absolute inline-flex h-2.5 w-2.5 rounded-full bg-brand opacity-75"></span>
                          <Zap className="w-3.5 h-3.5 text-brand" />
                        </div>
                      ) : (
                        <Zap className="w-3.5 h-3.5 text-brand group-hover:text-indigo-600 dark:group-hover:text-white transition-colors" />
                      )}
                    </button>
                    <button
                      onClick={handleReset}
                      className="p-1 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors group"
                      title="Reset / Clear Uploaded File"
                    >
                      <RotateCcw className="w-3.5 h-3.5 text-slate-400 group-hover:text-red-500 transition-colors" />
                    </button>
                  </div>
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
              <h3 className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest flex items-center">
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
              <div className="absolute top-5 left-6 z-10 flex items-center space-x-2">
                <div className="bg-white/80 dark:bg-[#080814]/80 backdrop-blur-md border border-slate-200/60 dark:border-[#1c1c38] text-[10px] text-slate-600 dark:text-slate-300 font-semibold px-3 py-1.5 rounded-full flex items-center space-x-1.5 transition-colors duration-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span>{outputWidth} × {outputHeight}</span>
                </div>
                <div className="bg-white/80 dark:bg-[#080814]/80 backdrop-blur-md border border-slate-200/60 dark:border-[#1c1c38] text-[10px] text-slate-600 dark:text-slate-300 font-semibold px-3 py-1.5 rounded-full transition-colors duration-300">
                  100%
                </div>
              </div>

              <div className="absolute top-5 right-6 z-10 flex items-center">
                {imageUrl && (
                  <button
                    onClick={openTextEditor}
                    className="bg-white/80 dark:bg-[#080814]/80 hover:bg-indigo-50 dark:hover:bg-[#151532] backdrop-blur-md border border-slate-200/60 dark:border-[#1c1c38] hover:border-indigo-300 dark:hover:border-[#2b2b54] text-brand dark:text-indigo-300 font-semibold text-[11px] px-3.5 py-1.5 rounded-full shadow-sm hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center space-x-1.5"
                    title={isPdfDoc && hasNativePdfText ? "Edit Native PDF Page 1 Text" : "Edit or Remove Image Text Content via OCR"}
                  >
                    {isPdfDoc && hasNativePdfText ? (
                      <>
                        <FileText className="w-3.5 h-3.5 text-brand" />
                        <span>Edit PDF Text</span>
                      </>
                    ) : ocrStatus === 'scanning' ? (
                      <>
                        <span className="relative flex h-2 w-2 mr-0.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-brand"></span>
                        </span>
                        <span>Edit Image Text</span>
                        <span className="text-[10px] text-brand/80 dark:text-indigo-400 font-medium ml-0.5 animate-pulse">Scanning...</span>
                      </>
                    ) : (
                      <>
                        <Zap className="w-3.5 h-3.5" />
                        <span>Edit Image Text</span>
                      </>
                    )}
                  </button>
                )}
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
                    frameVerticalOffset={frameVerticalOffset}
                    frameScale={frameScale}
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
                    frameVerticalOffset={frameVerticalOffset}
                    frameScale={frameScale}
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
                    frameVerticalOffset={frameVerticalOffset}
                    frameScale={frameScale}
                  />
                ) : mockupTemplate === 'tablet' ? (
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
                    frameVerticalOffset={frameVerticalOffset}
                    frameScale={frameScale}
                  />
                ) : mockupTemplate === 'webinar' ? (
                  <WebinarMockup
                    ref={webinarMockupRef}
                    imageUrl={imageUrl}
                    isLoading={isLoading}
                    dominantColor={dominantColor}
                    objectFit={objectFit}
                    coverPosition={coverPosition}
                    coverLeft={coverLeft}
                    coverScale={coverScale}
                    frameScale={frameScale}
                    backgroundColor={backgroundColor}
                    backgroundImage={backgroundImage}
                    outputWidth={outputWidth}
                    outputHeight={outputHeight}
                    heading={webinarHeading}
                    description={webinarDescription}
                    headingColor={webinarHeadingColor}
                    headingSize={webinarHeadingSize}
                    descriptionColor={webinarDescriptionColor}
                    descriptionSize={webinarDescriptionSize}
                    showBadge={webinarShowBadge}
                    badgeText={webinarBadgeText}
                    badgeBgColor={webinarBadgeBgColor}
                    badgeBorderColor={webinarBadgeBorderColor}
                    badgeTextColor={webinarBadgeTextColor}
                    badgeDotColor={webinarBadgeDotColor}
                    onHeadingChange={setWebinarHeading}
                    onHeadingColorChange={setWebinarHeadingColor}
                    onHeadingSizeChange={setWebinarHeadingSize}
                    onDescriptionChange={setWebinarDescription}
                    onDescriptionColorChange={setWebinarDescriptionColor}
                    onDescriptionSizeChange={setWebinarDescriptionSize}
                    onBadgeTextChange={setWebinarBadgeText}
                    onBadgeBgColorChange={setWebinarBadgeBgColor}
                    onBadgeBorderColorChange={setWebinarBadgeBorderColor}
                    onBadgeTextColorChange={setWebinarBadgeTextColor}
                    onBadgeDotColorChange={setWebinarBadgeDotColor}
                    onShowBadgeChange={setWebinarShowBadge}
                    showDescription={webinarShowDescription}
                    onShowDescriptionChange={setWebinarShowDescription}
                  />
                ) : (
                  <GuideMockup
                    ref={guideMockupRef}
                    imageUrl={imageUrl}
                    isLoading={isLoading}
                    dominantColor={dominantColor}
                    objectFit={objectFit}
                    coverPosition={coverPosition}
                    coverLeft={coverLeft}
                    coverScale={coverScale}
                    frameScale={frameScale}
                    backgroundColor={backgroundColor}
                    backgroundImage={backgroundImage}
                    outputWidth={outputWidth}
                    outputHeight={outputHeight}
                    heading={guideHeading}
                    description={guideDescription}
                    headingColor={guideHeadingColor}
                    headingSize={guideHeadingSize}
                    descriptionColor={guideDescriptionColor}
                    descriptionSize={guideDescriptionSize}
                    showDescription={guideShowDescription}
                    onHeadingChange={setGuideHeading}
                    onHeadingColorChange={setGuideHeadingColor}
                    onHeadingSizeChange={setGuideHeadingSize}
                    onDescriptionChange={setGuideDescription}
                    onDescriptionColorChange={setGuideDescriptionColor}
                    onDescriptionSizeChange={setGuideDescriptionSize}
                    onShowDescriptionChange={setGuideShowDescription}
                  />
                )}
              </div>

              {/* Bottom Canvas control bar */}
              <div className="w-full mt-4 flex items-center justify-between border-t border-slate-200/70 dark:border-[#1a1a32] pt-5">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleReset}
                    className="bg-red-500/10 dark:bg-red-950/30 hover:bg-red-500 dark:hover:bg-red-600 border border-red-500/30 dark:border-red-800/40 hover:border-red-500 text-red-600 dark:text-red-400 hover:text-white dark:hover:text-white px-3 py-2 rounded-xl text-xs font-semibold transition-all flex items-center space-x-1.5 shadow-sm hover:shadow-[0_2px_10px_rgba(239,68,68,0.25)]"
                    title="Reset All Work & Clear File"
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
                        <span>Export ({exportScale}x)</span>
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
              <h3 className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest flex items-center">
                <Sliders className="w-3.5 h-3.5 mr-1.5 text-brand" />
                Canvas
              </h3>

              {/* Brand Selector Dropdown */}
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider flex items-center justify-between">
                  <span>Brand Preset</span>
                </label>
                <SearchableBrandDropdown
                  selectedBrand={selectedBrand}
                  onBrandSelect={handleBrandChange}
                />
              </div>

              {/* Background Color Picker Input */}
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
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
                <label className="text-[10px] font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider flex items-center justify-between">
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
                  <label className="text-[10px] font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
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
                  <label className="text-[10px] font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
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
              <h3 className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest flex items-center">
                <Maximize2 className="w-3.5 h-3.5 mr-1.5 text-brand" />
                Transform
              </h3>

              <div className="flex flex-col gap-4">
                {/* Vertical position slider */}
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-600 dark:text-slate-400 text-[10px] uppercase tracking-wider">Vertical</span>
                    <div className="flex items-center gap-1.5">
                      <div className="flex items-center bg-indigo-50 dark:bg-[#10102a] border border-indigo-100 dark:border-[#1c1c3c] rounded-lg px-2 py-0.5 shadow-sm">
                        <input
                          type="number"
                          value={parseInt(coverPosition) || 0}
                          min="-300"
                          max="300"
                          onChange={(e) => {
                            let val = parseInt(e.target.value);
                            if (isNaN(val)) val = 0;
                            val = Math.max(-300, Math.min(300, val));
                            setCoverPosition(`${val}px`);
                          }}
                          className="w-10 text-right bg-transparent text-indigo-600 dark:text-indigo-300 font-bold text-[10px] focus:outline-none border-none p-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                        <span className="text-indigo-400 dark:text-indigo-500 font-bold text-[10px] ml-0.5 select-none">px</span>
                      </div>
                      <button
                        onClick={() => setCoverPosition('0px')}
                        className="text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all p-1 rounded-lg hover:bg-indigo-50/50 dark:hover:bg-[#10102a]"
                        title="Reset to 0px"
                      >
                        <RotateCcw className="w-3 h-3" />
                      </button>
                    </div>
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
                    <span className="font-semibold text-slate-600 dark:text-slate-400 text-[10px] uppercase tracking-wider">Horizontal</span>
                    <div className="flex items-center gap-1.5">
                      <div className="flex items-center bg-indigo-50 dark:bg-[#10102a] border border-indigo-100 dark:border-[#1c1c3c] rounded-lg px-2 py-0.5 shadow-sm">
                        <input
                          type="number"
                          value={parseInt(coverLeft) || 0}
                          min="-300"
                          max="300"
                          onChange={(e) => {
                            let val = parseInt(e.target.value);
                            if (isNaN(val)) val = 0;
                            val = Math.max(-300, Math.min(300, val));
                            setCoverLeft(`${val}px`);
                          }}
                          className="w-10 text-right bg-transparent text-indigo-600 dark:text-indigo-300 font-bold text-[10px] focus:outline-none border-none p-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                        <span className="text-indigo-400 dark:text-indigo-500 font-bold text-[10px] ml-0.5 select-none">px</span>
                      </div>
                      <button
                        onClick={() => setCoverLeft('0px')}
                        className="text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all p-1 rounded-lg hover:bg-indigo-50/50 dark:hover:bg-[#10102a]"
                        title="Reset to 0px"
                      >
                        <RotateCcw className="w-3 h-3" />
                      </button>
                    </div>
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
                    <span className="font-semibold text-slate-600 dark:text-slate-400 text-[10px] uppercase tracking-wider">Zoom</span>
                    <div className="flex items-center gap-1.5">
                      <div className="flex items-center bg-indigo-50 dark:bg-[#10102a] border border-indigo-100 dark:border-[#1c1c3c] rounded-lg px-2 py-0.5 shadow-sm">
                        <input
                          type="number"
                          step="0.05"
                          value={parseFloat(coverScale.toFixed(2))}
                          min="0.5"
                          max="3.0"
                          onChange={(e) => {
                            let val = parseFloat(e.target.value);
                            if (isNaN(val)) val = 1.0;
                            val = Math.max(0.5, Math.min(3.0, val));
                            setCoverScale(val);
                          }}
                          className="w-10 text-right bg-transparent text-indigo-600 dark:text-indigo-300 font-bold text-[10px] focus:outline-none border-none p-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                        <span className="text-indigo-400 dark:text-indigo-500 font-bold text-[10px] ml-0.5 select-none">x</span>
                      </div>
                      <button
                        onClick={() => setCoverScale(1.0)}
                        className="text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all p-1 rounded-lg hover:bg-indigo-50/50 dark:hover:bg-[#10102a]"
                        title="Reset to 1.00x"
                      >
                        <RotateCcw className="w-3 h-3" />
                      </button>
                    </div>
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

                {/* Frame Position slider - only for device mockups */}
                {(mockupTemplate === 'laptop' || mockupTemplate === 'book' || mockupTemplate === 'phone' || mockupTemplate === 'tablet') && (
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-600 dark:text-slate-400 text-[10px] uppercase tracking-wider flex items-center">
                        <MoveVertical className="w-3 h-3 mr-1 text-brand" />
                        Frame Position
                      </span>
                      <div className="flex items-center gap-1.5">
                        <div className="flex items-center bg-indigo-50 dark:bg-[#10102a] border border-indigo-100 dark:border-[#1c1c3c] rounded-lg px-2 py-0.5 shadow-sm">
                          <input
                            type="number"
                            value={frameVerticalOffset}
                            min="-200"
                            max="200"
                            onChange={(e) => {
                              let val = parseInt(e.target.value);
                              if (isNaN(val)) val = 0;
                              val = Math.max(-200, Math.min(200, val));
                              setFrameVerticalOffset(val);
                            }}
                            className="w-10 text-right bg-transparent text-indigo-600 dark:text-indigo-300 font-bold text-[10px] focus:outline-none border-none p-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          />
                          <span className="text-indigo-400 dark:text-indigo-500 font-bold text-[10px] ml-0.5 select-none">px</span>
                        </div>
                        <button
                          onClick={() => setFrameVerticalOffset(0)}
                          className="text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all p-1 rounded-lg hover:bg-indigo-50/50 dark:hover:bg-[#10102a]"
                          title="Reset to 0px"
                        >
                          <RotateCcw className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                    <input
                      type="range"
                      min="-200"
                      max="200"
                      value={frameVerticalOffset}
                      onChange={(e) => setFrameVerticalOffset(parseInt(e.target.value))}
                      className="slider-gradient-track mt-1"
                    />
                  </div>
                )}

                {/* Frame Scale slider - for all mockups except default */}
                {mockupTemplate !== 'default' && (
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-600 dark:text-slate-400 text-[10px] uppercase tracking-wider flex items-center">
                        <Maximize2 className="w-3 h-3 mr-1 text-brand" />
                        Frame Scale
                      </span>
                      <div className="flex items-center gap-1.5">
                        <div className="flex items-center bg-indigo-50 dark:bg-[#10102a] border border-indigo-100 dark:border-[#1c1c3c] rounded-lg px-2 py-0.5 shadow-sm">
                          <input
                            type="number"
                            step="0.05"
                            value={parseFloat(frameScale.toFixed(2))}
                            min="0.5"
                            max="2.0"
                            onChange={(e) => {
                              let val = parseFloat(e.target.value);
                              if (isNaN(val)) val = 1.0;
                              val = Math.max(0.5, Math.min(2.0, val));
                              setFrameScale(val);
                            }}
                            className="w-10 text-right bg-transparent text-indigo-600 dark:text-indigo-300 font-bold text-[10px] focus:outline-none border-none p-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          />
                          <span className="text-indigo-400 dark:text-indigo-500 font-bold text-[10px] ml-0.5 select-none">x</span>
                        </div>
                        <button
                          onClick={() => setFrameScale(1.0)}
                          className="text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-all p-1 rounded-lg hover:bg-indigo-50/50 dark:hover:bg-[#10102a]"
                          title="Reset to 1.00x"
                        >
                          <RotateCcw className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                    <input
                      type="range"
                      min="0.5"
                      max="2.0"
                      step="0.05"
                      value={frameScale}
                      onChange={(e) => setFrameScale(parseFloat(e.target.value))}
                      className="slider-gradient-track mt-1"
                    />
                  </div>
                )}
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
          <p>© 2025 Craftora · Crafted with Python + React</p>
        </div>
      </footer>

      {/* Document Text Editing Modal Popup (Clean Native PDF & OCR) */}
      {isEditingText && (() => {
        const isNativePdf = Boolean(isPdfDoc && hasNativePdfText && nativePdfTextBlocks && nativePdfTextBlocks.length > 0);
        const displayedItems = isNativePdf ? nativePdfTextBlocks : ocrResults;

        return (
          <div 
            className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 transition-all duration-300"
            onClick={() => setSelectedBlockId(null)}
          >
            <div 
              className="bg-white dark:bg-[#0c0c1c] border border-slate-200 dark:border-[#1c1c38] rounded-3xl shadow-2xl w-full max-w-5xl max-h-[92vh] overflow-hidden flex flex-col p-6 gap-5"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-[#1a1a32]">
                <div>
                  <div className="flex items-center space-x-2.5">
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white font-['Outfit'] flex items-center">
                      {isNativePdf ? (
                        <>
                          <FileText className="w-5 h-5 mr-2 text-brand" />
                          PDF Content Editor
                        </>
                      ) : (
                        <>
                          <Zap className="w-5 h-5 mr-2 text-brand" />
                          OCR Text Editor Step
                        </>
                      )}
                    </h3>
                    {isNativePdf ? (
                      <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-sky-500/10 text-sky-400 border border-sky-500/25">
                        <span>{nativePdfTextBlocks.length} editable text block{nativePdfTextBlocks.length === 1 ? '' : 's'}</span>
                      </span>
                    ) : ocrStatus === 'scanning' ? (
                      <span className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/25 animate-pulse">
                        <span className="relative flex h-1.5 w-1.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-indigo-500"></span>
                        </span>
                        <span>AI Scanning in Progress</span>
                      </span>
                    ) : ocrStatus === 'ready' ? (
                      <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">
                        <span>{ocrResults.length} text region{ocrResults.length === 1 ? '' : 's'} detected</span>
                      </span>
                    ) : null}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {isNativePdf 
                      ? 'Click on any text block on Page 1 to select, edit inline, or delete.'
                      : 'Detect, remove or edit text from your source document page before generating mockup creatives.'}
                  </p>
                </div>
                <button 
                  onClick={() => {
                    setActiveEdits(appliedEdits);
                    setIsEditingText(false);
                    setSelectedBlockId(null);
                  }}
                  className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-2 hover:bg-slate-100 dark:hover:bg-[#181836] rounded-xl transition-all"
                  title="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              
              {/* Modal Body: Split view */}
              <div className="flex-1 min-h-0 flex flex-col md:flex-row gap-6">
                {/* Left Side: Interactive Preview */}
                <div 
                  className="flex-1 flex flex-col items-center justify-center bg-slate-100 dark:bg-slate-950/40 rounded-2xl p-4 border border-slate-200 dark:border-[#1c1c38] relative overflow-hidden"
                  onClick={() => setSelectedBlockId(null)}
                >
                  <h4 className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-3 w-full text-left flex items-center justify-between">
                    <span className="flex items-center">
                      <ImageIcon className="w-4 h-4 mr-1.5 text-brand" />
                      {isNativePdf ? 'PDF Page 1 Canvas' : 'Interactive Image Map'}
                    </span>
                    {!isNativePdf && ocrStatus === 'scanning' && (
                      <span className="text-[10px] text-brand font-medium flex items-center space-x-1">
                        <Sparkles className="w-3 h-3 animate-spin" />
                        <span>Scanning text layers...</span>
                      </span>
                    )}
                  </h4>
                  <div className="relative max-w-full max-h-[400px] flex items-center justify-center select-none" style={{ aspectRatio: `${imageWidth}/${imageHeight}` }}>
                    <img 
                      src={originalImageUrl} 
                      alt={isNativePdf ? "PDF Page 1" : "Original for OCR"} 
                      className="max-w-full max-h-[350px] object-contain rounded-lg shadow-md"
                    />

                    {/* AI Laser Scanning Effect Overlay (for OCR mode) */}
                    {!isNativePdf && ocrStatus === 'scanning' && (
                      <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-lg z-20 flex items-center justify-center">
                        <div className="absolute left-0 right-0 h-24 bg-gradient-to-b from-transparent via-indigo-500/20 to-transparent animate-ocr-laser pointer-events-none">
                          <div className="w-full h-[2px] bg-gradient-to-r from-transparent via-cyan-400 via-indigo-400 to-transparent shadow-[0_0_12px_rgba(99,102,241,1),0_0_24px_rgba(6,182,212,0.8)]"></div>
                        </div>
                        <div className="absolute inset-0 bg-[radial-gradient(#6366f1_1px,transparent_1px)] [background-size:16px_16px] opacity-25 pointer-events-none"></div>
                        <div className="absolute bottom-3 bg-slate-900/90 dark:bg-[#090915]/95 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-indigo-500/30 flex items-center space-x-2 text-[11px] text-indigo-200 shadow-2xl pointer-events-none animate-pulse">
                          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-indigo-400"></div>
                          <span className="font-semibold">Detecting document text...</span>
                        </div>
                      </div>
                    )}

                    {/* Bounding box overlays */}
                    {(isNativePdf || ocrStatus === 'ready') && displayedItems.map((item: any) => {
                      let left = 0;
                      let top = 0;
                      let width = 0;
                      let height = 0;
                      let transform = 'none';

                      if (isNativePdf && item.rel_box) {
                        left = item.rel_box.left;
                        top = item.rel_box.top;
                        width = item.rel_box.width;
                        height = item.rel_box.height;
                      } else if (item.box) {
                        const xs = item.box.map((pt: any) => pt[0]);
                        const ys = item.box.map((pt: any) => pt[1]);
                        const minX = Math.min(...xs);
                        const minY = Math.min(...ys);
                        const maxX = Math.max(...xs);
                        const maxY = Math.max(...ys);
                        left = (minX / imageWidth) * 100;
                        top = (minY / imageHeight) * 100;
                        width = ((maxX - minX) / imageWidth) * 100;
                        height = ((maxY - minY) / imageHeight) * 100;
                        transform = `rotate(${item.angle || 0}deg)`;
                      }
                      
                      const edit = activeEdits.find(e => e.id === item.id);
                      const isRemoved = edit?.action === 'remove';
                      const isEdited = edit?.action === 'replace';
                      const isSelected = selectedBlockId === item.id;
                      const isCurrentlyEditing = editingId === item.id;
                      
                      let borderClass = isNativePdf 
                        ? (isSelected 
                            ? "border-2 border-dashed border-sky-500 bg-sky-500/15 z-30" 
                            : "border border-dashed border-sky-400/60 hover:border-sky-500 hover:bg-sky-500/10")
                        : "border-indigo-500/50 hover:border-indigo-400 hover:bg-indigo-500/10";
                      
                      if (isRemoved) borderClass = "border-2 border-dashed border-red-500/80 bg-red-500/15";
                      if (isEdited && !isSelected) borderClass = "border-2 border-dashed border-emerald-500/80 bg-emerald-500/15";
                      
                      return (
                        <div 
                          key={item.id}
                          className={`absolute rounded cursor-pointer transition-all flex items-center justify-center ${borderClass}`}
                          style={{
                            left: `${left}%`,
                            top: `${top}%`,
                            width: `${width}%`,
                            height: `${height}%`,
                            transform: transform,
                            transformOrigin: 'center',
                          }}
                          title={`Click to select: "${item.text}"`}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedBlockId(item.id);
                          }}
                          onDoubleClick={(e) => {
                            e.stopPropagation();
                            setSelectedBlockId(item.id);
                            setEditingId(item.id);
                            setEditingTextVal(isEdited ? edit.new_text : item.text);
                          }}
                        >
                          {/* 8 Resize Handle Dots (when selected) */}
                          {isSelected && isNativePdf && !isCurrentlyEditing && (
                            <>
                              <span className="absolute -top-1.5 -left-1.5 w-2.5 h-2.5 bg-sky-500 border border-white rounded-full pointer-events-none"></span>
                              <span className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-sky-500 border border-white rounded-full pointer-events-none"></span>
                              <span className="absolute -top-1.5 -right-1.5 w-2.5 h-2.5 bg-sky-500 border border-white rounded-full pointer-events-none"></span>
                              <span className="absolute top-1/2 -translate-y-1/2 -left-1.5 w-2.5 h-2.5 bg-sky-500 border border-white rounded-full pointer-events-none"></span>
                              <span className="absolute top-1/2 -translate-y-1/2 -right-1.5 w-2.5 h-2.5 bg-sky-500 border border-white rounded-full pointer-events-none"></span>
                              <span className="absolute -bottom-1.5 -left-1.5 w-2.5 h-2.5 bg-sky-500 border border-white rounded-full pointer-events-none"></span>
                              <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-sky-500 border border-white rounded-full pointer-events-none"></span>
                              <span className="absolute -bottom-1.5 -right-1.5 w-2.5 h-2.5 bg-sky-500 border border-white rounded-full pointer-events-none"></span>

                              {/* Floating Action Menu below selected box */}
                              <div 
                                className="absolute left-1/2 -translate-x-1/2 top-full mt-2 z-40 bg-white dark:bg-[#121226] border border-slate-300 dark:border-[#2b2b54] shadow-2xl rounded-xl px-2 py-1.5 flex items-center space-x-2 animate-in fade-in zoom-in-95 duration-150 pointer-events-auto"
                                onClick={(ev) => ev.stopPropagation()}
                              >
                                <button
                                  onClick={() => {
                                    setEditingId(item.id);
                                    setEditingTextVal(isEdited ? edit.new_text : item.text);
                                  }}
                                  className="p-1 text-slate-700 dark:text-slate-200 hover:text-sky-500 hover:bg-sky-50 dark:hover:bg-sky-950/40 rounded-lg transition-all"
                                  title="Edit text content"
                                >
                                  <Pencil className="w-4 h-4 text-sky-500" />
                                </button>
                                <div className="w-[1px] h-4 bg-slate-200 dark:bg-slate-700"></div>
                                <button
                                  onClick={() => {
                                    const exists = activeEdits.find(e => e.id === item.id);
                                    if (exists && exists.action === 'remove') {
                                      setActiveEdits(activeEdits.filter(e => e.id !== item.id));
                                    } else {
                                      const updated = activeEdits.filter(e => e.id !== item.id);
                                      updated.push({
                                        id: item.id,
                                        pdf_rect: item.pdf_rect,
                                        action: 'remove',
                                        original_text: item.text,
                                        font_size: item.font_size,
                                        font_name: item.font_name,
                                        color: item.color
                                      });
                                      setActiveEdits(updated);
                                    }
                                  }}
                                  className={`p-1 rounded-lg transition-all ${
                                    isRemoved 
                                      ? 'text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/30' 
                                      : 'text-slate-700 dark:text-slate-200 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30'
                                  }`}
                                  title={isRemoved ? "Undo delete" : "Delete text"}
                                >
                                  {isRemoved ? <RotateCcw className="w-4 h-4 text-amber-500" /> : <Trash2 className="w-4 h-4 text-red-500" />}
                                </button>
                              </div>
                            </>
                          )}

                          {/* Direct In-Place Input Editor */}
                          {isCurrentlyEditing ? (
                            <div 
                              className="absolute inset-0 bg-white dark:bg-[#121226] z-50 rounded border-2 border-sky-500 p-0.5 shadow-lg flex items-center"
                              onClick={(ev) => ev.stopPropagation()}
                            >
                              <input 
                                type="text"
                                value={editingTextVal}
                                onChange={(ev) => setEditingTextVal(ev.target.value)}
                                onKeyDown={(ev) => {
                                  if (ev.key === 'Enter') {
                                    const updatedEdits = activeEdits.filter(e => e.id !== item.id);
                                    if (isNativePdf) {
                                      updatedEdits.push({
                                        id: item.id,
                                        pdf_rect: item.pdf_rect,
                                        action: 'replace',
                                        new_text: editingTextVal,
                                        original_text: item.text,
                                        font_size: item.font_size,
                                        font_name: item.font_name,
                                        color: item.color
                                      });
                                    } else {
                                      updatedEdits.push({
                                        id: item.id,
                                        box: item.box,
                                        action: 'replace',
                                        new_text: editingTextVal,
                                        original_text: item.text,
                                        angle: item.angle,
                                        color: item.color,
                                        width: item.width,
                                        height: item.height
                                      });
                                    }
                                    setActiveEdits(updatedEdits);
                                    setEditingId(null);
                                  } else if (ev.key === 'Escape') {
                                    setEditingId(null);
                                  }
                                }}
                                className="w-full h-full bg-transparent text-slate-900 dark:text-white text-xs font-semibold px-1 focus:outline-none"
                                autoFocus
                              />
                            </div>
                          ) : isRemoved ? (
                            <span className="text-[8px] font-bold text-red-400 bg-slate-900/85 px-1 py-0.5 rounded leading-none font-mono">X</span>
                          ) : isEdited ? (
                            <span className="text-[8px] font-bold text-emerald-400 bg-slate-900/85 px-1 py-0.5 rounded leading-none font-mono">✓</span>
                          ) : null}
                        </div>
                      );
                    })}
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-2 text-center">
                    {isNativePdf 
                      ? 'Click on any text box to reveal Edit & Delete options, or double-click to edit directly.'
                      : (!isNativePdf && ocrStatus === 'scanning')
                      ? 'AI is analyzing text regions in the background. Detected boxes will appear shortly.' 
                      : 'Click any box on Page 1 or from the list to select, edit, or delete.'}
                  </p>
                </div>
                
                {/* Right Side: Text lines list & edits */}
                <div className="w-full md:w-80 flex flex-col gap-4 min-h-0">
                  <h4 className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                    <span>{isNativePdf ? 'PDF Page 1 Text Blocks' : 'Detected Text Regions'} ({displayedItems.length})</span>
                  </h4>

                  {/* Scanning Skeleton State (OCR only) */}
                  {!isNativePdf && ocrStatus === 'scanning' && (
                    <div className="flex-1 flex flex-col justify-center items-center gap-3.5 p-4 bg-slate-50/70 dark:bg-[#101026] rounded-2xl border border-dashed border-indigo-300/40 dark:border-[#24244d] text-center min-h-[260px]">
                      <div className="relative flex items-center justify-center">
                        <div className="w-12 h-12 rounded-full border-2 border-indigo-500/20 border-t-indigo-500 animate-spin"></div>
                        <Zap className="w-5 h-5 text-brand absolute" />
                      </div>
                      <div className="flex flex-col gap-1">
                        <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">Analyzing Document Text</p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 max-w-[220px] leading-relaxed">
                          AI OCR is reading text layers and coordinates in the background...
                        </p>
                      </div>
                      <div className="w-full space-y-2 mt-2">
                        <div className="h-7 bg-indigo-500/10 dark:bg-indigo-950/40 rounded-lg animate-pulse w-full"></div>
                        <div className="h-7 bg-indigo-500/10 dark:bg-indigo-950/40 rounded-lg animate-pulse w-5/6 mx-auto"></div>
                        <div className="h-7 bg-indigo-500/10 dark:bg-indigo-950/40 rounded-lg animate-pulse w-full"></div>
                      </div>
                    </div>
                  )}

                  {/* Error State */}
                  {!isNativePdf && ocrStatus === 'error' && (
                    <div className="flex-1 flex flex-col justify-center items-center gap-3 p-4 bg-red-50/50 dark:bg-red-950/20 rounded-2xl border border-red-200 dark:border-red-900/40 text-center min-h-[220px]">
                      <AlertCircle className="w-8 h-8 text-red-400" />
                      <p className="text-xs font-semibold text-red-600 dark:text-red-300">OCR Detection Failed</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        Could not detect text regions. You can retry the OCR scan.
                      </p>
                      <button
                        onClick={() => triggerOcrDetection(originalImageUrl)}
                        className="mt-2 inline-flex items-center space-x-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl transition-colors shadow-sm"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Retry Scan</span>
                      </button>
                    </div>
                  )}

                  {/* Empty State when no text detected */}
                  {(isNativePdf || ocrStatus === 'ready') && displayedItems.length === 0 && (
                    <div className="flex-1 flex flex-col justify-center items-center gap-2.5 p-4 bg-slate-50 dark:bg-[#101026] rounded-2xl border border-slate-200 dark:border-[#1c1c38] text-center min-h-[220px]">
                      <CheckCircle className="w-8 h-8 text-slate-400" />
                      <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">No Text Detected</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 max-w-[200px]">
                        No editable text was found in this document page.
                      </p>
                    </div>
                  )}

                  {/* Ready State with detected text list */}
                  {(isNativePdf || ocrStatus === 'ready') && displayedItems.length > 0 && (
                    <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-2 max-h-[350px]">
                      {displayedItems.map((item: any) => {
                        const edit = activeEdits.find(e => e.id === item.id);
                        const isRemoved = edit?.action === 'remove';
                        const isEdited = edit?.action === 'replace';
                        
                        if (editingId === item.id) {
                          return (
                            <div key={item.id} className="flex flex-col gap-1.5 p-2.5 rounded-xl bg-indigo-50/50 dark:bg-[#1a1a36] border border-indigo-200 dark:border-indigo-850">
                              <span className="text-[10px] text-slate-500 font-semibold uppercase">Edit Text content</span>
                              <input 
                                type="text" 
                                value={editingTextVal} 
                                onChange={(e) => setEditingTextVal(e.target.value)} 
                                className="premium-input text-xs w-full py-1 px-2"
                                autoFocus
                              />
                              <div className="flex items-center space-x-1.5 justify-end mt-1">
                                <button 
                                  onClick={() => {
                                    const updatedEdits = activeEdits.filter(e => e.id !== item.id);
                                    if (isNativePdf) {
                                      updatedEdits.push({
                                        id: item.id,
                                        pdf_rect: item.pdf_rect,
                                        action: 'replace',
                                        new_text: editingTextVal,
                                        original_text: item.text,
                                        font_size: item.font_size,
                                        font_name: item.font_name,
                                        color: item.color
                                      });
                                    } else {
                                      updatedEdits.push({
                                        id: item.id,
                                        box: item.box,
                                        action: 'replace',
                                        new_text: editingTextVal,
                                        original_text: item.text,
                                        angle: item.angle,
                                        color: item.color,
                                        width: item.width,
                                        height: item.height
                                      });
                                    }
                                    setActiveEdits(updatedEdits);
                                    setEditingId(null);
                                  }}
                                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold px-2.5 py-1 rounded-md transition-colors"
                                >
                                  Save
                                </button>
                                <button 
                                  onClick={() => setEditingId(null)}
                                  className="bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-350 hover:bg-slate-300 dark:hover:bg-slate-700 text-[10px] font-bold px-2.5 py-1 rounded-md transition-colors"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          );
                        }
                        
                        return (
                          <div key={item.id} className={`p-2.5 rounded-xl border flex items-center justify-between transition-colors ${
                            isRemoved 
                              ? 'bg-red-500/10 border-red-500/20' 
                              : isEdited 
                              ? 'bg-emerald-500/10 border-emerald-500/20' 
                              : 'bg-white/40 dark:bg-[#0c0c1c]/60 border-slate-200/50 dark:border-[#171732]'
                          }`}>
                            <div className="flex flex-col min-w-0 pr-2">
                              <span className={`text-xs font-medium text-slate-750 dark:text-slate-200 truncate ${isRemoved ? 'line-through opacity-50' : ''}`}>
                                {isEdited ? edit.new_text : item.text}
                              </span>
                              {isEdited && (
                                <span className="text-[9px] text-slate-400 line-through truncate">
                                  orig: {item.text}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center space-x-1.5 flex-shrink-0">
                              <button
                                onClick={() => {
                                  setEditingId(item.id);
                                  setEditingTextVal(isEdited ? edit.new_text : item.text);
                                }}
                                disabled={isRemoved}
                                title="Edit text"
                                className="p-1 text-slate-400 hover:text-brand dark:hover:text-indigo-400 disabled:opacity-30 disabled:pointer-events-none transition-all hover:scale-110 active:scale-95"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => {
                                  const exists = activeEdits.find(e => e.id === item.id);
                                  if (exists && exists.action === 'remove') {
                                    setActiveEdits(activeEdits.filter(e => e.id !== item.id));
                                  } else {
                                    const updatedEdits = activeEdits.filter(e => e.id !== item.id);
                                    if (isNativePdf) {
                                      updatedEdits.push({
                                        id: item.id,
                                        pdf_rect: item.pdf_rect,
                                        action: 'remove',
                                        original_text: item.text,
                                        font_size: item.font_size,
                                        font_name: item.font_name,
                                        color: item.color
                                      });
                                    } else {
                                      updatedEdits.push({
                                        id: item.id,
                                        box: item.box,
                                        action: 'remove',
                                        original_text: item.text
                                      });
                                    }
                                    setActiveEdits(updatedEdits);
                                  }
                                }}
                                title={isRemoved ? "Undo deletion" : "Delete text"}
                                className={`p-1 transition-all hover:scale-110 active:scale-95 ${
                                  isRemoved 
                                    ? 'text-amber-500 hover:text-amber-600 dark:hover:text-amber-400' 
                                    : 'text-slate-400 hover:text-red-500 dark:hover:text-red-400'
                                }`}
                              >
                                {isRemoved ? <RotateCcw className="w-3.5 h-3.5" /> : <Trash2 className="w-3.5 h-3.5" />}
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                  
                  {/* Modal actions sidebar bottom */}
                  {(isNativePdf || ocrStatus === 'ready') && displayedItems.length > 0 && (
                    <div className="border-t border-slate-200 dark:border-[#1a1a32] pt-3 flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            if (isNativePdf) {
                              const allRemoves = nativePdfTextBlocks.map((item: any) => ({
                                id: item.id,
                                pdf_rect: item.pdf_rect,
                                action: 'remove',
                                original_text: item.text,
                                font_size: item.font_size,
                                font_name: item.font_name,
                                color: item.color
                              }));
                              setActiveEdits(allRemoves);
                            } else {
                              const allRemoves = ocrResults.map((item: any) => ({
                                id: item.id,
                                box: item.box,
                                action: 'remove',
                                original_text: item.text
                              }));
                              setActiveEdits(allRemoves);
                            }
                          }}
                          className="flex-1 py-1.5 text-xs font-semibold bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/30 hover:border-red-500/60 rounded-xl transition-all shadow-sm active:scale-[0.99]"
                        >
                          Delete All Text
                        </button>
                        
                        <button
                          onClick={() => {
                            setActiveEdits([]);
                            setAppliedEdits([]);
                            setImageUrl(originalImageUrl);
                          }}
                          className="px-2.5 py-1.5 text-xs font-semibold bg-slate-100 dark:bg-[#151532] text-slate-650 dark:text-slate-350 hover:bg-slate-200 dark:hover:bg-[#1a1a3e] border border-slate-200 dark:border-[#2b2b5a] rounded-xl transition-colors"
                        >
                          Reset
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Modal Footer */}
              <div className="border-t border-slate-200 dark:border-[#1a1a32] pt-3.5 flex items-center justify-end space-x-3">
                <button
                  onClick={() => {
                    setActiveEdits(appliedEdits);
                    setIsEditingText(false);
                  }}
                  disabled={isApplyingEdits}
                  className="px-4 py-2 text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-all disabled:opacity-50"
                >
                  Continue without changes
                </button>
                <button
                  onClick={async () => {
                    if (activeEdits.length > 0) {
                      await handleApplyEdits(activeEdits, true);
                    } else {
                      setAppliedEdits([]);
                      setImageUrl(originalImageUrl);
                      setIsEditingText(false);
                    }
                  }}
                  disabled={isApplyingEdits || (!isNativePdf && ocrStatus === 'scanning')}
                  className="px-5 py-2 text-xs font-bold bg-gradient-to-r from-fuchsia-600 to-purple-600 hover:from-fuchsia-700 hover:to-purple-700 text-white rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center space-x-1.5 disabled:opacity-50"
                >
                  {isApplyingEdits ? (
                    <>
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                      <span>Applying...</span>
                    </>
                  ) : (
                    <span>Apply & Continue</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}

export default App;