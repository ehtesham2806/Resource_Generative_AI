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
  ChevronLeft,
  ChevronRight,
  Check,
  Sun,
  Moon,
  MoveVertical,
  Sparkles,
  RefreshCw,
  Pencil,
  Trash2,
  X,
  Upload,
  LayoutGrid,
  Square,
  SlidersHorizontal,
  Search,
  Filter,
} from 'lucide-react';
import LaptopMockup from './components/mockups/LaptopMockup.tsx';
import BookMockup from './components/mockups/BookMockup.tsx';
import PhoneMockup from './components/mockups/PhoneMockup.tsx';
import TabletMockup from './components/mockups/TabletMockup.tsx';
import DefaultMockup from './components/mockups/DefaultMockup.tsx';
import WebinarMockup from './components/mockups/WebinarMockup.tsx';
import GuideMockup from './components/mockups/GuideMockup.tsx';
import CustomDesignEditor from './components/CustomDesignEditor.tsx';
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
  const [editingFontSize, setEditingFontSize] = useState<number>(14);
  const [dominantColor, setDominantColor] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [fileName, setFileName] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [backendStatus, setBackendStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const [objectFit, setObjectFit] = useState<'contain' | 'cover'>('contain');
  const [activeSidebarTab, setActiveSidebarTab] = useState<'upload' | 'canvas' | 'template'>('upload');
  const [templateSearch, setTemplateSearch] = useState<string>('');
  const [templateCategory, setTemplateCategory] = useState<string>('All');
  
  const defaultMockupRef = useRef<HTMLDivElement>(null);
  const laptopMockupRef = useRef<HTMLDivElement>(null);
  const bookMockupRef = useRef<HTMLDivElement>(null);
  const phoneMockupRef = useRef<HTMLDivElement>(null);
  const tabletMockupRef = useRef<HTMLDivElement>(null);
  const webinarMockupRef = useRef<HTMLDivElement>(null);
  const guideMockupRef = useRef<HTMLDivElement>(null);
  const customDesignRef = useRef<HTMLDivElement>(null);
  const [customToolbarSlot, setCustomToolbarSlot] = useState<HTMLDivElement | null>(null);
  
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
  const [activeTextSection, setActiveTextSection] = useState<'heading' | 'description' | 'badge' | null>(null);
  const [isBrandAnimating, setIsBrandAnimating] = useState<boolean>(false);

  const [exportScale, setExportScale] = useState<number>(1);
  const [isScaleDropdownOpen, setIsScaleDropdownOpen] = useState<boolean>(false);
  const [isHeaderScaleDropdownOpen, setIsHeaderScaleDropdownOpen] = useState<boolean>(false);

  const bottomScaleDropdownRef = useRef<HTMLDivElement>(null);
  const headerScaleDropdownRef = useRef<HTMLDivElement>(null);
  const modificationToolbarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (
        bottomScaleDropdownRef.current &&
        !bottomScaleDropdownRef.current.contains(target)
      ) {
        setIsScaleDropdownOpen(false);
      }
      if (
        headerScaleDropdownRef.current &&
        !headerScaleDropdownRef.current.contains(target)
      ) {
        setIsHeaderScaleDropdownOpen(false);
      }
      if (
        modificationToolbarRef.current &&
        !modificationToolbarRef.current.contains(target) &&
        !target.closest('.clickable-trigger')
      ) {
        setActiveTextSection(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    setActiveTextSection(null);
  }, [mockupTemplate]);

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

  const handleUpdateBlockFontSize = (itemId: string, deltaOrExact: number, isExact = false) => {
    const item = displayedItems.find((it: any) => it.id === itemId);
    if (!item) return;
    const existingEdit = activeEdits.find(e => e.id === itemId);
    const currentSize = existingEdit?.font_size || item.font_size || 14;
    const newSize = isExact ? Math.max(6, deltaOrExact) : Math.max(6, Math.round(currentSize + deltaOrExact));
    
    const updatedEdits = activeEdits.filter(e => e.id !== itemId);
    if (isNativePdf) {
      updatedEdits.push({
        id: item.id,
        pdf_rect: existingEdit?.pdf_rect || item.pdf_rect,
        action: existingEdit?.action || 'replace',
        new_text: existingEdit?.new_text !== undefined ? existingEdit.new_text : item.text,
        original_text: item.text,
        font_size: newSize,
        font_name: existingEdit?.font_name || item.font_name,
        color: existingEdit?.color || item.color,
        flags: item.flags,
        rel_box: existingEdit?.rel_box || item.rel_box
      });
    } else {
      updatedEdits.push({
        id: item.id,
        box: existingEdit?.box || item.box,
        action: existingEdit?.action || 'replace',
        new_text: existingEdit?.new_text !== undefined ? existingEdit.new_text : item.text,
        original_text: item.text,
        angle: item.angle,
        color: existingEdit?.color || item.color,
        width: item.width,
        height: item.height,
        font_size: newSize
      });
    }
    setActiveEdits(updatedEdits);
    if (editingId === itemId) {
      setEditingFontSize(newSize);
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
      
      // Trigger a sleek reset animation
      setIsBrandAnimating(true);
      setTimeout(() => setIsBrandAnimating(false), 450);

      // Reset all Adjust values when switching brands
      setCoverPosition('0px');
      setCoverLeft('0px');
      setCoverScale(1.0);
      setFrameVerticalOffset(0);
      setFrameScale(1.0);
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
    } else if (mockupTemplate === 'custom') {
      await downloadCustomDesign();
    }
  };

  const downloadCustomDesign = async () => {
    if (!customDesignRef.current) return;
    try {
      setIsDownloading(true);
      const canvas = await htmlToImage.toCanvas(customDesignRef.current, {
        pixelRatio: 2 * exportScale,
        filter: (element) =>
          !(
            element instanceof HTMLElement &&
            (element.classList.contains('custom-tool-button') ||
              element.classList.contains('mockup-popover-exclude') ||
              element.classList.contains('custom-selection-border'))
          ),
      });
      const link = document.createElement('a');
      link.download = getDownloadFileName('custom-design');
      link.href = canvas.toDataURL('image/jpeg', 0.95);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (downloadError) {
      console.error('Custom design download failed:', downloadError);
      setError('Custom design download failed. Please try again.');
    } finally {
      setIsDownloading(false);
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
      return `${baseName}${scaleSuffix}.jpg`;
    }
    return `${defaultPrefix}-${Date.now()}-${exportScale}x.jpg`;
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
      link.href = finalCanvas.toDataURL('image/jpeg');

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
      link.href = finalCanvas.toDataURL('image/jpeg');

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
      link.href = finalCanvas.toDataURL('image/jpeg');

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
      link.href = finalCanvas.toDataURL('image/jpeg');

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
      link.href = finalCanvas.toDataURL('image/jpeg');

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
      link.href = finalCanvas.toDataURL('image/jpeg');

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
      link.href = finalCanvas.toDataURL('image/jpeg');

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
    <div className="h-screen w-screen overflow-hidden bg-slate-50 text-slate-800 dark:bg-[#07070c] dark:text-[#e2e8f0] flex flex-col font-['Plus_Jakarta_Sans',sans-serif] transition-colors duration-300">
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
                disabled={isLoading || isDownloading || (!imageUrl && mockupTemplate !== 'custom')}
                className="bg-gradient-to-r from-fuchsia-600 via-violet-600 to-purple-600 hover:from-fuchsia-700 hover:via-violet-700 hover:to-purple-700 text-white font-semibold text-xs px-4 py-2 rounded-l-full shadow-[0_4px_20px_rgba(139,92,246,0.25)] hover:shadow-[0_4px_25px_rgba(139,92,246,0.4)] hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center space-x-1.5 disabled:opacity-40 disabled:hover:scale-100 disabled:pointer-events-none border-r border-indigo-400/20"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export ({exportScale}x)</span>
              </button>
              <button
                onClick={() => setIsHeaderScaleDropdownOpen(!isHeaderScaleDropdownOpen)}
                disabled={isLoading || isDownloading || (!imageUrl && mockupTemplate !== 'custom')}
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

      {/* Main Layout Area: Left Sidebar Rail + Active Drawer + Live Preview Canvas */}
      <main className="flex-1 flex w-full overflow-hidden min-h-0">
        {/* 1. Left Vertical Navigation Rail (Upload -> Canvas -> Template -> Help) */}
        <aside className="w-[74px] flex-shrink-0 h-full bg-white/70 dark:bg-[#070712] border-r border-slate-200/80 dark:border-[#1c1c38] flex flex-col items-center justify-between py-5 transition-colors duration-300 z-20 overflow-y-auto">
          <div className="flex flex-col items-center space-y-3 w-full px-2">
            {/* Upload Tab */}
            <button
              onClick={() => setActiveSidebarTab('upload')}
              className={`w-full flex flex-col items-center justify-center py-2.5 rounded-2xl transition-all ${
                activeSidebarTab === 'upload'
                  ? 'bg-gradient-to-r from-fuchsia-600 via-violet-600 to-purple-600 text-white shadow-[0_4px_16px_rgba(168,85,247,0.3)] font-bold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#121226]'
              }`}
              title="Upload Source File"
            >
              <Upload className="w-5 h-5 mb-1" />
              <span className="text-[10px] font-medium tracking-tight">Upload</span>
            </button>

            {/* Canvas Tab */}
            <button
              onClick={() => setActiveSidebarTab('canvas')}
              className={`w-full flex flex-col items-center justify-center py-2.5 rounded-2xl transition-all ${
                activeSidebarTab === 'canvas'
                  ? 'bg-gradient-to-r from-fuchsia-600 via-violet-600 to-purple-600 text-white shadow-[0_4px_16px_rgba(168,85,247,0.3)] font-bold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#121226]'
              }`}
              title="Canvas Settings & Adjust"
            >
              <Square className="w-5 h-5 mb-1" />
              <span className="text-[10px] font-medium tracking-tight">Canvas</span>
            </button>

            {/* Template Tab */}
            <button
              onClick={() => setActiveSidebarTab('template')}
              className={`w-full flex flex-col items-center justify-center py-2.5 rounded-2xl transition-all ${
                activeSidebarTab === 'template'
                  ? 'bg-gradient-to-r from-fuchsia-600 via-violet-600 to-purple-600 text-white shadow-[0_4px_16px_rgba(168,85,247,0.3)] font-bold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#121226]'
              }`}
              title="Templates"
            >
              <LayoutGrid className="w-5 h-5 mb-1" />
              <span className="text-[10px] font-medium tracking-tight">Template</span>
            </button>
          </div>

          {/* Bottom Help Button */}
          <div className="w-full px-2">
            <button
              onClick={() => setActiveSidebarTab('upload')}
              className="w-full flex flex-col items-center justify-center py-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#121226] rounded-2xl transition-all"
              title="Help & Shortcuts"
            >
              <HelpCircle className="w-4 h-4 mb-0.5" />
              <span className="text-[9px] font-medium">Help</span>
            </button>
          </div>
        </aside>

        {/* 2. Active Tab Drawer Panel (~340px width) */}
        <aside className="w-[340px] flex-shrink-0 h-full bg-white/40 dark:bg-[#090918]/90 backdrop-blur-md border-r border-slate-200/80 dark:border-[#1c1c38] p-5 overflow-y-auto transition-all duration-300 flex flex-col gap-5">
          {/* Active Tab Header */}
          <div className="flex items-center justify-between pb-2 border-b border-slate-200/60 dark:border-[#1a1a32]">
            <h3 className="text-sm font-bold text-slate-800 dark:text-white capitalize flex items-center font-['Outfit']">
              {activeSidebarTab === 'upload' && <Upload className="w-4 h-4 mr-2 text-brand" />}
              {activeSidebarTab === 'canvas' && <Square className="w-4 h-4 mr-2 text-brand" />}
              {activeSidebarTab === 'template' && <LayoutGrid className="w-4 h-4 mr-2 text-brand" />}
              {activeSidebarTab === 'upload' && 'Upload File'}
              {activeSidebarTab === 'canvas' && 'Canvas Settings'}
              {activeSidebarTab === 'template' && 'Templates'}
            </h3>
          </div>

          {/* TAB 1: UPLOAD */}
          {activeSidebarTab === 'upload' && (
            <div className="flex flex-col gap-5">
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

              {/* Capabilities checklist card */}
              <div className="premium-card rounded-2xl p-4 flex flex-col gap-3">
                <h4 className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-widest flex items-center">
                  <Zap className="w-3 h-3 mr-1.5 text-brand" />
                  Capabilities
                </h4>
                <div className="flex flex-col gap-2.5">
                  <div className="flex items-center space-x-3 bg-white/40 dark:bg-[#0c0c1c]/60 border border-slate-200/50 dark:border-[#171732] px-3 py-2 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300">
                    <div className="p-1 bg-indigo-500/10 rounded-lg text-brand">
                      <ImageIcon className="w-3.5 h-3.5" />
                    </div>
                    <span>Image optimization</span>
                  </div>
                  <div className="flex items-center space-x-3 bg-white/40 dark:bg-[#0c0c1c]/60 border border-slate-200/50 dark:border-[#171732] px-3 py-2 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300">
                    <div className="p-1 bg-indigo-500/10 rounded-lg text-brand">
                      <FileText className="w-3.5 h-3.5" />
                    </div>
                    <span>PDF first-page extract</span>
                  </div>
                  <div className="flex items-center space-x-3 bg-white/40 dark:bg-[#0c0c1c]/60 border border-slate-200/50 dark:border-[#171732] px-3 py-2 rounded-xl text-xs font-medium text-slate-700 dark:text-slate-300">
                    <div className="p-1 bg-indigo-500/10 rounded-lg text-brand">
                      <Tv className="w-3.5 h-3.5" />
                    </div>
                    <span>Live preview engine</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: TEMPLATES (Visual Cards with Search & Category Tabs, No size text) */}
          {activeSidebarTab === 'template' && (() => {
            const templates = [
              {
                id: 'default',
                name: 'Default',
                category: 'All',
                previewBg: 'bg-gradient-to-br from-[#f8d7b8] to-[#e6b994] dark:from-[#2a1d15] dark:to-[#17120e]',
                preview: (
                  <div className="w-full h-full relative flex items-center justify-center p-0.5 bg-[#0a1128] dark:bg-[#070c1e] overflow-hidden rounded-xl">
                    <img 
                      src="/default-mockup.jpg" 
                      alt="Default" 
                      className="w-full h-full object-cover rounded-lg shadow-sm"
                    />
                  </div>
                ),
                onClick: () => {
                  setMockupTemplate('default');
                  setObjectFit('contain');
                  setCoverPosition('0px');
                  setCoverLeft('0px');
                  setCoverScale(1.0);
                }
              },
              {
                id: 'webinar',
                name: 'Webinar',
                category: 'Webinar',
                previewBg: 'bg-[#2554eb]',
                preview: (
                  <div className="w-full h-full relative flex items-center justify-center overflow-hidden">
                    <img 
                      src="/templateThumbnails/webinar.png" 
                      alt="Webinar" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                ),
                onClick: () => setMockupTemplate('webinar')
              },
              {
                id: 'book',
                name: 'Book',
                category: 'Book',
                previewBg: 'bg-[#f4f4f6] dark:bg-[#1a1a22]',
                preview: (
                  <div className="w-full h-full relative flex items-center justify-center overflow-hidden">
                    <img 
                      src="/templateThumbnails/book.png" 
                      alt="Book" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                ),
                onClick: () => setMockupTemplate('book')
              },
              {
                id: 'laptop',
                name: 'Laptop',
                category: 'App',
                previewBg: 'bg-[#fafafa] dark:bg-[#161622]',
                preview: (
                  <div className="w-full h-full relative flex items-center justify-center overflow-hidden">
                    <img 
                      src="/templateThumbnails/laptop.png" 
                      alt="Laptop" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                ),
                onClick: () => setMockupTemplate('laptop')
              },
              {
                id: 'phone',
                name: 'Phone',
                category: 'Social Media',
                previewBg: 'bg-pink-100 dark:bg-[#2c1020]',
                preview: (
                  <div className="w-full h-full relative flex items-center justify-center overflow-hidden">
                    <img 
                      src="/templateThumbnails/mobile.png" 
                      alt="Phone" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                ),
                onClick: () => setMockupTemplate('phone')
              },
              {
                id: 'tablet',
                name: 'Tablet',
                category: 'App',
                previewBg: 'bg-slate-100 dark:bg-[#12141f]',
                preview: (
                  <div className="w-full h-full relative flex items-center justify-center overflow-hidden">
                    <img 
                      src="/templateThumbnails/tablet.png" 
                      alt="Tablet" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                ),
                onClick: () => setMockupTemplate('tablet')
              },
              {
                id: 'guide',
                name: 'Guide',
                category: 'Book',
                previewBg: 'bg-amber-50 dark:bg-[#1a1510]',
                preview: (
                  <div className="w-full h-full relative flex items-center justify-center overflow-hidden">
                    <img 
                      src="/templateThumbnails/guide.png" 
                      alt="Guide" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                ),
                onClick: () => setMockupTemplate('guide')
              },
              {
                id: 'custom',
                name: 'Custom Design',
                category: 'Custom',
                previewBg: 'bg-[#fff7ed] dark:bg-[#24150d]',
                preview: (
                  <div className="w-full h-full relative overflow-hidden bg-[#f97316] p-2">
                    <div className="absolute inset-2 border border-white/50 border-dashed rounded-lg"></div>
                    <div className="absolute left-4 top-5 w-10 h-8 bg-white rounded-md rotate-[-8deg] shadow-lg"></div>
                    <div className="absolute right-4 bottom-4 w-12 h-2 bg-white/80 rounded-full"></div>
                  </div>
                ),
                onClick: () => setMockupTemplate('custom')
              }
            ];

            const categories = ['All', 'Social Media', 'Webinar', 'Book', 'App', 'Custom'];

            const filteredTemplates = templates.filter((t) => {
              const matchesSearch = t.name.toLowerCase().includes(templateSearch.toLowerCase());
              const matchesCategory = templateCategory === 'All' || t.category === templateCategory;
              return matchesSearch && matchesCategory;
            });

            return (
              <div className="flex flex-col gap-4">
                {/* Search & Filter Bar */}
                <div className="relative flex items-center">
                  <Search className="w-4 h-4 absolute left-3 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    value={templateSearch}
                    onChange={(e) => setTemplateSearch(e.target.value)}
                    placeholder="Search templates..."
                    className="w-full bg-slate-100/70 dark:bg-[#111124] border border-slate-200/80 dark:border-[#222240] rounded-xl pl-9 pr-8 py-2 text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition-all"
                  />
                  <button className="absolute right-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                    <SlidersHorizontal className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Category Tabs */}
                <div className="flex items-center space-x-3 overflow-x-auto pb-1 scrollbar-none border-b border-slate-200/60 dark:border-[#1a1a32]">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setTemplateCategory(cat)}
                      className={`relative pb-2 text-xs font-semibold whitespace-nowrap transition-colors ${
                        templateCategory === cat
                          ? 'text-slate-900 dark:text-white'
                          : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                      }`}
                    >
                      {cat}
                      {templateCategory === cat && (
                        <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-violet-500 rounded-full"></span>
                      )}
                    </button>
                  ))}
                </div>

                {/* Template Cards Grid (2 Columns, NO size text) */}
                <div className="grid grid-cols-2 gap-3 pt-1">
                  {filteredTemplates.map((item) => {
                    const isSelected = mockupTemplate === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={item.onClick}
                        className={`group relative text-left rounded-2xl p-1.5 transition-all flex flex-col ${
                          isSelected
                            ? 'ring-2 ring-violet-500 bg-violet-500/10 dark:bg-violet-950/30'
                            : 'hover:bg-slate-100 dark:hover:bg-[#141428]'
                        }`}
                      >
                        {/* Thumbnail container */}
                        <div className="relative aspect-[16/10] w-full rounded-xl overflow-hidden mb-2 shadow-sm">
                          {item.preview}

                          {/* Selected checkmark badge */}
                          {isSelected && (
                            <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-violet-600 text-white flex items-center justify-center shadow-lg border border-white/20">
                              <Check className="w-3 h-3 stroke-[3]" />
                            </div>
                          )}
                        </div>

                        {/* Title only (NO size text) */}
                        <span className={`text-xs font-bold px-1 transition-colors ${
                          isSelected ? 'text-violet-600 dark:text-violet-400' : 'text-slate-800 dark:text-slate-200 group-hover:text-slate-900 dark:group-hover:text-white'
                        }`}>
                          {item.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })()}

          {/* TAB 3: CANVAS */}
          {activeSidebarTab === 'canvas' && (
            <div className="flex flex-col gap-4">
              {/* Brand Selector Dropdown */}
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                  Brand Preset
                </label>
                <SearchableBrandDropdown
                  selectedBrand={selectedBrand}
                  onBrandSelect={handleBrandChange}
                />
              </div>

              {/* Background Color Picker Input */}
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                  Background Color
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

              {/* Quick Background Theme Presets */}
              <div className="flex flex-wrap gap-2">
                {colorPresets.map((preset) => (
                  <button
                    key={preset.name}
                    onClick={() => {
                      setBackgroundColor(preset.value);
                      setSelectedBrand('');
                    }}
                    className={`px-2.5 py-1 rounded-full text-[10px] font-semibold border flex items-center transition-all ${
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
              <div className="grid grid-cols-2 gap-3">
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

              {/* Object Fit Control */}
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                  Object Fit
                </label>
                <div className={`grid grid-cols-2 gap-2 bg-slate-100/70 dark:bg-[#0e0e24] border border-slate-200/60 dark:border-[#1c1c38] p-1 rounded-xl ${
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
                    className={`py-1.5 rounded-lg text-xs font-semibold transition-all ${
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
                    className={`py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      objectFit === 'cover'
                        ? 'bg-[#3359e9] text-white shadow-md'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    Cover
                  </button>
                </div>
              </div>

              {/* Separator Line & Transform / Adjust Modification Items */}
              <div className="pt-4 mt-1 border-t border-slate-200/80 dark:border-[#1c1c38] flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-slate-800 dark:text-white capitalize flex items-center font-['Outfit']">
                    <SlidersHorizontal className="w-3.5 h-3.5 mr-1.5 text-brand" />
                    Transform & Adjust
                  </span>
                  <button
                    onClick={() => {
                      setCoverPosition('0px');
                      setCoverLeft('0px');
                      setCoverScale(1.0);
                      setFrameVerticalOffset(0);
                      setFrameScale(1.0);
                    }}
                    className="flex items-center space-x-1 px-2 py-0.5 text-[10px] font-semibold text-slate-600 hover:text-brand dark:text-slate-400 dark:hover:text-indigo-300 bg-slate-100/80 hover:bg-indigo-50/80 dark:bg-[#121226] dark:hover:bg-[#1c1c3c] border border-slate-200/80 dark:border-[#1e1e3e] rounded-lg transition-all shadow-sm hover:scale-[1.02] active:scale-[0.98] cursor-pointer select-none"
                    title="Reset all transform & adjust sliders"
                  >
                    <RotateCcw className="w-2.5 h-2.5 text-slate-400 dark:text-slate-500 group-hover:text-brand" />
                    <span>Reset All</span>
                  </button>
                </div>

                {/* Vertical position slider */}
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-600 dark:text-slate-400 text-[10px] uppercase tracking-wider">Vertical</span>
                    <div className="flex items-center gap-1.5">
                      <div className="flex items-center bg-indigo-50/80 dark:bg-[#10102a] border border-indigo-100 dark:border-[#1c1c3c] rounded-lg px-1 py-0.5 shadow-sm">
                        <button
                          type="button"
                          onClick={() => {
                            const val = parseInt(coverPosition) || 0;
                            setCoverPosition(`${Math.max(-1000, val - 1)}px`);
                          }}
                          className="p-0.5 text-indigo-400 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-200 hover:bg-indigo-100/70 dark:hover:bg-[#1c1c3c] rounded transition-all active:scale-90"
                          title="Decrease (-1px)"
                        >
                          <ChevronLeft className="w-3 h-3" />
                        </button>
                        <div className="flex items-center justify-center min-w-[38px] px-0.5">
                          <input
                            type="number"
                            value={parseInt(coverPosition) || 0}
                            min="-1000"
                            max="1000"
                            style={{ width: `${Math.max(1, String(parseInt(coverPosition) || 0).length) * 7.2 + 2}px` }}
                            onChange={(e) => {
                              let val = parseInt(e.target.value);
                              if (isNaN(val)) val = 0;
                              val = Math.max(-1000, Math.min(1000, val));
                              setCoverPosition(`${val}px`);
                            }}
                            className="text-right bg-transparent text-indigo-600 dark:text-indigo-300 font-bold text-[10px] focus:outline-none border-none p-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          />
                          <span className="text-indigo-400 dark:text-indigo-500 font-bold text-[10px] select-none pl-0 ml-0">px</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            const val = parseInt(coverPosition) || 0;
                            setCoverPosition(`${Math.min(1000, val + 1)}px`);
                          }}
                          className="p-0.5 text-indigo-400 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-200 hover:bg-indigo-100/70 dark:hover:bg-[#1c1c3c] rounded transition-all active:scale-90"
                          title="Increase (+1px)"
                        >
                          <ChevronRight className="w-3 h-3" />
                        </button>
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
                    min="-1000"
                    max="1000"
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
                      <div className="flex items-center bg-indigo-50/80 dark:bg-[#10102a] border border-indigo-100 dark:border-[#1c1c3c] rounded-lg px-1 py-0.5 shadow-sm">
                        <button
                          type="button"
                          onClick={() => {
                            const val = parseInt(coverLeft) || 0;
                            setCoverLeft(`${Math.max(-1000, val - 1)}px`);
                          }}
                          className="p-0.5 text-indigo-400 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-200 hover:bg-indigo-100/70 dark:hover:bg-[#1c1c3c] rounded transition-all active:scale-90"
                          title="Decrease (-1px)"
                        >
                          <ChevronLeft className="w-3 h-3" />
                        </button>
                        <div className="flex items-center justify-center min-w-[38px] px-0.5">
                          <input
                            type="number"
                            value={parseInt(coverLeft) || 0}
                            min="-1000"
                            max="1000"
                            style={{ width: `${Math.max(1, String(parseInt(coverLeft) || 0).length) * 7.2 + 2}px` }}
                            onChange={(e) => {
                              let val = parseInt(e.target.value);
                              if (isNaN(val)) val = 0;
                              val = Math.max(-1000, Math.min(1000, val));
                              setCoverLeft(`${val}px`);
                            }}
                            className="text-right bg-transparent text-indigo-600 dark:text-indigo-300 font-bold text-[10px] focus:outline-none border-none p-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          />
                          <span className="text-indigo-400 dark:text-indigo-500 font-bold text-[10px] select-none pl-0 ml-0">px</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            const val = parseInt(coverLeft) || 0;
                            setCoverLeft(`${Math.min(1000, val + 1)}px`);
                          }}
                          className="p-0.5 text-indigo-400 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-200 hover:bg-indigo-100/70 dark:hover:bg-[#1c1c3c] rounded transition-all active:scale-90"
                          title="Increase (+1px)"
                        >
                          <ChevronRight className="w-3 h-3" />
                        </button>
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
                    min="-1000"
                    max="1000"
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
                      <div className="flex items-center bg-indigo-50/80 dark:bg-[#10102a] border border-indigo-100 dark:border-[#1c1c3c] rounded-lg px-1 py-0.5 shadow-sm">
                        <button
                          type="button"
                          onClick={() => {
                            setCoverScale(Math.max(0.1, parseFloat((coverScale - 0.1).toFixed(2))));
                          }}
                          className="p-0.5 text-indigo-400 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-200 hover:bg-indigo-100/70 dark:hover:bg-[#1c1c3c] rounded transition-all active:scale-90"
                          title="Decrease (-0.1x)"
                        >
                          <ChevronLeft className="w-3 h-3" />
                        </button>
                        <div className="flex items-center justify-center min-w-[38px] px-0.5">
                          <input
                            type="number"
                            step="0.05"
                            value={parseFloat(coverScale.toFixed(2))}
                            min="0.1"
                            max="10.0"
                            style={{ width: `${String(parseFloat(coverScale.toFixed(2))).length * 7.2 + 2}px` }}
                            onChange={(e) => {
                              let val = parseFloat(e.target.value);
                              if (isNaN(val)) val = 1.0;
                              val = Math.max(0.1, Math.min(10.0, val));
                              setCoverScale(val);
                            }}
                            className="text-right bg-transparent text-indigo-600 dark:text-indigo-300 font-bold text-[10px] focus:outline-none border-none p-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          />
                          <span className="text-indigo-400 dark:text-indigo-500 font-bold text-[10px] select-none pl-0 ml-0">x</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setCoverScale(Math.min(10.0, parseFloat((coverScale + 0.1).toFixed(2))));
                          }}
                          className="p-0.5 text-indigo-400 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-200 hover:bg-indigo-100/70 dark:hover:bg-[#1c1c3c] rounded transition-all active:scale-90"
                          title="Increase (+0.1x)"
                        >
                          <ChevronRight className="w-3 h-3" />
                        </button>
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
                    min="0.1"
                    max="10.0"
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
                        <div className="flex items-center bg-indigo-50/80 dark:bg-[#10102a] border border-indigo-100 dark:border-[#1c1c3c] rounded-lg px-1 py-0.5 shadow-sm">
                          <button
                            type="button"
                            onClick={() => {
                              setFrameVerticalOffset(Math.max(-200, frameVerticalOffset - 1));
                            }}
                            className="p-0.5 text-indigo-400 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-200 hover:bg-indigo-100/70 dark:hover:bg-[#1c1c3c] rounded transition-all active:scale-90"
                            title="Decrease (-1px)"
                          >
                            <ChevronLeft className="w-3 h-3" />
                          </button>
                          <div className="flex items-center justify-center min-w-[38px] px-0.5">
                            <input
                              type="number"
                              value={frameVerticalOffset}
                              min="-200"
                              max="200"
                              style={{ width: `${Math.max(1, String(frameVerticalOffset).length) * 7.2 + 2}px` }}
                              onChange={(e) => {
                                let val = parseInt(e.target.value);
                                if (isNaN(val)) val = 0;
                                val = Math.max(-200, Math.min(200, val));
                                setFrameVerticalOffset(val);
                              }}
                              className="text-right bg-transparent text-indigo-600 dark:text-indigo-300 font-bold text-[10px] focus:outline-none border-none p-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            />
                            <span className="text-indigo-400 dark:text-indigo-500 font-bold text-[10px] select-none pl-0 ml-0">px</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setFrameVerticalOffset(Math.min(200, frameVerticalOffset + 1));
                            }}
                            className="p-0.5 text-indigo-400 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-200 hover:bg-indigo-100/70 dark:hover:bg-[#1c1c3c] rounded transition-all active:scale-90"
                            title="Increase (+1px)"
                          >
                            <ChevronRight className="w-3 h-3" />
                          </button>
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
                        <Maximize2 className="w-3.5 h-3.5 mr-1 text-brand" />
                        Frame Scale
                      </span>
                      <div className="flex items-center gap-1.5">
                        <div className="flex items-center bg-indigo-50/80 dark:bg-[#10102a] border border-indigo-100 dark:border-[#1c1c3c] rounded-lg px-1 py-0.5 shadow-sm">
                          <button
                            type="button"
                            onClick={() => {
                              setFrameScale(Math.max(0.5, parseFloat((frameScale - 0.05).toFixed(2))));
                            }}
                            className="p-0.5 text-indigo-400 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-200 hover:bg-indigo-100/70 dark:hover:bg-[#1c1c3c] rounded transition-all active:scale-90"
                            title="Decrease (-0.05x)"
                          >
                            <ChevronLeft className="w-3 h-3" />
                          </button>
                          <div className="flex items-center justify-center min-w-[38px] px-0.5">
                            <input
                              type="number"
                              step="0.05"
                              value={parseFloat(frameScale.toFixed(2))}
                              min="0.5"
                              max="2.0"
                              style={{ width: `${String(parseFloat(frameScale.toFixed(2))).length * 7.2 + 2}px` }}
                              onChange={(e) => {
                                let val = parseFloat(e.target.value);
                                if (isNaN(val)) val = 1.0;
                                val = Math.max(0.5, Math.min(2.0, val));
                                setFrameScale(val);
                              }}
                              className="text-right bg-transparent text-indigo-600 dark:text-indigo-300 font-bold text-[10px] focus:outline-none border-none p-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            />
                            <span className="text-indigo-400 dark:text-indigo-500 font-bold text-[10px] select-none pl-0 ml-0">x</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setFrameScale(Math.min(2.0, parseFloat((frameScale + 0.05).toFixed(2))));
                            }}
                            className="p-0.5 text-indigo-400 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-200 hover:bg-indigo-100/70 dark:hover:bg-[#1c1c3c] rounded transition-all active:scale-90"
                            title="Increase (+0.05x)"
                          >
                            <ChevronRight className="w-3 h-3" />
                          </button>
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
          )}
        </aside>

        {/* 3. Right-Side Viewport: Live Mockup Preview Card */}
        <div className="flex-1 min-w-0 h-full p-6 overflow-y-auto flex flex-col items-center justify-start">
          
          {/* Live Preview Header row with Contain / Cover toggle */}
          <div className="w-full max-w-5xl flex items-center justify-between mb-3 px-1">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white font-['Outfit']">
                Live Preview
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Real-time preview with brand-matching typography
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

          <div className="w-full max-w-5xl relative bg-white/45 dark:bg-[#0c0c1c] border border-slate-200/65 dark:border-[#1c1c38] rounded-3xl p-6 shadow-2xl flex flex-col items-center transition-all duration-300">
              
              {/* Top Canvas Header Controls */}
              <div className="absolute top-4 left-6 right-6 z-20 flex items-center justify-between pointer-events-none">
                {/* Left Badges */}
                <div className="flex items-center space-x-2 pointer-events-auto">
                  <div className="bg-white/80 dark:bg-[#080814]/80 backdrop-blur-md border border-slate-200/60 dark:border-[#1c1c38] text-[10px] text-slate-600 dark:text-slate-300 font-semibold px-3 py-1.5 rounded-full flex items-center space-x-1.5 transition-colors duration-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span>{outputWidth} × {outputHeight}</span>
                  </div>
                  <div className="bg-white/80 dark:bg-[#080814]/80 backdrop-blur-md border border-slate-200/60 dark:border-[#1c1c38] text-[10px] text-slate-600 dark:text-slate-300 font-semibold px-3 py-1.5 rounded-full transition-colors duration-300">
                    100%
                  </div>
                </div>

                {/* Right: Custom Design Toolbar OR Modification Toolbar + Edit PDF Text */}
                {mockupTemplate === 'custom' ? (
                  <div
                    id="custom-design-toolbar-slot"
                    ref={setCustomToolbarSlot}
                    className="flex items-center justify-end pointer-events-auto z-30 overflow-visible"
                  />
                ) : (
                  <div className="flex items-center space-x-2.5 pointer-events-auto">
                    {/* Modification Toolbar for Webinar and Guide Mockups - Shown only when an element is clicked */}
                    {(mockupTemplate === 'webinar' || mockupTemplate === 'guide') && activeTextSection && (
                      <div 
                        ref={modificationToolbarRef}
                        className="bg-[#0e0e1e]/90 dark:bg-[#0c0c1c]/95 backdrop-blur-md border border-slate-700/80 rounded-full px-3 py-1 shadow-lg flex items-center gap-2.5 text-xs text-white"
                      >
                        {/* Heading Controls */}
                        {activeTextSection === 'heading' && (
                          <>
                            <button
                              onClick={() => {
                                if (mockupTemplate === 'webinar') {
                                  setWebinarHeadingSize(Math.max(10, webinarHeadingSize - 1));
                                } else {
                                  setGuideHeadingSize(Math.max(10, guideHeadingSize - 1));
                                }
                              }}
                              className="w-6 h-6 flex items-center justify-center rounded-md bg-slate-800/80 hover:bg-slate-700 border border-slate-700/60 text-white font-bold text-xs cursor-pointer select-none transition-colors"
                            >
                              -
                            </button>
                            <span className="text-xs font-bold text-slate-200 w-5 text-center select-none">
                              {mockupTemplate === 'webinar' ? webinarHeadingSize : guideHeadingSize}
                            </span>
                            <button
                              onClick={() => {
                                if (mockupTemplate === 'webinar') {
                                  setWebinarHeadingSize(Math.min(72, webinarHeadingSize + 1));
                                } else {
                                  setGuideHeadingSize(Math.min(72, guideHeadingSize + 1));
                                }
                              }}
                              className="w-6 h-6 flex items-center justify-center rounded-md bg-slate-800/80 hover:bg-slate-700 border border-slate-700/60 text-white font-bold text-xs cursor-pointer select-none transition-colors"
                            >
                              +
                            </button>

                            <div className="w-[1px] h-4 bg-slate-700/80"></div>

                            <div className="flex items-center gap-1.5 relative">
                              <span className="text-[10px] font-bold text-slate-400 uppercase select-none">A</span>
                              <div className="relative w-5 h-5 rounded border border-slate-600 overflow-hidden cursor-pointer flex-shrink-0">
                                <input
                                  type="color"
                                  value={mockupTemplate === 'webinar' ? webinarHeadingColor : guideHeadingColor}
                                  onChange={(e) => {
                                    if (mockupTemplate === 'webinar') {
                                      setWebinarHeadingColor(e.target.value);
                                    } else {
                                      setGuideHeadingColor(e.target.value);
                                    }
                                  }}
                                  className="absolute inset-0 w-full h-full p-0 border-0 cursor-pointer bg-transparent"
                                />
                              </div>
                            </div>

                            <div className="w-[1px] h-4 bg-slate-700/80"></div>

                            {mockupTemplate === 'webinar' && (
                              <button
                                onClick={() => setWebinarShowBadge(!webinarShowBadge)}
                                className={`px-2.5 py-0.5 rounded-full border text-[10px] font-bold uppercase transition-all cursor-pointer select-none ${
                                  webinarShowBadge
                                    ? 'bg-fuchsia-500/20 border-fuchsia-500 text-fuchsia-300 hover:bg-fuchsia-500/30'
                                    : 'bg-slate-800/60 border-slate-700/50 text-slate-400 hover:bg-slate-700/80 hover:text-white'
                                }`}
                              >
                                Badge
                              </button>
                            )}

                            <button
                              onClick={() => {
                                if (mockupTemplate === 'webinar') {
                                  setWebinarShowDescription(!webinarShowDescription);
                                } else {
                                  setGuideShowDescription(!guideShowDescription);
                                }
                              }}
                              className={`px-2.5 py-0.5 rounded-full border text-[10px] font-bold uppercase transition-all cursor-pointer select-none ${
                                (mockupTemplate === 'webinar' ? webinarShowDescription : guideShowDescription)
                                  ? 'bg-fuchsia-500/20 border-fuchsia-500 text-fuchsia-300 hover:bg-fuchsia-500/30'
                                  : 'bg-slate-800/60 border-slate-700/50 text-slate-400 hover:bg-slate-700/80 hover:text-white'
                              }`}
                            >
                              Description
                            </button>
                          </>
                        )}

                        {/* Description Controls */}
                        {activeTextSection === 'description' && (
                          <>
                            <button
                              onClick={() => {
                                if (mockupTemplate === 'webinar') {
                                  setWebinarDescriptionSize(Math.max(10, webinarDescriptionSize - 1));
                                } else {
                                  setGuideDescriptionSize(Math.max(10, guideDescriptionSize - 1));
                                }
                              }}
                              className="w-6 h-6 flex items-center justify-center rounded-md bg-slate-800/80 hover:bg-slate-700 border border-slate-700/60 text-white font-bold text-xs cursor-pointer select-none transition-colors"
                            >
                              -
                            </button>
                            <span className="text-xs font-bold text-slate-200 w-5 text-center select-none">
                              {mockupTemplate === 'webinar' ? webinarDescriptionSize : guideDescriptionSize}
                            </span>
                            <button
                              onClick={() => {
                                if (mockupTemplate === 'webinar') {
                                  setWebinarDescriptionSize(Math.min(32, webinarDescriptionSize + 1));
                                } else {
                                  setGuideDescriptionSize(Math.min(32, guideDescriptionSize + 1));
                                }
                              }}
                              className="w-6 h-6 flex items-center justify-center rounded-md bg-slate-800/80 hover:bg-slate-700 border border-slate-700/60 text-white font-bold text-xs cursor-pointer select-none transition-colors"
                            >
                              +
                            </button>

                            <div className="w-[1px] h-4 bg-slate-700/80"></div>

                            <div className="flex items-center gap-1.5 relative">
                              <span className="text-[10px] font-bold text-slate-400 uppercase select-none">A</span>
                              <div className="relative w-5 h-5 rounded border border-slate-600 overflow-hidden cursor-pointer flex-shrink-0">
                                <input
                                  type="color"
                                  value={mockupTemplate === 'webinar' ? webinarDescriptionColor : guideDescriptionColor}
                                  onChange={(e) => {
                                    if (mockupTemplate === 'webinar') {
                                      setWebinarDescriptionColor(e.target.value);
                                    } else {
                                      setGuideDescriptionColor(e.target.value);
                                    }
                                  }}
                                  className="absolute inset-0 w-full h-full p-0 border-0 cursor-pointer bg-transparent"
                                />
                              </div>
                            </div>

                            <div className="w-[1px] h-4 bg-slate-700/80"></div>

                            <button
                              onClick={() => {
                                if (mockupTemplate === 'webinar') {
                                  setWebinarShowDescription(!webinarShowDescription);
                                } else {
                                  setGuideShowDescription(!guideShowDescription);
                                }
                              }}
                              className={`px-2.5 py-0.5 rounded-full border text-[10px] font-bold uppercase transition-all cursor-pointer select-none ${
                                (mockupTemplate === 'webinar' ? webinarShowDescription : guideShowDescription)
                                  ? 'bg-fuchsia-500/20 border-fuchsia-500 text-fuchsia-300 hover:bg-fuchsia-500/30'
                                  : 'bg-slate-800/60 border-slate-700/50 text-slate-400 hover:bg-slate-700/80 hover:text-white'
                              }`}
                            >
                              Description
                            </button>
                          </>
                        )}

                        {/* Badge Controls */}
                        {activeTextSection === 'badge' && mockupTemplate === 'webinar' && (
                          <>
                            <div className="flex items-center gap-1">
                              <span className="text-[9px] font-bold text-slate-400 uppercase select-none">Txt</span>
                              <div className="relative w-5 h-5 rounded border border-slate-600 overflow-hidden cursor-pointer flex-shrink-0">
                                <input
                                  type="color"
                                  value={webinarBadgeTextColor}
                                  onChange={(e) => setWebinarBadgeTextColor(e.target.value)}
                                  className="absolute inset-0 w-full h-full p-0 border-0 cursor-pointer bg-transparent"
                                />
                              </div>
                            </div>

                            <div className="flex items-center gap-1">
                              <span className="text-[9px] font-bold text-slate-400 uppercase select-none">Bg</span>
                              <div className="relative w-5 h-5 rounded border border-slate-600 overflow-hidden cursor-pointer flex-shrink-0">
                                <input
                                  type="color"
                                  value={webinarBadgeBgColor}
                                  onChange={(e) => setWebinarBadgeBgColor(e.target.value)}
                                  className="absolute inset-0 w-full h-full p-0 border-0 cursor-pointer bg-transparent"
                                />
                              </div>
                            </div>

                            <div className="flex items-center gap-1">
                              <span className="text-[9px] font-bold text-slate-400 uppercase select-none">Brd</span>
                              <div className="relative w-5 h-5 rounded border border-slate-600 overflow-hidden cursor-pointer flex-shrink-0">
                                <input
                                  type="color"
                                  value={webinarBadgeBorderColor}
                                  onChange={(e) => setWebinarBadgeBorderColor(e.target.value)}
                                  className="absolute inset-0 w-full h-full p-0 border-0 cursor-pointer bg-transparent"
                                />
                              </div>
                            </div>

                            <div className="flex items-center gap-1">
                              <span className="text-[9px] font-bold text-slate-400 uppercase select-none">Dot</span>
                              <div className="relative w-5 h-5 rounded border border-slate-600 overflow-hidden cursor-pointer flex-shrink-0">
                                <input
                                  type="color"
                                  value={webinarBadgeDotColor}
                                  onChange={(e) => setWebinarBadgeDotColor(e.target.value)}
                                  className="absolute inset-0 w-full h-full p-0 border-0 cursor-pointer bg-transparent"
                                />
                              </div>
                            </div>

                            <div className="w-[1px] h-4 bg-slate-700/80"></div>

                            <button
                              onClick={() => setWebinarShowBadge(!webinarShowBadge)}
                              className={`px-2.5 py-0.5 rounded-full border text-[10px] font-bold uppercase transition-all cursor-pointer select-none ${
                                webinarShowBadge
                                  ? 'bg-fuchsia-500/20 border-fuchsia-500 text-fuchsia-300 hover:bg-fuchsia-500/30'
                                  : 'bg-slate-800/60 border-slate-700/50 text-slate-400 hover:bg-slate-700/80 hover:text-white'
                              }`}
                            >
                              Badge
                            </button>
                          </>
                        )}
                      </div>
                    )}

                    {/* Edit PDF Text / Image Text Button */}
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
                )}
              </div>

              {/* Centered device container */}
              <div className={`w-full flex items-center justify-center py-4 ${mockupTemplate === 'custom' ? 'mt-12' : 'mt-8'} mb-2`}>
                <div
                  className={`w-full flex items-center justify-center transition-all duration-300 ${
                    isBrandAnimating ? 'scale-[0.98] opacity-80 blur-[0.3px]' : 'scale-100 opacity-100 blur-0'
                  }`}
                  style={{
                    maxWidth: `min(100%, min(680px, calc(460px * (${outputWidth} / ${outputHeight}))))`,
                    transition: 'max-width 0.45s cubic-bezier(0.34, 1.56, 0.64, 1), transform 0.45s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.3s ease-out, filter 0.3s ease-out',
                  }}
                >
                  {mockupTemplate === 'custom' ? (
                    <CustomDesignEditor
                      ref={customDesignRef}
                      toolbarSlot={customToolbarSlot}
                      imageUrl={imageUrl}
                      isLoading={isLoading}
                      backgroundColor={backgroundColor}
                      backgroundImage={backgroundImage}
                      outputWidth={outputWidth}
                      outputHeight={outputHeight}
                    />
                  ) : mockupTemplate === 'default' ? (
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
                      activeTextSection={activeTextSection}
                      onSelectSection={setActiveTextSection}
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
                      activeTextSection={activeTextSection}
                      onSelectSection={(section) => setActiveTextSection(section as 'heading' | 'description')}
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

            {/* Footer inside live preview area */}
            <footer className="w-full max-w-5xl mt-8 pt-4 pb-2 flex items-center justify-center text-[11px] text-slate-500 dark:text-slate-500 font-semibold tracking-wide border-t border-slate-200/50 dark:border-[#1a1a32]/50">
              <p>© 2025 Craftora · Crafted with Python + React</p>
            </footer>
          </div>
      </main>

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
                                className="absolute left-1/2 -translate-x-1/2 top-full mt-2 z-40 bg-white dark:bg-[#121226] border border-slate-300 dark:border-[#2b2b54] shadow-2xl rounded-xl px-2.5 py-1.5 flex items-center space-x-2 animate-in fade-in zoom-in-95 duration-150 pointer-events-auto"
                                onClick={(ev) => ev.stopPropagation()}
                              >
                                {/* Edit text button */}
                                <button
                                  onClick={() => {
                                    setEditingId(item.id);
                                    setEditingTextVal(isEdited ? edit.new_text : item.text);
                                    setEditingFontSize(edit?.font_size || item.font_size || 14);
                                  }}
                                  className="p-1 text-slate-700 dark:text-slate-200 hover:text-sky-500 hover:bg-sky-50 dark:hover:bg-sky-950/40 rounded-lg transition-all flex items-center gap-1 text-[11px] font-semibold"
                                  title="Edit text content"
                                >
                                  <Pencil className="w-3.5 h-3.5 text-sky-500" />
                                  <span>Edit</span>
                                </button>

                                <div className="w-[1px] h-4 bg-slate-200 dark:bg-slate-700"></div>

                                {/* Font Size Stepper Controls */}
                                <div className="flex items-center gap-1 bg-slate-100 dark:bg-[#1b1b38] px-1.5 py-0.5 rounded-lg border border-slate-200 dark:border-slate-700/60" title="Adjust font size">
                                  <button
                                    type="button"
                                    onClick={() => handleUpdateBlockFontSize(item.id, -2)}
                                    className="w-4 h-4 rounded hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-600 dark:text-slate-300"
                                    title="Decrease font size"
                                  >
                                    -
                                  </button>
                                  <span className="text-[11px] font-mono font-bold text-sky-500 dark:text-sky-400 min-w-[22px] text-center">
                                    {Math.round(edit?.font_size || item.font_size || 14)}pt
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => handleUpdateBlockFontSize(item.id, 2)}
                                    className="w-4 h-4 rounded hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-600 dark:text-slate-300"
                                    title="Increase font size"
                                  >
                                    +
                                  </button>
                                </div>

                                <div className="w-[1px] h-4 bg-slate-200 dark:bg-slate-700"></div>

                                {/* Delete / Restore button */}
                                <button
                                  onClick={() => {
                                    const exists = activeEdits.find(e => e.id === item.id);
                                    if (exists && exists.action === 'remove') {
                                      setActiveEdits(activeEdits.filter(e => e.id !== item.id));
                                    } else {
                                      const updated = activeEdits.filter(e => e.id !== item.id);
                                      if (isNativePdf) {
                                        updated.push({
                                          id: item.id,
                                          pdf_rect: item.pdf_rect,
                                          action: 'remove',
                                          original_text: item.text,
                                          font_size: item.font_size,
                                          font_name: item.font_name,
                                          color: item.color
                                        });
                                      } else {
                                        updated.push({
                                          id: item.id,
                                          box: item.box,
                                          action: 'remove',
                                          original_text: item.text
                                        });
                                      }
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
                                        font_size: editingFontSize || item.font_size,
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
                                        height: item.height,
                                        font_size: editingFontSize || item.font_size
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
                      ? 'Click on any text box to adjust font size, edit text, or delete.'
                      : (!isNativePdf && ocrStatus === 'scanning')
                      ? 'AI is analyzing text regions in the background. Detected boxes will appear shortly.' 
                      : 'Click any box on Page 1 or from the list to select, edit font size, or delete.'}
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
                        const currentSize = edit?.font_size || item.font_size || 14;
                        
                        if (editingId === item.id) {
                          return (
                            <div key={item.id} className="flex flex-col gap-2 p-3 rounded-xl bg-indigo-50/80 dark:bg-[#1a1a36] border-2 border-indigo-500/40 dark:border-indigo-600/50 shadow-md">
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold uppercase tracking-wider">Edit Text Block</span>
                                <span className="text-[10px] text-slate-400 font-mono">ID: {item.id}</span>
                              </div>
                              <input 
                                type="text" 
                                value={editingTextVal} 
                                onChange={(e) => setEditingTextVal(e.target.value)} 
                                className="premium-input text-xs w-full py-1.5 px-2.5 font-medium rounded-lg"
                                placeholder="Text content..."
                                autoFocus
                              />
                              
                              {/* Font Size Controls */}
                              <div className="flex items-center justify-between bg-white dark:bg-[#121226] p-2 rounded-lg border border-slate-200 dark:border-slate-700/60">
                                <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">Font Size:</span>
                                <div className="flex items-center gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => setEditingFontSize(prev => Math.max(6, prev - 2))}
                                    className="w-5 h-5 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-700 dark:text-slate-200"
                                    title="Decrease font size"
                                  >
                                    -
                                  </button>
                                  <div className="flex items-center">
                                    <input
                                      type="number"
                                      value={Math.round(editingFontSize)}
                                      onChange={(e) => setEditingFontSize(Math.max(6, Number(e.target.value) || 6))}
                                      className="w-10 text-center text-xs font-bold font-mono bg-transparent text-indigo-600 dark:text-indigo-400 focus:outline-none"
                                      min={6}
                                      max={120}
                                    />
                                    <span className="text-[10px] text-slate-400 font-mono">pt</span>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => setEditingFontSize(prev => Math.min(120, prev + 2))}
                                    className="w-5 h-5 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-700 dark:text-slate-200"
                                    title="Increase font size"
                                  >
                                    +
                                  </button>
                                </div>
                              </div>

                              {/* Quick Font Size Presets */}
                              <div className="flex items-center gap-1 overflow-x-auto py-0.5 scrollbar-none">
                                {[10, 14, 18, 24, 32, 48, 64].map((size) => (
                                  <button
                                    key={size}
                                    type="button"
                                    onClick={() => setEditingFontSize(size)}
                                    className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-semibold transition-all ${
                                      Math.round(editingFontSize) === size
                                        ? 'bg-indigo-600 text-white shadow-sm'
                                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                                    }`}
                                  >
                                    {size}pt
                                  </button>
                                ))}
                              </div>

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
                                        font_size: editingFontSize,
                                        font_name: item.font_name,
                                        color: item.color,
                                        flags: item.flags,
                                        rel_box: item.rel_box
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
                                        height: item.height,
                                        font_size: editingFontSize
                                      });
                                    }
                                    setActiveEdits(updatedEdits);
                                    setEditingId(null);
                                  }}
                                  className="bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold px-3 py-1 rounded-lg transition-colors shadow-sm"
                                >
                                  Save
                                </button>
                                <button 
                                  onClick={() => setEditingId(null)}
                                  className="bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-350 hover:bg-slate-300 dark:hover:bg-slate-700 text-[11px] font-bold px-3 py-1 rounded-lg transition-colors"
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
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-[10px] text-indigo-500 dark:text-indigo-400 font-mono font-semibold">
                                  {Math.round(currentSize)}pt
                                </span>
                                {isEdited && (
                                  <span className="text-[9px] text-slate-400 line-through truncate">
                                    orig: {item.text}
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center space-x-1.5 flex-shrink-0">
                              {/* Font size - / + buttons right in list item */}
                              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/90 px-1.5 py-0.5 rounded-lg border border-slate-200 dark:border-slate-700/60">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleUpdateBlockFontSize(item.id, -2);
                                  }}
                                  className="w-3.5 h-3.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center text-[10px] font-bold text-slate-600 dark:text-slate-300"
                                  title="Decrease font size"
                                >
                                  -
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleUpdateBlockFontSize(item.id, 2);
                                  }}
                                  className="w-3.5 h-3.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center text-[10px] font-bold text-slate-600 dark:text-slate-300"
                                  title="Increase font size"
                                >
                                  +
                                </button>
                              </div>

                              <button
                                onClick={() => {
                                  setEditingId(item.id);
                                  setEditingTextVal(isEdited ? edit.new_text : item.text);
                                  setEditingFontSize(currentSize);
                                }}
                                disabled={isRemoved}
                                title="Edit text and size"
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