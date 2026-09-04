import { forwardRef, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  ArrowDown,
  ArrowUp,
  Bold,
  Check,
  ChevronDown,
  Circle,
  Crop,
  Eye,
  EyeOff,
  FlipHorizontal,
  FlipVertical,
  GripVertical,
  Italic,
  Layers,
  List,
  MoreVertical,
  Move,
  MoveHorizontal,
  Plus,
  RotateCw,
  Search,
  Sparkles,
  Square,
  Star,
  Trash2,
  Triangle,
  Type,
  Underline,
  X,
} from 'lucide-react';

type LayerType = 'image' | 'text' | 'shape';
type ShapeType = 'rectangle' | 'circle' | 'triangle' | 'star';
type TextAlign = 'left' | 'center' | 'right';
type StrokeStyleType = 'none' | 'solid' | 'dashed-wide' | 'dashed' | 'dotted';

export type CropData = {
  x: number;
  y: number;
  width: number;
  height: number;
};

type DesignLayer = {
  id: string;
  type: LayerType;
  shapeType?: ShapeType;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number;
  text?: string;
  fontFamily?: string;
  fontSize?: number;
  color?: string;
  radius?: number;
  fill?: string;
  src?: string;
  originalSrc?: string;
  stroke?: string;
  strokeWidth?: number;
  strokeStyle?: StrokeStyleType;
  flip?: boolean;
  flipHorizontal?: boolean;
  flipVertical?: boolean;
  crop?: boolean;
  cropData?: CropData;
  opacity?: number;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  uppercase?: boolean;
  align?: TextAlign;
  list?: boolean;
};

const getLayerFlipTransform = (layer: DesignLayer) => {
  const isFlipH = layer.flipHorizontal ?? layer.flip ?? false;
  const isFlipV = layer.flipVertical ?? false;
  if (isFlipH && isFlipV) return 'scale(-1, -1)';
  if (isFlipH) return 'scaleX(-1)';
  if (isFlipV) return 'scaleY(-1)';
  return undefined;
};

const getImageDimensions = (src: string): Promise<{ width: number; height: number }> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
    img.onerror = () => resolve({ width: 100, height: 100 });
    img.src = src;
  });
};

const cropImageToDataUrl = (src: string, crop: CropData): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const sx = (crop.x / 100) * img.naturalWidth;
        const sy = (crop.y / 100) * img.naturalHeight;
        const sWidth = Math.max(1, (crop.width / 100) * img.naturalWidth);
        const sHeight = Math.max(1, (crop.height / 100) * img.naturalHeight);

        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, Math.round(sWidth));
        canvas.height = Math.max(1, Math.round(sHeight));
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, sx, sy, sWidth, sHeight, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL());
        } else {
          resolve(src);
        }
      } catch (err) {
        console.warn('cropImageToDataUrl canvas error:', err);
        resolve(src);
      }
    };
    img.onerror = () => resolve(src);
    img.src = src;
  });
};

interface CustomDesignEditorProps {
  imageUrl: string;
  backgroundColor: string;
  backgroundImage: string;
  outputWidth: number;
  outputHeight: number;
  isLoading: boolean;
  toolbarSlot?: HTMLDivElement | null;
}

const DEFAULT_SYSTEM_AND_WEB_FONTS = [
  // Curated modern Web/Google Fonts
  'Plus Jakarta Sans',
  'Outfit',
  'Inter',
  'Roboto',
  'Poppins',
  'Montserrat',
  'Open Sans',
  'Lato',
  'Oswald',
  'Raleway',
  'Nunito',
  'Rubik',
  'Ubuntu',
  'Playfair Display',
  'Merriweather',
  // Windows & Mac Standard System Fonts
  'Arial',
  'Arial Black',
  'Calibri',
  'Cambria',
  'Candara',
  'Century Gothic',
  'Comic Sans MS',
  'Consolas',
  'Constantia',
  'Corbel',
  'Courier New',
  'Franklin Gothic Medium',
  'Gabriola',
  'Georgia',
  'Helvetica',
  'Impact',
  'Lucida Console',
  'Lucida Sans Unicode',
  'Palatino Linotype',
  'Segoe Print',
  'Segoe Script',
  'Segoe UI',
  'Sitka',
  'Sylfaen',
  'Tahoma',
  'Times New Roman',
  'Trebuchet MS',
  'Verdana',
];
const sourceLayer = (imageUrl: string): DesignLayer => ({
  id: 'source-image',
  type: 'image',
  x: 10,
  y: 12,
  width: 80,
  height: 76,
  radius: 0,
  src: imageUrl,
  stroke: '#7c3aed',
  strokeWidth: 0,
  strokeStyle: 'solid',
  opacity: 100,
});

interface TextLayerSpanProps {
  layer: DesignLayer;
  isEditing: boolean;
  onUpdateText: (text: string) => void;
  onBlur: () => void;
}

const TextLayerSpan = ({ layer, isEditing, onUpdateText, onBlur }: TextLayerSpanProps) => {
  const spanRef = useRef<HTMLSpanElement>(null);

  // Sync DOM text when not editing
  useEffect(() => {
    if (!isEditing && spanRef.current) {
      spanRef.current.innerText = layer.list ? `• ${layer.text || ''}` : layer.text || '';
    }
  }, [layer.text, layer.list, isEditing]);

  // Initial text setup on mount
  useEffect(() => {
    if (spanRef.current) {
      spanRef.current.innerText = layer.list ? `• ${layer.text || ''}` : layer.text || '';
    }
  }, []);

  // When entering edit mode, focus and place cursor at end
  useEffect(() => {
    if (isEditing && spanRef.current) {
      spanRef.current.focus();
      try {
        const range = document.createRange();
        const sel = window.getSelection();
        range.selectNodeContents(spanRef.current);
        range.collapse(false);
        sel?.removeAllRanges();
        sel?.addRange(range);
      } catch (err) {
        console.error('Focus error', err);
      }
    }
  }, [isEditing]);

  return (
    <span
      ref={spanRef}
      contentEditable={isEditing}
      suppressContentEditableWarning
      onPointerDown={(event) => {
        if (isEditing) {
          event.stopPropagation();
        }
      }}
      onInput={(event) => {
        onUpdateText(event.currentTarget.innerText);
      }}
      onBlur={(event) => {
        onUpdateText(event.currentTarget.innerText);
        onBlur();
      }}
      onKeyDown={(event) => {
        if (event.key === 'Escape') {
          event.currentTarget.blur();
        }
      }}
      className={`block w-full whitespace-pre-wrap break-words outline-none ${
        isEditing ? 'select-text cursor-text' : 'select-none cursor-move pointer-events-none'
      }`}
      style={{
        fontFamily: layer.fontFamily,
        fontSize: `${layer.fontSize}px`,
        color: layer.color,
        fontWeight: layer.bold ? 700 : 400,
        fontStyle: layer.italic ? 'italic' : undefined,
        textDecoration: layer.underline ? 'underline' : undefined,
        textTransform: layer.uppercase ? 'uppercase' : undefined,
        textAlign: layer.align,
        direction: 'ltr',
        unicodeBidi: 'plaintext',
        lineHeight: 1.15,
        padding: '6px 8px',
      }}
    />
  );
};

const CustomDesignEditor = forwardRef<HTMLDivElement, CustomDesignEditorProps>(
  ({ imageUrl, backgroundColor, backgroundImage, outputWidth, outputHeight, isLoading, toolbarSlot }, ref) => {
    const [layers, setLayers] = useState<DesignLayer[]>(() => (imageUrl ? [sourceLayer(imageUrl)] : []));
    const [selectedIds, setSelectedIds] = useState<string[]>(() => (imageUrl ? ['source-image'] : []));
    const selectedId = selectedIds[selectedIds.length - 1] || null;
    const setSelectedId = (id: string | null) => setSelectedIds(id ? [id] : []);
    const toggleSelectId = (id: string) => {
      setSelectedIds((current) =>
        current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
      );
    };
    const [marqueeBox, setMarqueeBox] = useState<{
      startX: number;
      startY: number;
      currentX: number;
      currentY: number;
    } | null>(null);
    const [hideSourceImage, setHideSourceImage] = useState(false);
    const [availableFonts, setAvailableFonts] = useState<string[]>(DEFAULT_SYSTEM_AND_WEB_FONTS);
    const [isFontOpen, setIsFontOpen] = useState(false);
    const [fontSearch, setFontSearch] = useState('');
    const [hasScannedSystemFonts, setHasScannedSystemFonts] = useState(false);
    const [isOpacityOpen, setIsOpacityOpen] = useState(false);
    const [isStrokeOpen, setIsStrokeOpen] = useState(false);
    const [isRadiusOpen, setIsRadiusOpen] = useState(false);
    const [isShapeMenuOpen, setIsShapeMenuOpen] = useState(false);
    const [isPositionOpen, setIsPositionOpen] = useState(false);
    const [isFlipOpen, setIsFlipOpen] = useState(false);
    const [activeLayerMenuId, setActiveLayerMenuId] = useState<string | null>(null);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [croppingId, setCroppingId] = useState<string | null>(null);
    const [cropDraft, setCropDraft] = useState<CropData | null>(null);
    const [cropImgDims, setCropImgDims] = useState<{ width: number; height: number } | null>(null);
    const cropOriginalRef = useRef<CropData | null>(null);
    const cropDragRef = useRef<{
      startX: number;
      startY: number;
      startImgLeft: number;
      startImgTop: number;
      baseImgW: number;
      baseImgH: number;
      frameRect: DOMRect;
    } | null>(null);
    const [past, setPast] = useState<DesignLayer[][]>([]);
    const [future, setFuture] = useState<DesignLayer[][]>([]);
    const [dragAngleInfo, setDragAngleInfo] = useState<{ x: number; y: number; label: string } | null>(null);
    const [activeGuides, setActiveGuides] = useState<Array<{ type: 'vertical' | 'horizontal'; position: number }>>([]);
    const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(() =>
      typeof document !== 'undefined' ? document.getElementById('custom-design-toolbar-slot') : null
    );
    const [positionPortalTarget, setPositionPortalTarget] = useState<HTMLElement | null>(() =>
      typeof document !== 'undefined' ? document.getElementById('custom-design-position-slot') : null
    );

    const fontMenuRef = useRef<HTMLDivElement>(null);
    const shapeMenuRef = useRef<HTMLDivElement>(null);
    const flipMenuRef = useRef<HTMLDivElement>(null);
    const positionMenuRef = useRef<HTMLDivElement>(null);
    const opacityMenuRef = useRef<HTMLDivElement>(null);
    const strokeMenuRef = useRef<HTMLDivElement>(null);
    const radiusMenuRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLDivElement>(null);
    const dragRef = useRef<{
      id: string;
      startX: number;
      startY: number;
      clientStartX: number;
      clientStartY: number;
      offsetX: number;
      offsetY: number;
      lockedAxis?: 'horizontal' | 'vertical' | null;
      actualWidth?: number;
      actualHeight?: number;
      initialPositions?: Record<string, { x: number; y: number }>;
      isAltDuplicate?: boolean;
    } | null>(null);
    const dragStartSnapshotRef = useRef<DesignLayer[] | null>(null);
    const textEditStartSnapshotRef = useRef<DesignLayer[] | null>(null);
    const hasDraggedRef = useRef(false);
    const resizeRef = useRef<{
      id: string;
      corner: string;
      startX: number;
      startY: number;
      width: number;
      height: number;
      x: number;
      y: number;
      isText?: boolean;
      startFontSize?: number;
      startWidth?: number;
      isUniformShape?: boolean;
      isMulti?: boolean;
      groupMinX?: number;
      groupMinY?: number;
      groupWidth?: number;
      groupHeight?: number;
      initialLayers?: Array<{
        id: string;
        x: number;
        y: number;
        width: number;
        height: number;
        type: LayerType;
        fontSize?: number;
      }>;
    } | null>(null);
    const rotateRef = useRef<{
      id: string;
      centerX: number;
      centerY: number;
      startRotation: number;
      startAngle: number;
    } | null>(null);

    const moveLayer = (id: string, direction: 'front' | 'back' | 'forward' | 'backward') => {
      const index = layers.findIndex((l) => l.id === id);
      if (index === -1) return;

      pushHistory(layers);

      const newLayers = [...layers];
      const [item] = newLayers.splice(index, 1);

      if (direction === 'front') {
        newLayers.push(item);
      } else if (direction === 'back') {
        newLayers.unshift(item);
      } else if (direction === 'forward') {
        const targetIndex = Math.min(newLayers.length, index + 1);
        newLayers.splice(targetIndex, 0, item);
      } else if (direction === 'backward') {
        const targetIndex = Math.max(0, index - 1);
        newLayers.splice(targetIndex, 0, item);
      }

      setLayers(newLayers);
      setSelectedId(id);
    };

    const reorderLayers = (draggedId: string, targetId: string) => {
      if (draggedId === targetId) return;
      const draggedIndex = layers.findIndex((l) => l.id === draggedId);
      const targetIndex = layers.findIndex((l) => l.id === targetId);
      if (draggedIndex === -1 || targetIndex === -1) return;

      pushHistory(layers);

      const newLayers = [...layers];
      const [item] = newLayers.splice(draggedIndex, 1);
      newLayers.splice(targetIndex, 0, item);

      setLayers(newLayers);
      setSelectedId(draggedId);
    };

    const scanSystemFonts = async () => {
      let combined = [...DEFAULT_SYSTEM_AND_WEB_FONTS];
      try {
        if ('queryLocalFonts' in window) {
          const fontsData = await (window as any).queryLocalFonts();
          if (Array.isArray(fontsData) && fontsData.length > 0) {
            const localFamilies: string[] = fontsData
              .map((f: any) => String(f.family || ''))
              .filter((name: string) => name && !name.startsWith('@'));
            combined = Array.from(new Set([...DEFAULT_SYSTEM_AND_WEB_FONTS, ...localFamilies]));
            setHasScannedSystemFonts(true);
          }
        }
      } catch (err) {
        console.log('System font query error or permission denied:', err);
      }

      if ('fonts' in document) {
        const validated = combined.filter((font) => {
          try {
            return document.fonts.check(`12px "${font}"`) || DEFAULT_SYSTEM_AND_WEB_FONTS.includes(font);
          } catch {
            return true;
          }
        });
        if (validated.length > 0) {
          combined = validated;
        }
      }

      combined.sort((a, b) => a.localeCompare(b));
      setAvailableFonts(combined);
    };

    const pushHistory = (currentLayers: DesignLayer[]) => {
      setPast((prev) => [...prev.slice(-30), currentLayers]);
      setFuture([]);
    };

    const undo = () => {
      if (past.length === 0) return;
      const previous = past[past.length - 1];
      const newPast = past.slice(0, past.length - 1);
      setFuture((curr) => [layers, ...curr]);
      setPast(newPast);
      setLayers(previous);
      if (selectedId && !previous.some((l) => l.id === selectedId)) {
        setSelectedId(null);
        setEditingId(null);
      }
    };

    const redo = () => {
      if (future.length === 0) return;
      const next = future[0];
      const newFuture = future.slice(1);
      setPast((curr) => [...curr, layers]);
      setFuture(newFuture);
      setLayers(next);
    };

    const duplicateSelected = () => {
      if (selectedIds.length === 0) return;
      pushHistory(layers);

      const newIds: string[] = [];
      const clonedLayers: DesignLayer[] = [];

      layers.forEach((layer) => {
        if (selectedIds.includes(layer.id)) {
          const newId = `${layer.type}-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
          newIds.push(newId);
          clonedLayers.push({
            ...layer,
            id: newId,
            x: layer.x + 3,
            y: layer.y + 3,
          });
        }
      });

      if (clonedLayers.length > 0) {
        setLayers((current) => [...current, ...clonedLayers]);
        setSelectedIds(newIds);
      }
    };

    const deleteSelected = () => {
      if (selectedIds.length === 0) return;
      pushHistory(layers);
      setLayers((current) => current.filter((layer) => !selectedIds.includes(layer.id)));
      setSelectedIds([]);
      setEditingId(null);
    };

    const autoFitTextWidth = (layer: DesignLayer, handleSide: 'w' | 'e') => {
      if (layer.type !== 'text' || !layer.text) return;
      const canvasRect =
        canvasRef.current?.getBoundingClientRect() || { width: outputWidth || 800, height: outputHeight || 800 };
      const canvasW = canvasRect.width || outputWidth || 800;

      const measureCanvas = document.createElement('canvas');
      const ctx = measureCanvas.getContext('2d');
      if (!ctx) return;

      const fontStyle = layer.italic ? 'italic ' : '';
      const fontWeight = layer.bold ? '700 ' : '400 ';
      const fontSize = layer.fontSize || 34;
      const fontFamily = layer.fontFamily || 'Arial';
      ctx.font = `${fontStyle}${fontWeight}${fontSize}px ${fontFamily}`;

      const lines = (layer.text || '').split('\n');
      let maxLineWidth = 0;
      for (const line of lines) {
        const textToMeasure = layer.list ? `• ${line}` : line;
        const metrics = ctx.measureText(textToMeasure);
        if (metrics.width > maxLineWidth) {
          maxLineWidth = metrics.width;
        }
      }

      // 8px left + 8px right padding + 2px safety buffer
      const totalPixelWidth = maxLineWidth + 16 + 2;
      const fitWidthPercent = Math.min(100, Math.max(4, (totalPixelWidth / canvasW) * 100));

      pushHistory(layers);

      setLayers((current) =>
        current.map((l) => {
          if (l.id !== layer.id) return l;
          if (handleSide === 'w') {
            const rightEdge = l.x + l.width;
            const newX = Math.max(0, rightEdge - fitWidthPercent);
            return {
              ...l,
              x: newX,
              width: fitWidthPercent,
            };
          } else {
            return {
              ...l,
              width: fitWidthPercent,
            };
          }
        })
      );
    };

    // Sync portal target with slot or DOM element
    useEffect(() => {
      const updateSlots = () => {
        const target = toolbarSlot || document.getElementById('custom-design-toolbar-slot');
        if (target) {
          setPortalTarget(target);
        }
        const posTarget = document.getElementById('custom-design-position-slot');
        if (posTarget) {
          setPositionPortalTarget(posTarget);
        }
      };
      updateSlots();
      const timer = setTimeout(updateSlots, 50);
      return () => clearTimeout(timer);
    }, [toolbarSlot]);

    // Close popups on outside click
    useEffect(() => {
      const handleClickOutside = (e: MouseEvent) => {
        const target = e.target as Node;
        if (fontMenuRef.current && !fontMenuRef.current.contains(target)) {
          setIsFontOpen(false);
        }
        if (opacityMenuRef.current && !opacityMenuRef.current.contains(target)) {
          setIsOpacityOpen(false);
        }
        if (strokeMenuRef.current && !strokeMenuRef.current.contains(target)) {
          setIsStrokeOpen(false);
        }
        if (radiusMenuRef.current && !radiusMenuRef.current.contains(target)) {
          setIsRadiusOpen(false);
        }
        if (shapeMenuRef.current && !shapeMenuRef.current.contains(target)) {
          setIsShapeMenuOpen(false);
        }
        if (flipMenuRef.current && !flipMenuRef.current.contains(target)) {
          setIsFlipOpen(false);
        }
        if (positionMenuRef.current && !positionMenuRef.current.contains(target)) {
          setIsPositionOpen(false);
          setActiveLayerMenuId(null);
        }
      };

      if (isFontOpen || isOpacityOpen || isStrokeOpen || isRadiusOpen || isShapeMenuOpen || isPositionOpen || isFlipOpen) {
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
      }
    }, [isFontOpen, isOpacityOpen, isStrokeOpen, isRadiusOpen, isShapeMenuOpen, isPositionOpen, isFlipOpen]);

    useEffect(() => {
      setLayers((current) => {
        const existing = current.find((layer) => layer.id === 'source-image');
        if (imageUrl && !existing) return [...current, sourceLayer(imageUrl)];
        if (imageUrl && existing && existing.src !== imageUrl) {
          return current.map((layer) => (layer.id === 'source-image' ? { ...layer, src: imageUrl } : layer));
        }
        return imageUrl ? current : current.filter((layer) => layer.id !== 'source-image');
      });
      if (!imageUrl) setSelectedId(null);
    }, [imageUrl]);

    useEffect(() => {
      scanSystemFonts();
    }, []);

    const selectedLayer = layers.find((layer) => layer.id === selectedId);

    const updateSelected = (changes: Partial<DesignLayer>, recordHistory = true) => {
      if (!selectedId) return;
      if (recordHistory) {
        pushHistory(layers);
      }
      setLayers((current) =>
        current.map((layer) => (layer.id === selectedId ? { ...layer, ...changes } : layer))
      );
    };

    const startCropping = async (layerId: string) => {
      const target = layers.find((l) => l.id === layerId && l.type === 'image');
      if (!target || !target.src) return;
      const baseSrc = target.originalSrc || target.src;
      const dims = await getImageDimensions(baseSrc);
      setCropImgDims(dims);

      let initialCrop: CropData;
      if (target.cropData) {
        initialCrop = { ...target.cropData };
      } else {
        const layerPixelW = (target.width / 100) * outputWidth;
        const layerPixelH = (target.height / 100) * outputHeight;
        const layerAspect = layerPixelW / Math.max(1, layerPixelH);
        const imgAspect = dims.width / Math.max(1, dims.height);

        if (imgAspect > layerAspect) {
          const w = (layerAspect / imgAspect) * 100;
          initialCrop = { x: (100 - w) / 2, y: 0, width: w, height: 100 };
        } else if (imgAspect < layerAspect) {
          const h = (imgAspect / layerAspect) * 100;
          initialCrop = { x: 0, y: (100 - h) / 2, width: 100, height: h };
        } else {
          initialCrop = { x: 0, y: 0, width: 100, height: 100 };
        }
      }

      cropOriginalRef.current = initialCrop;
      setCropDraft(initialCrop);
      setCroppingId(layerId);
      setSelectedIds([layerId]);
      setIsStrokeOpen(false);
      setIsRadiusOpen(false);
      setIsOpacityOpen(false);
      setIsPositionOpen(false);
    };

    const applyCrop = async () => {
      if (!croppingId || !cropDraft) return;
      const targetLayer = layers.find((l) => l.id === croppingId);
      if (!targetLayer || !targetLayer.src) return;

      pushHistory(layers);

      const isFull =
        Math.abs(cropDraft.x) < 0.01 &&
        Math.abs(cropDraft.y) < 0.01 &&
        Math.abs(cropDraft.width - 100) < 0.01 &&
        Math.abs(cropDraft.height - 100) < 0.01;

      const baseSrc = targetLayer.originalSrc || targetLayer.src;

      if (isFull) {
        setLayers((current) =>
          current.map((l) =>
            l.id === croppingId
              ? {
                  ...l,
                  src: baseSrc,
                  originalSrc: undefined,
                  cropData: undefined,
                }
              : l
          )
        );
      } else {
        const croppedSrc = await cropImageToDataUrl(baseSrc, cropDraft);

        setLayers((current) =>
          current.map((l) =>
            l.id === croppingId
              ? {
                  ...l,
                  src: croppedSrc,
                  originalSrc: baseSrc,
                  cropData: cropDraft,
                }
              : l
          )
        );
      }

      setCroppingId(null);
      setCropDraft(null);
      setCropImgDims(null);
      cropOriginalRef.current = null;
    };

    const resetCrop = () => {
      if (!croppingId) return;
      pushHistory(layers);
      setLayers((current) =>
        current.map((l) =>
          l.id === croppingId
            ? {
                ...l,
                src: l.originalSrc || l.src,
                originalSrc: undefined,
                cropData: undefined,
              }
            : l
        )
      );
      setCroppingId(null);
      setCropDraft(null);
      setCropImgDims(null);
      cropOriginalRef.current = null;
    };

    const cancelCrop = () => {
      setCroppingId(null);
      setCropDraft(null);
      setCropImgDims(null);
      cropOriginalRef.current = null;
    };

    const getCropImageLayout = (layer: DesignLayer, draft: CropData | null) => {
      if (!cropImgDims) {
        return { imgLeft: 0, imgTop: 0, baseImgW: 100, baseImgH: 100 };
      }
      const layerPixelW = (layer.width / 100) * outputWidth;
      const layerPixelH = (layer.height / 100) * outputHeight;
      const frameAspect = layerPixelW / Math.max(1, layerPixelH);
      const imgAspect = cropImgDims.width / Math.max(1, cropImgDims.height);

      let baseImgW = 100;
      let baseImgH = 100;
      if (imgAspect >= frameAspect) {
        baseImgW = (imgAspect / frameAspect) * 100;
        baseImgH = 100;
      } else {
        baseImgW = 100;
        baseImgH = (frameAspect / imgAspect) * 100;
      }

      const crop = draft || {
        x: (100 - (100 / baseImgW) * 100) / 2,
        y: (100 - (100 / baseImgH) * 100) / 2,
        width: (100 / baseImgW) * 100,
        height: (100 / baseImgH) * 100,
      };

      const imgLeft = -(crop.x / 100) * baseImgW;
      const imgTop = -(crop.y / 100) * baseImgH;

      return { imgLeft, imgTop, baseImgW, baseImgH };
    };

    const handleCropPointerDown = (event: React.PointerEvent, layer: DesignLayer) => {
      event.stopPropagation();
      event.preventDefault();
      if (!cropImgDims) return;

      const frameEl =
        (event.currentTarget as HTMLElement).closest('[data-crop-frame="true"]') ||
        (event.currentTarget as HTMLElement);
      const frameRect = frameEl.getBoundingClientRect();
      if (!frameRect || frameRect.width <= 0 || frameRect.height <= 0) return;

      const { imgLeft, imgTop, baseImgW, baseImgH } = getCropImageLayout(layer, cropDraft);

      cropDragRef.current = {
        startX: event.clientX,
        startY: event.clientY,
        startImgLeft: imgLeft,
        startImgTop: imgTop,
        baseImgW,
        baseImgH,
        frameRect,
      };

      (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
    };

    const handleCropPointerMove = (event: React.PointerEvent) => {
      if (!cropDragRef.current) return;
      event.stopPropagation();
      event.preventDefault();

      const { startX, startY, startImgLeft, startImgTop, baseImgW, baseImgH, frameRect } = cropDragRef.current;
      if (!frameRect || frameRect.width <= 0 || frameRect.height <= 0) return;

      const deltaXPercent = ((event.clientX - startX) / frameRect.width) * 100;
      const deltaYPercent = ((event.clientY - startY) / frameRect.height) * 100;

      const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

      const minImgLeft = -(baseImgW - 100);
      const minImgTop = -(baseImgH - 100);

      const newImgLeft = clamp(startImgLeft + deltaXPercent, minImgLeft, 0);
      const newImgTop = clamp(startImgTop + deltaYPercent, minImgTop, 0);

      const nextCrop: CropData = {
        x: clamp((-newImgLeft / baseImgW) * 100, 0, 100),
        y: clamp((-newImgTop / baseImgH) * 100, 0, 100),
        width: clamp((100 / baseImgW) * 100, 1, 100),
        height: clamp((100 / baseImgH) * 100, 1, 100),
      };

      setCropDraft(nextCrop);
    };

    const handleCropPointerUp = (event: React.PointerEvent) => {
      if (cropDragRef.current) {
        event.stopPropagation();
        try {
          (event.currentTarget as HTMLElement).releasePointerCapture(event.pointerId);
        } catch {
          // ignore
        }
        cropDragRef.current = null;
      }
    };

    useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (!croppingId) return;
        if (e.key === 'Enter') {
          e.preventDefault();
          applyCrop();
        } else if (e.key === 'Escape') {
          e.preventDefault();
          cancelCrop();
        }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }, [croppingId, cropDraft, layers]);

    const addShape = (shapeType: ShapeType = 'rectangle') => {
      pushHistory(layers);
      const id = `shape-${shapeType}-${Date.now()}`;
      const isSquareShape = shapeType === 'circle' || shapeType === 'triangle' || shapeType === 'star';
      const canvasRatio = outputWidth / outputHeight;
      const width = isSquareShape ? 24 : 32;
      const height = isSquareShape ? 24 * canvasRatio : 24;

      const layer: DesignLayer = {
        id,
        type: 'shape',
        shapeType,
        x: 20,
        y: 24,
        width,
        height,
        fill: '#9333ea',
        radius: 0, // Requirement 3: default radius 0 for rectangle
        opacity: 100,
        stroke: '#7c3aed',
        strokeWidth: 0,
        strokeStyle: 'solid',
      };
      setLayers((current) => [...current, layer]);
      setSelectedId(id);
    };

    const addLayer = (type: LayerType, src?: string) => {
      if (type === 'shape') {
        addShape('rectangle');
        return;
      }
      pushHistory(layers);
      const id = `${type}-${Date.now()}`;
      const layer: DesignLayer =
        type === 'text'
          ? {
              id,
              type,
              x: 16,
              y: 18,
              width: 34,
              height: 16,
              text: 'Your headline',
              fontFamily: availableFonts[0],
              fontSize: 34,
              color: '#ffffff',
              opacity: 100,
              align: 'left',
            }
          : {
              id,
              type,
              x: 18,
              y: 22,
              width: 42,
              height: 38,
              radius: 0,
              src,
              stroke: '#7c3aed',
              strokeWidth: 0,
              strokeStyle: 'solid',
              opacity: 100,
            };
      setLayers((current) => [...current, layer]);
      setSelectedId(id);
    };

    const readDroppedImage = (file?: File) => {
      if (!file || !file.type.startsWith('image/')) return;
      const reader = new FileReader();
      reader.onload = () => addLayer('image', String(reader.result));
      reader.readAsDataURL(file);
    };

    const pointerDown = (event: React.PointerEvent, layer: DesignLayer) => {
      if (editingId === layer.id) return;
      event.stopPropagation();
      const canvas = canvasRef.current?.getBoundingClientRect() || (event.currentTarget as HTMLElement).parentElement?.getBoundingClientRect();
      if (!canvas) return;

      hasDraggedRef.current = false;

      const isMultiSelectKey = event.shiftKey || event.ctrlKey || event.metaKey;
      const isAltDuplicate = event.altKey;

      let activeSelection = selectedIds;

      if (isMultiSelectKey) {
        if (selectedIds.includes(layer.id)) {
          activeSelection = selectedIds.filter((id) => id !== layer.id);
          setSelectedIds(activeSelection);
        } else {
          activeSelection = [...selectedIds, layer.id];
          setSelectedIds(activeSelection);
        }
      } else {
        if (!selectedIds.includes(layer.id)) {
          activeSelection = [layer.id];
          setSelectedIds(activeSelection);
        }
      }

      dragStartSnapshotRef.current = layers;

      const targetElem = event.currentTarget as HTMLElement;
      const elemRect = targetElem.getBoundingClientRect();
      const actualWidth = (elemRect.width / canvas.width) * 100;
      const actualHeight = (elemRect.height / canvas.height) * 100;

      // Handle Alt + Drag to Duplicate
      if (isAltDuplicate) {
        event.preventDefault();
        pushHistory(layers);

        const targetsToClone = activeSelection.length > 0 ? activeSelection : [layer.id];
        const newIds: string[] = [];
        const clonedLayers: DesignLayer[] = [];
        const layerStartPos: Record<string, { x: number; y: number }> = {};
        let leadCloneId = '';

        layers.forEach((l) => {
          if (targetsToClone.includes(l.id)) {
            const newId = `${l.type}-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
            newIds.push(newId);
            if (l.id === layer.id) leadCloneId = newId;
            clonedLayers.push({
              ...l,
              id: newId,
            });
            layerStartPos[newId] = { x: l.x, y: l.y };
          }
        });

        setLayers((current) => [...current, ...clonedLayers]);
        setSelectedIds(newIds);

        dragRef.current = {
          id: leadCloneId || newIds[0] || layer.id,
          startX: layer.x,
          startY: layer.y,
          clientStartX: event.clientX,
          clientStartY: event.clientY,
          offsetX: event.clientX - (canvas.left + (layer.x / 100) * canvas.width),
          offsetY: event.clientY - (canvas.top + (layer.y / 100) * canvas.height),
          lockedAxis: null,
          actualWidth,
          actualHeight,
          initialPositions: layerStartPos,
          isAltDuplicate: true,
        };

        targetElem.setPointerCapture(event.pointerId);
        return;
      }

      // Normal drag
      const layerStartPos: Record<string, { x: number; y: number }> = {};
      layers.forEach((l) => {
        if (activeSelection.includes(l.id)) {
          layerStartPos[l.id] = { x: l.x, y: l.y };
        }
      });
      if (!layerStartPos[layer.id]) {
        layerStartPos[layer.id] = { x: layer.x, y: layer.y };
      }

      dragRef.current = {
        id: layer.id,
        startX: layer.x,
        startY: layer.y,
        clientStartX: event.clientX,
        clientStartY: event.clientY,
        offsetX: event.clientX - (canvas.left + (layer.x / 100) * canvas.width),
        offsetY: event.clientY - (canvas.top + (layer.y / 100) * canvas.height),
        lockedAxis: null,
        actualWidth,
        actualHeight,
        initialPositions: layerStartPos,
      };

      targetElem.setPointerCapture(event.pointerId);
    };

    const resizeStart = (event: React.PointerEvent, layer: DesignLayer, corner: string) => {
      event.stopPropagation();
      const canvas = canvasRef.current?.getBoundingClientRect() || (event.currentTarget as HTMLElement).closest('.mockup-canvas-container')?.getBoundingClientRect();
      if (!canvas) return;
      dragStartSnapshotRef.current = layers;
      const isUniformShape =
        layer.type === 'shape' &&
        (layer.shapeType === 'circle' || layer.shapeType === 'triangle' || layer.shapeType === 'star');
      resizeRef.current = {
        id: layer.id,
        corner,
        startX: event.clientX,
        startY: event.clientY,
        width: layer.width,
        height: layer.height,
        x: layer.x,
        y: layer.y,
        isText: layer.type === 'text',
        startFontSize: layer.fontSize || 34,
        startWidth: layer.width,
        isUniformShape,
      };
      setSelectedId(layer.id);
      (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
    };

    const multiResizeStart = (event: React.PointerEvent, corner: string) => {
      event.stopPropagation();
      const canvas =
        canvasRef.current?.getBoundingClientRect() ||
        (event.currentTarget as HTMLElement).closest('.mockup-canvas-container')?.getBoundingClientRect();
      if (!canvas) return;
      dragStartSnapshotRef.current = layers;

      const selectedLayers = layers.filter((l) => selectedIds.includes(l.id));
      if (selectedLayers.length === 0) return;

      const groupMinX = Math.min(...selectedLayers.map((l) => l.x));
      const groupMinY = Math.min(...selectedLayers.map((l) => l.y));
      const groupMaxX = Math.max(...selectedLayers.map((l) => l.x + l.width));
      const groupMaxY = Math.max(...selectedLayers.map((l) => l.y + l.height));
      const groupWidth = groupMaxX - groupMinX;
      const groupHeight = groupMaxY - groupMinY;

      resizeRef.current = {
        id: 'multi',
        isMulti: true,
        corner,
        startX: event.clientX,
        startY: event.clientY,
        x: groupMinX,
        y: groupMinY,
        width: groupWidth,
        height: groupHeight,
        groupMinX,
        groupMinY,
        groupWidth,
        groupHeight,
        initialLayers: selectedLayers.map((l) => ({
          id: l.id,
          x: l.x,
          y: l.y,
          width: l.width,
          height: l.height,
          type: l.type,
          fontSize: l.fontSize || 34,
        })),
      };

      (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
    };

    const rotateStart = (event: React.PointerEvent, layer: DesignLayer) => {
      event.stopPropagation();
      const canvas =
        canvasRef.current?.getBoundingClientRect() ||
        (event.currentTarget as HTMLElement).closest('.mockup-canvas-container')?.getBoundingClientRect();
      if (!canvas) return;
      dragStartSnapshotRef.current = layers;

      const targetElem = canvasRef.current?.querySelector(`[data-layer-id="${layer.id}"]`);
      let centerX = canvas.left + ((layer.x + layer.width / 2) / 100) * canvas.width;
      let centerY = canvas.top + ((layer.y + layer.height / 2) / 100) * canvas.height;
      if (targetElem) {
        const rect = targetElem.getBoundingClientRect();
        centerX = rect.left + rect.width / 2;
        centerY = rect.top + rect.height / 2;
      }

      const startAngleRad = Math.atan2(event.clientY - centerY, event.clientX - centerX);
      const startAngleDeg = (startAngleRad * 180) / Math.PI;

      rotateRef.current = {
        id: layer.id,
        centerX,
        centerY,
        startRotation: layer.rotation || 0,
        startAngle: startAngleDeg,
      };

      setSelectedId(layer.id);
      (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
    };

    const pointerMove = (event: React.PointerEvent) => {
      const canvas = event.currentTarget.getBoundingClientRect();

      if (rotateRef.current) {
        const { id, centerX, centerY, startRotation, startAngle } = rotateRef.current;
        const currentAngleRad = Math.atan2(event.clientY - centerY, event.clientX - centerX);
        const currentAngleDeg = (currentAngleRad * 180) / Math.PI;
        const deltaAngle = currentAngleDeg - startAngle;
        let newAngle = (startRotation + deltaAngle) % 360;
        if (newAngle < 0) newAngle += 360;

        if (event.shiftKey) {
          newAngle = Math.round(newAngle / 15) * 15;
        } else {
          const snapAngles = [0, 45, 90, 135, 180, 225, 270, 315, 360];
          for (const snap of snapAngles) {
            if (Math.abs(newAngle - snap) <= 4) {
              newAngle = snap % 360;
              break;
            }
          }
        }

        const normalizedAngle = Math.round(newAngle) % 360;

        setDragAngleInfo({
          x: event.clientX - canvas.left,
          y: event.clientY - canvas.top - 24,
          label: `${normalizedAngle}°`,
        });

        setLayers((current) =>
          current.map((l) => (l.id === id ? { ...l, rotation: normalizedAngle } : l))
        );
        return;
      }

      if (marqueeBox) {
        const curX = Math.max(0, Math.min(100, ((event.clientX - canvas.left) / canvas.width) * 100));
        const curY = Math.max(0, Math.min(100, ((event.clientY - canvas.top) / canvas.height) * 100));

        setMarqueeBox((prev) => (prev ? { ...prev, currentX: curX, currentY: curY } : null));

        const minX = Math.min(marqueeBox.startX, curX);
        const maxX = Math.max(marqueeBox.startX, curX);
        const minY = Math.min(marqueeBox.startY, curY);
        const maxY = Math.max(marqueeBox.startY, curY);

        const intersectedIds: string[] = [];
        layers.forEach((l) => {
          if (l.id === 'source-image' && hideSourceImage) return;
          const lLeft = l.x;
          const lRight = l.x + l.width;
          const lTop = l.y;
          const lBottom = l.y + l.height;

          // Check if layer overlaps with marquee rectangle
          if (lLeft < maxX && lRight > minX && lTop < maxY && lBottom > minY) {
            intersectedIds.push(l.id);
          }
        });

        setSelectedIds(intersectedIds);
        return;
      }

      if (dragRef.current) {
        const drag = dragRef.current;
        let pixelDx = event.clientX - drag.clientStartX;
        let pixelDy = event.clientY - drag.clientStartY;

        if (Math.hypot(pixelDx, pixelDy) >= 2) {
          hasDraggedRef.current = true;
        }

        if (event.shiftKey) {
          // Lock axis once user starts moving (> 2px) so it never automatically changes mid-drag
          if (!drag.lockedAxis && Math.hypot(pixelDx, pixelDy) >= 2) {
            drag.lockedAxis = Math.abs(pixelDx) >= Math.abs(pixelDy) ? 'horizontal' : 'vertical';
          }

          const isHorizontal = drag.lockedAxis ? drag.lockedAxis === 'horizontal' : Math.abs(pixelDx) >= Math.abs(pixelDy);

          if (isHorizontal) {
            // Lock vertical movement completely: move strictly horizontally at 0°
            pixelDy = 0;
            setDragAngleInfo({
              x: event.clientX - canvas.left,
              y: event.clientY - canvas.top,
              label: '0°',
            });
          } else {
            // Lock horizontal movement completely: move strictly vertically at 90°
            pixelDx = 0;
            setDragAngleInfo({
              x: event.clientX - canvas.left,
              y: event.clientY - canvas.top,
              label: '90°',
            });
          }
        } else {
          drag.lockedAxis = null;
          setDragAngleInfo(null);
        }

        const curLayer = layers.find((l) => l.id === drag.id);
        let nextX = drag.startX + (pixelDx / canvas.width) * 100;
        let nextY = drag.startY + (pixelDy / canvas.height) * 100;

        const newGuides: Array<{ type: 'vertical' | 'horizontal'; position: number }> = [];

        if (curLayer) {
          const layerWidth = drag.actualWidth || curLayer.width;
          const layerHeight = drag.actualHeight || curLayer.height;

          // Snapping threshold: 10 pixels for responsive magnetic feel
          const snapThresholdPx = 10;
          const snapThreshX = (snapThresholdPx / canvas.width) * 100;
          const snapThreshY = (snapThresholdPx / canvas.height) * 100;

          // --- X-AXIS SNAPPING (Center & Corners/Sides) ---
          const elementCenterX = nextX + layerWidth / 2;
          const elementLeft = nextX;
          const elementRight = nextX + layerWidth;

          // 1. Center of element to Center of Canvas (50%)
          if (Math.abs(elementCenterX - 50) <= snapThreshX) {
            nextX = 50 - layerWidth / 2;
            newGuides.push({ type: 'vertical', position: 50 });
          }
          // 2. Left of element to Canvas Left (0%)
          else if (Math.abs(elementLeft - 0) <= snapThreshX) {
            nextX = 0;
            newGuides.push({ type: 'vertical', position: 0 });
          }
          // 3. Right of element to Canvas Right (100%)
          else if (Math.abs(elementRight - 100) <= snapThreshX) {
            nextX = 100 - layerWidth;
            newGuides.push({ type: 'vertical', position: 100 });
          }
          // 4. Right of element to Canvas Center (50%)
          else if (Math.abs(elementRight - 50) <= snapThreshX) {
            nextX = 50 - layerWidth;
            newGuides.push({ type: 'vertical', position: 50 });
          }
          // 5. Left of element to Canvas Center (50%)
          else if (Math.abs(elementLeft - 50) <= snapThreshX) {
            nextX = 50;
            newGuides.push({ type: 'vertical', position: 50 });
          } else {
            // Check other layers on canvas
            for (const other of layers) {
              if (other.id === drag.id) continue;
              const otherCenterX = other.x + other.width / 2;
              if (Math.abs(elementCenterX - otherCenterX) <= snapThreshX) {
                nextX = otherCenterX - layerWidth / 2;
                newGuides.push({ type: 'vertical', position: otherCenterX });
                break;
              } else if (Math.abs(elementLeft - other.x) <= snapThreshX) {
                nextX = other.x;
                newGuides.push({ type: 'vertical', position: other.x });
                break;
              } else if (Math.abs(elementRight - (other.x + other.width)) <= snapThreshX) {
                nextX = other.x + other.width - layerWidth;
                newGuides.push({ type: 'vertical', position: other.x + other.width });
                break;
              }
            }
          }

          // --- Y-AXIS SNAPPING (Center & Corners/Sides) ---
          const elementCenterY = nextY + layerHeight / 2;
          const elementTop = nextY;
          const elementBottom = nextY + layerHeight;

          // 1. Center of element to Center of Canvas (50%)
          if (Math.abs(elementCenterY - 50) <= snapThreshY) {
            nextY = 50 - layerHeight / 2;
            newGuides.push({ type: 'horizontal', position: 50 });
          }
          // 2. Top of element to Canvas Top (0%)
          else if (Math.abs(elementTop - 0) <= snapThreshY) {
            nextY = 0;
            newGuides.push({ type: 'horizontal', position: 0 });
          }
          // 3. Bottom of element to Canvas Bottom (100%)
          else if (Math.abs(elementBottom - 100) <= snapThreshY) {
            nextY = 100 - layerHeight;
            newGuides.push({ type: 'horizontal', position: 100 });
          }
          // 4. Bottom of element to Canvas Center (50%)
          else if (Math.abs(elementBottom - 50) <= snapThreshY) {
            nextY = 50 - layerHeight;
            newGuides.push({ type: 'horizontal', position: 50 });
          }
          // 5. Top of element to Canvas Center (50%)
          else if (Math.abs(elementTop - 50) <= snapThreshY) {
            nextY = 50;
            newGuides.push({ type: 'horizontal', position: 50 });
          } else {
            // Check other layers on canvas
            for (const other of layers) {
              if (other.id === drag.id) continue;
              const otherCenterY = other.y + other.height / 2;
              if (Math.abs(elementCenterY - otherCenterY) <= snapThreshY) {
                nextY = otherCenterY - layerHeight / 2;
                newGuides.push({ type: 'horizontal', position: otherCenterY });
                break;
              } else if (Math.abs(elementTop - other.y) <= snapThreshY) {
                nextY = other.y;
                newGuides.push({ type: 'horizontal', position: other.y });
                break;
              } else if (Math.abs(elementBottom - (other.y + other.height)) <= snapThreshY) {
                nextY = other.y + other.height - layerHeight;
                newGuides.push({ type: 'horizontal', position: other.y + other.height });
                break;
              }
            }
          }
        }

        setActiveGuides(newGuides);

        const deltaX = nextX - drag.startX;
        const deltaY = nextY - drag.startY;

        setLayers((current) =>
          current.map((layer) => {
            if (drag.initialPositions && drag.initialPositions[layer.id] !== undefined) {
              const start = drag.initialPositions[layer.id];
              return {
                ...layer,
                x: start.x + deltaX,
                y: start.y + deltaY,
              };
            }
            if (layer.id === drag.id) {
              return {
                ...layer,
                x: nextX,
                y: nextY,
              };
            }
            return layer;
          })
        );
      }
      if (resizeRef.current) {
        const resize = resizeRef.current;
        const deltaX = ((event.clientX - resize.startX) / canvas.width) * 100;
        const deltaY = ((event.clientY - resize.startY) / canvas.height) * 100;

        // 0) Multi-selection resize: left/right handles adjust width, corner handles scale group
        if (resize.isMulti && resize.initialLayers && resize.groupWidth) {
          if (resize.corner === 'e') {
            const newGroupWidth = Math.max(5, resize.groupWidth + deltaX);
            const scaleX = newGroupWidth / resize.groupWidth;

            setLayers((current) =>
              current.map((layer) => {
                const init = resize.initialLayers?.find((l) => l.id === layer.id);
                if (!init) return layer;
                const relX = init.x - resize.groupMinX!;
                const nextX = resize.groupMinX! + relX * scaleX;
                const nextWidth = Math.max(2, init.width * scaleX);
                return {
                  ...layer,
                  x: nextX,
                  width: nextWidth,
                };
              })
            );
            return;
          }

          if (resize.corner === 'w') {
            const initialGroupRight = resize.groupMinX! + resize.groupWidth;
            const newGroupMinX = resize.groupMinX! + deltaX;
            const newGroupWidth = Math.max(5, initialGroupRight - newGroupMinX);
            const scaleX = newGroupWidth / resize.groupWidth;

            setLayers((current) =>
              current.map((layer) => {
                const init = resize.initialLayers?.find((l) => l.id === layer.id);
                if (!init) return layer;
                const relRight = initialGroupRight - (init.x + init.width);
                const nextWidth = Math.max(2, init.width * scaleX);
                const nextX = initialGroupRight - relRight * scaleX - nextWidth;
                return {
                  ...layer,
                  x: nextX,
                  width: nextWidth,
                };
              })
            );
            return;
          }

          let scale = 1;
          const pixelDx = event.clientX - resize.startX;
          const pixelDy = event.clientY - resize.startY;
          if (resize.corner === 'se') scale = Math.max(0.1, 1 + (pixelDx + pixelDy) / 200);
          else if (resize.corner === 'nw') scale = Math.max(0.1, 1 - (pixelDx + pixelDy) / 200);
          else if (resize.corner === 'ne') scale = Math.max(0.1, 1 + (pixelDx - pixelDy) / 200);
          else if (resize.corner === 'sw') scale = Math.max(0.1, 1 - (pixelDx - pixelDy) / 200);

          const anchorX = resize.corner.includes('w') ? resize.groupMinX! + resize.groupWidth : resize.groupMinX!;
          const anchorY = resize.corner.includes('n') ? resize.groupMinY! + resize.groupHeight : resize.groupMinY!;

          setLayers((current) =>
            current.map((layer) => {
              const init = resize.initialLayers?.find((l) => l.id === layer.id);
              if (!init) return layer;

              let nextX = init.x;
              let nextY = init.y;
              const nextWidth = Math.max(2, init.width * scale);
              const nextHeight = Math.max(2, init.height * scale);

              if (resize.corner.includes('w')) {
                const relDist = anchorX - (init.x + init.width);
                nextX = anchorX - relDist * scale - nextWidth;
              } else {
                const relDist = init.x - anchorX;
                nextX = anchorX + relDist * scale;
              }

              if (resize.corner.includes('n')) {
                const relDist = anchorY - (init.y + init.height);
                nextY = anchorY - relDist * scale - nextHeight;
              } else {
                const relDist = init.y - anchorY;
                nextY = anchorY + relDist * scale;
              }

              return {
                ...layer,
                x: nextX,
                y: nextY,
                width: nextWidth,
                height: nextHeight,
                fontSize: init.fontSize ? Math.max(8, Math.round(init.fontSize * scale)) : layer.fontSize,
              };
            })
          );
          return;
        }

        // 1) Text layer corner drag: scales font size based on dragging towards / opposite to text
        if (resize.isText && ['nw', 'ne', 'sw', 'se'].includes(resize.corner)) {
          const pixelDeltaX = event.clientX - resize.startX;
          const pixelDeltaY = event.clientY - resize.startY;

          let delta = 0;
          if (resize.corner === 'se') {
            delta = (pixelDeltaX + pixelDeltaY) / 2;
          } else if (resize.corner === 'nw') {
            delta = (-pixelDeltaX - pixelDeltaY) / 2;
          } else if (resize.corner === 'ne') {
            delta = (pixelDeltaX - pixelDeltaY) / 2;
          } else if (resize.corner === 'sw') {
            delta = (-pixelDeltaX + pixelDeltaY) / 2;
          }

          // Sensitivity: ~140px drag doubles font size
          const scale = Math.max(0.15, 1 + delta / 140);
          const startFont = resize.startFontSize || 34;
          const nextFontSize = Math.round(Math.max(8, Math.min(240, startFont * scale)));
          const actualScale = nextFontSize / startFont;
          const nextWidth = Math.max(8, (resize.startWidth || 30) * actualScale);

          let nextX = resize.x;
          if (resize.corner.includes('w')) {
            nextX = resize.x + resize.width - nextWidth;
          }

          setLayers((current) =>
            current.map((layer) => {
              if (layer.id !== resize.id) return layer;
              return {
                ...layer,
                x: nextX,
                width: nextWidth,
                fontSize: nextFontSize,
              };
            })
          );
          const snapThresholdPx = 10;
          const snapThreshX = (snapThresholdPx / canvas.width) * 100;
          const resizeGuides: Array<{ type: 'vertical' | 'horizontal'; position: number }> = [];
          if (resize.corner.includes('w')) {
            if (Math.abs(nextX - 0) <= snapThreshX) resizeGuides.push({ type: 'vertical', position: 0 });
            else if (Math.abs(nextX - 50) <= snapThreshX) resizeGuides.push({ type: 'vertical', position: 50 });
          } else {
            const currentRight = nextX + nextWidth;
            if (Math.abs(currentRight - 50) <= snapThreshX) resizeGuides.push({ type: 'vertical', position: 50 });
            else if (Math.abs(currentRight - 100) <= snapThreshX) resizeGuides.push({ type: 'vertical', position: 100 });
          }
          setActiveGuides(resizeGuides);
          return;
        }

        // 2) Circle, Star, Triangle uniform scaling (aspect ratio strictly locked, always 1:1 square, expandable outside frame)
        if (resize.isUniformShape) {
          const pixelDeltaX = event.clientX - resize.startX;
          const pixelDeltaY = event.clientY - resize.startY;
          const canvasRatio = canvas.width / canvas.height;

          let delta = 0;
          if (resize.corner === 'se') delta = (pixelDeltaX + pixelDeltaY) / 2;
          else if (resize.corner === 'nw') delta = (-pixelDeltaX - pixelDeltaY) / 2;
          else if (resize.corner === 'ne') delta = (pixelDeltaX - pixelDeltaY) / 2;
          else if (resize.corner === 'sw') delta = (-pixelDeltaX + pixelDeltaY) / 2;
          else if (resize.corner === 'e') delta = pixelDeltaX;
          else if (resize.corner === 'w') delta = -pixelDeltaX;
          else if (resize.corner === 's') delta = pixelDeltaY;
          else if (resize.corner === 'n') delta = -pixelDeltaY;

          const scale = Math.max(0.05, 1 + delta / 140);
          // Scale freely without any artificial 95% cap
          const nextWidth = Math.max(2, Math.min(500, resize.width * scale));
          // nextHeight is strictly locked to nextWidth * canvasRatio:
          const nextHeight = nextWidth * canvasRatio;

          let nextX = resize.x;
          let nextY = resize.y;
          if (resize.corner.includes('w')) {
            nextX = resize.x + resize.width - nextWidth;
          }
          if (resize.corner.includes('n')) {
            nextY = resize.y + resize.height - nextHeight;
          }

          setLayers((current) =>
            current.map((layer) =>
              layer.id === resize.id
                ? {
                    ...layer,
                    x: nextX,
                    y: nextY,
                    width: nextWidth,
                    height: nextHeight,
                  }
                : layer
            )
          );
          const snapThresholdPx = 10;
          const snapThreshX = (snapThresholdPx / canvas.width) * 100;
          const snapThreshY = (snapThresholdPx / canvas.height) * 100;
          const resizeGuides: Array<{ type: 'vertical' | 'horizontal'; position: number }> = [];
          if (resize.corner.includes('w')) {
            if (Math.abs(nextX - 0) <= snapThreshX) resizeGuides.push({ type: 'vertical', position: 0 });
            else if (Math.abs(nextX - 50) <= snapThreshX) resizeGuides.push({ type: 'vertical', position: 50 });
          } else if (resize.corner.includes('e')) {
            const currentRight = nextX + nextWidth;
            if (Math.abs(currentRight - 50) <= snapThreshX) resizeGuides.push({ type: 'vertical', position: 50 });
            else if (Math.abs(currentRight - 100) <= snapThreshX) resizeGuides.push({ type: 'vertical', position: 100 });
          }
          if (resize.corner.includes('n')) {
            if (Math.abs(nextY - 0) <= snapThreshY) resizeGuides.push({ type: 'horizontal', position: 0 });
            else if (Math.abs(nextY - 50) <= snapThreshY) resizeGuides.push({ type: 'horizontal', position: 50 });
          } else if (resize.corner.includes('s')) {
            const currentBottom = nextY + nextHeight;
            if (Math.abs(currentBottom - 50) <= snapThreshY) resizeGuides.push({ type: 'horizontal', position: 50 });
            else if (Math.abs(currentBottom - 100) <= snapThreshY) resizeGuides.push({ type: 'horizontal', position: 100 });
          }
          setActiveGuides(resizeGuides);
          return;
        }

        // 3) Left/right handles (w/e) for text/rectangle width or general resize for images/rectangle shapes
        const fromWest = resize.corner.includes('w');
        const fromNorth = resize.corner.includes('n');
        const changesWidth = !resize.isUniformShape && (resize.corner.includes('w') || resize.corner.includes('e'));
        const changesHeight = !resize.isText && !resize.isUniformShape && (resize.corner.includes('n') || resize.corner.includes('s'));

        const snapThresholdPx = 8;
        const snapThreshX = (snapThresholdPx / canvas.width) * 100;
        const snapThreshY = (snapThresholdPx / canvas.height) * 100;
        const resizeGuides: Array<{ type: 'vertical' | 'horizontal'; position: number }> = [];

        setLayers((current) =>
          current.map((layer) => {
            if (layer.id !== resize.id) return layer;
            const right = resize.x + resize.width;
            const bottom = resize.y + resize.height;
            let nextX = fromWest ? Math.min(right - 4, resize.x + deltaX) : resize.x;
            let nextY = fromNorth ? Math.min(bottom - 4, resize.y + deltaY) : resize.y;
            let nextWidth = fromWest
              ? right - nextX
              : changesWidth
              ? Math.max(4, resize.width + deltaX)
              : resize.width;
            let nextHeight = fromNorth
              ? bottom - nextY
              : changesHeight
              ? Math.max(4, resize.height + deltaY)
              : resize.height;

            if (fromWest) {
              if (Math.abs(nextX - 0) <= snapThreshX) {
                nextWidth += nextX;
                nextX = 0;
                resizeGuides.push({ type: 'vertical', position: 0 });
              } else if (Math.abs(nextX - 50) <= snapThreshX) {
                nextWidth += nextX - 50;
                nextX = 50;
                resizeGuides.push({ type: 'vertical', position: 50 });
              }
            } else if (changesWidth) {
              const currentRight = nextX + nextWidth;
              if (Math.abs(currentRight - 50) <= snapThreshX) {
                nextWidth = 50 - nextX;
                resizeGuides.push({ type: 'vertical', position: 50 });
              } else if (Math.abs(currentRight - 100) <= snapThreshX) {
                nextWidth = 100 - nextX;
                resizeGuides.push({ type: 'vertical', position: 100 });
              }
            }

            if (fromNorth) {
              if (Math.abs(nextY - 0) <= snapThreshY) {
                nextHeight += nextY;
                nextY = 0;
                resizeGuides.push({ type: 'horizontal', position: 0 });
              } else if (Math.abs(nextY - 50) <= snapThreshY) {
                nextHeight += nextY - 50;
                nextY = 50;
                resizeGuides.push({ type: 'horizontal', position: 50 });
              }
            } else if (changesHeight) {
              const currentBottom = nextY + nextHeight;
              if (Math.abs(currentBottom - 50) <= snapThreshY) {
                nextHeight = 50 - nextY;
                resizeGuides.push({ type: 'horizontal', position: 50 });
              } else if (Math.abs(currentBottom - 100) <= snapThreshY) {
                nextHeight = 100 - nextY;
                resizeGuides.push({ type: 'horizontal', position: 100 });
              }
            }

            return {
              ...layer,
              x: nextX,
              y: resize.isText ? layer.y : nextY,
              width: nextWidth,
              height: resize.isText ? layer.height : nextHeight,
            };
          })
        );
        setActiveGuides(resizeGuides);
      }
    };

    const stopPointer = () => {
      setDragAngleInfo(null);
      setActiveGuides([]);
      setMarqueeBox(null);
      if (dragStartSnapshotRef.current) {
        const snapshot = dragStartSnapshotRef.current;
        dragStartSnapshotRef.current = null;
        if (JSON.stringify(snapshot) !== JSON.stringify(layers)) {
          setPast((prev) => [...prev.slice(-30), snapshot]);
          setFuture([]);
        }
      }
      dragRef.current = null;
      resizeRef.current = null;
      rotateRef.current = null;
    };

    // Keyboard shortcuts: Delete, Ctrl+Z (Undo), Ctrl+Y / Ctrl+Shift+Z (Redo), Ctrl+D (Duplicate)
    useEffect(() => {
      const handleKeyDown = (event: KeyboardEvent) => {
        const activeEl = document.activeElement;
        const isInputFocused =
          activeEl instanceof HTMLInputElement ||
          activeEl instanceof HTMLTextAreaElement ||
          (activeEl instanceof HTMLElement && activeEl.isContentEditable);

        // Duplicate: Ctrl+D or Cmd+D
        if ((event.ctrlKey || event.metaKey) && (event.key === 'd' || event.key === 'D')) {
          if (!isInputFocused && editingId === null && selectedIds.length > 0) {
            event.preventDefault();
            duplicateSelected();
            return;
          }
        }

        // Undo: Ctrl+Z or Cmd+Z (without Shift)
        if ((event.ctrlKey || event.metaKey) && (event.key === 'z' || event.key === 'Z') && !event.shiftKey) {
          if (!isInputFocused || editingId === null) {
            event.preventDefault();
            undo();
            return;
          }
        }

        // Redo: Ctrl+Y or Cmd+Y, or Ctrl+Shift+Z or Cmd+Shift+Z
        if (
          ((event.ctrlKey || event.metaKey) && (event.key === 'y' || event.key === 'Y')) ||
          ((event.ctrlKey || event.metaKey) && event.shiftKey && (event.key === 'z' || event.key === 'Z'))
        ) {
          if (!isInputFocused || editingId === null) {
            event.preventDefault();
            redo();
            return;
          }
        }

        // Delete or Backspace
        if (event.key === 'Delete' || event.key === 'Backspace') {
          if (!isInputFocused && editingId === null && selectedIds.length > 0) {
            event.preventDefault();
            deleteSelected();
            return;
          }
        }

        // Layer ordering keyboard shortcuts: Ctrl+] (forward) and Ctrl+[ (backward)
        if ((event.ctrlKey || event.metaKey) && (event.key === ']' || event.key === '}')) {
          if (!isInputFocused && editingId === null && selectedId) {
            event.preventDefault();
            moveLayer(selectedId, event.shiftKey ? 'front' : 'forward');
            return;
          }
        }
        if ((event.ctrlKey || event.metaKey) && (event.key === '[' || event.key === '{')) {
          if (!isInputFocused && editingId === null && selectedId) {
            event.preventDefault();
            moveLayer(selectedId, event.shiftKey ? 'back' : 'backward');
            return;
          }
        }
      };

      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selectedIds, selectedId, editingId, layers, past, future]);

    // Global pointerdown listener to deselect elements when clicking outside the canvas frame
    useEffect(() => {
      const handleGlobalPointerDown = (event: PointerEvent) => {
        const target = event.target as HTMLElement | null;
        if (!target) return;

        // If clicking inside the canvas frame, canvas handlers will handle it
        if (canvasRef.current && canvasRef.current.contains(target)) {
          return;
        }

        // If clicking inside the top toolbar slot, keep selection so user can adjust font/color/size
        if (portalTarget && portalTarget.contains(target)) {
          return;
        }

        // If clicking inside the bottom position slot, keep selection
        if (positionPortalTarget && positionPortalTarget.contains(target)) {
          return;
        }

        // If clicking inside any custom popover, dropdown, or toolbar button
        if (
          target.closest('.mockup-popover-exclude') ||
          target.closest('#custom-design-toolbar-slot') ||
          target.closest('#custom-design-position-slot') ||
          target.closest('.custom-tool-button')
        ) {
          return;
        }

        // User clicked outside the frame (in workspace, preview container, etc.): DESELECT!
        setSelectedIds([]);
        setEditingId(null);
        setIsStrokeOpen(false);
        setIsRadiusOpen(false);
        setIsOpacityOpen(false);
        setIsFontOpen(false);
        setIsShapeMenuOpen(false);
        setIsPositionOpen(false);
      };

      window.addEventListener('pointerdown', handleGlobalPointerDown);
      return () => window.removeEventListener('pointerdown', handleGlobalPointerDown);
    }, [portalTarget, positionPortalTarget]);

    const iconButton = 'custom-tool-button h-8 min-w-8 px-2 cursor-pointer select-none';
    const toggleClass = (active = false) =>
      `${iconButton} ${active ? 'bg-orange-100 text-orange-600 dark:bg-orange-500/25 dark:text-orange-300 font-bold' : ''}`;

    const renderPositionControl = () => (
      <div className="relative" ref={positionMenuRef}>
        <button
          type="button"
          onClick={() => {
            setIsPositionOpen((prev) => !prev);
            setIsStrokeOpen(false);
            setIsRadiusOpen(false);
            setIsOpacityOpen(false);
            setIsFontOpen(false);
            setIsShapeMenuOpen(false);
          }}
          className={`bg-white/60 dark:bg-[#0e0e24] hover:bg-indigo-50/80 dark:hover:bg-[#181836] border border-slate-200/80 dark:border-[#1c1c38] text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white px-3 py-2 rounded-xl text-xs font-semibold transition-all flex items-center space-x-1.5 shadow-sm hover:shadow cursor-pointer ${
            isPositionOpen
              ? 'bg-orange-100 text-orange-600 dark:bg-orange-500/25 dark:text-orange-300 font-bold border-orange-300 dark:border-orange-500/40'
              : ''
          }`}
          title="Position / Arrange layers"
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Position</span>
        </button>

        {isPositionOpen && (
          <div
            className="absolute bottom-full mb-2 left-0 z-50 w-72 bg-white dark:bg-[#121226] border border-slate-200/90 dark:border-slate-700/90 rounded-2xl p-3 shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="text-xs font-bold text-slate-800 dark:text-slate-100">Layers</div>
              <div className="text-[11px] text-slate-400 font-medium">Drag or click to reorder</div>
            </div>

            {layers.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-400">No elements on canvas</div>
            ) : (
              <div className="flex flex-col gap-2 max-h-72 overflow-y-auto pr-0.5 scrollbar-thin">
                {/* Render in visual z-order from Front (top of list) to Back (bottom of list) */}
                {[...layers].reverse().map((layer, reverseIndex) => {
                  const isSelected = selectedIds.includes(layer.id);
                  const actualIndex = layers.length - 1 - reverseIndex;
                  const isTop = actualIndex === layers.length - 1;
                  const isBottom = actualIndex === 0;

                  return (
                    <div
                      key={layer.id}
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.setData('text/plain', layer.id);
                      }}
                      onDragOver={(e) => {
                        e.preventDefault();
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        const draggedId = e.dataTransfer.getData('text/plain');
                        if (draggedId && draggedId !== layer.id) {
                          reorderLayers(draggedId, layer.id);
                        }
                      }}
                      onClick={(e) => {
                        if (e.shiftKey || e.ctrlKey || e.metaKey) {
                          toggleSelectId(layer.id);
                        } else {
                          setSelectedId(layer.id);
                        }
                      }}
                      className={`group relative flex items-center justify-between px-2.5 py-2 rounded-xl transition-all cursor-pointer ${
                        isSelected
                          ? 'border-2 border-purple-600 dark:border-purple-400 bg-purple-50/40 dark:bg-purple-950/20 shadow-sm'
                          : 'border border-transparent bg-slate-100/90 dark:bg-slate-800/70 hover:bg-slate-200/80 dark:hover:bg-slate-700/70'
                      }`}
                    >
                      {/* Left: 6-dot drag handle icon */}
                      <div
                        className="flex items-center justify-center p-1 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200 cursor-grab active:cursor-grabbing"
                        title="Drag to reorder"
                      >
                        <GripVertical className="w-4 h-4" />
                      </div>

                      {/* Center: Visual Thumbnail / Preview of element */}
                      <div className="flex-1 flex items-center justify-center h-8 px-2 overflow-hidden pointer-events-none">
                        {layer.type === 'shape' && (!layer.shapeType || layer.shapeType === 'rectangle') && (
                          <div
                            className="w-12 h-6 shadow-xs"
                            style={{
                              backgroundColor: layer.fill || '#9333ea',
                              borderRadius: `${Math.min(layer.radius || 0, 6)}px`,
                            }}
                          />
                        )}
                        {layer.type === 'shape' && layer.shapeType === 'circle' && (
                          <div
                            className="w-6 h-6 rounded-full shadow-xs"
                            style={{ backgroundColor: layer.fill || '#9333ea' }}
                          />
                        )}
                        {layer.type === 'shape' && layer.shapeType === 'triangle' && (
                          <svg viewBox="0 0 100 100" className="w-6 h-6 drop-shadow-xs">
                            <polygon points="50,0 100,100 0,100" fill={layer.fill || '#9333ea'} />
                          </svg>
                        )}
                        {layer.type === 'shape' && layer.shapeType === 'star' && (
                          <svg viewBox="0 0 100 100" className="w-6 h-6 drop-shadow-xs">
                            <polygon
                              points="50,0 61.8,35.3 100,38.2 69.1,57.3 80.9,100 50,70.0 19.1,100 30.9,57.3 0,38.2 38.2,35.3"
                              fill={layer.fill || '#9333ea'}
                            />
                          </svg>
                        )}
                        {layer.type === 'image' && (
                          <img src={layer.src} alt="Layer" className="h-7 w-11 object-cover rounded shadow-xs" />
                        )}
                        {layer.type === 'text' && (
                          <div
                            className="max-w-[120px] truncate text-xs font-semibold px-2 py-0.5 rounded bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-700/80 text-slate-800 dark:text-slate-100"
                            style={{ fontFamily: layer.fontFamily }}
                          >
                            {layer.text || 'Text'}
                          </div>
                        )}
                      </div>

                      {/* Right: Quick reorder buttons on hover + 3-dots menu button */}
                      <div className="flex items-center gap-0.5">
                        {/* Up button (Bring forward) */}
                        <button
                          type="button"
                          disabled={isTop}
                          onClick={(e) => {
                            e.stopPropagation();
                            moveLayer(layer.id, 'forward');
                          }}
                          className={`p-1 rounded hover:bg-slate-300/60 dark:hover:bg-slate-600/60 transition-colors ${
                            isTop ? 'opacity-20 cursor-not-allowed' : 'text-slate-600 dark:text-slate-300'
                          }`}
                          title="Move forward (Ctrl+])"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>

                        {/* Down button (Send backward) */}
                        <button
                          type="button"
                          disabled={isBottom}
                          onClick={(e) => {
                            e.stopPropagation();
                            moveLayer(layer.id, 'backward');
                          }}
                          className={`p-1 rounded hover:bg-slate-300/60 dark:hover:bg-slate-600/60 transition-colors ${
                            isBottom ? 'opacity-20 cursor-not-allowed' : 'text-slate-600 dark:text-slate-300'
                          }`}
                          title="Move backward (Ctrl+[)"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>

                        {/* 3-dots menu button */}
                        <div className="relative">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveLayerMenuId(activeLayerMenuId === layer.id ? null : layer.id);
                            }}
                            className="p-1 rounded hover:bg-slate-300/60 dark:hover:bg-slate-600/60 text-slate-500 hover:text-slate-800 dark:hover:text-slate-100 transition-colors"
                            title="More actions"
                          >
                            <MoreVertical className="w-3.5 h-3.5" />
                          </button>

                          {activeLayerMenuId === layer.id && (
                            <div
                              className="absolute right-0 bottom-full mb-1 z-60 w-44 bg-white dark:bg-[#181830] border border-slate-200 dark:border-slate-700 rounded-xl p-1 shadow-xl flex flex-col gap-0.5"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <button
                                type="button"
                                onClick={() => {
                                  moveLayer(layer.id, 'front');
                                  setActiveLayerMenuId(null);
                                }}
                                className="w-full px-2.5 py-1.5 text-left text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg flex items-center justify-between"
                              >
                                <span>To Front</span>
                                <span className="text-[10px] text-slate-400 font-mono">Ctrl+Shift+]</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  moveLayer(layer.id, 'forward');
                                  setActiveLayerMenuId(null);
                                }}
                                className="w-full px-2.5 py-1.5 text-left text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg flex items-center justify-between"
                              >
                                <span>Forward</span>
                                <span className="text-[10px] text-slate-400 font-mono">Ctrl+]</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  moveLayer(layer.id, 'backward');
                                  setActiveLayerMenuId(null);
                                }}
                                className="w-full px-2.5 py-1.5 text-left text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg flex items-center justify-between"
                              >
                                <span>Backward</span>
                                <span className="text-[10px] text-slate-400 font-mono">Ctrl+[</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  moveLayer(layer.id, 'back');
                                  setActiveLayerMenuId(null);
                                }}
                                className="w-full px-2.5 py-1.5 text-left text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg flex items-center justify-between"
                              >
                                <span>To Back</span>
                                <span className="text-[10px] text-slate-400 font-mono">Ctrl+Shift+[</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    );

    const activeTarget = toolbarSlot || portalTarget;

    const toolbarContent = (
      <div
        className="custom-selection-toolbar"
        onPointerDown={(event) => event.stopPropagation()}
        onClick={(event) => event.stopPropagation()}
      >
        {/* Shape Fill Color (when shape selected) */}
        {selectedLayer?.type === 'shape' && (
          <label
            className="custom-tool-button h-8 w-8 relative flex flex-col items-center justify-center cursor-pointer select-none"
            title="Shape fill color"
          >
            <span
              className="w-4 h-4 rounded border border-slate-300 dark:border-slate-600"
              style={{ background: selectedLayer.fill || '#f97316' }}
            />
            <input
              type="color"
              value={selectedLayer.fill || '#f97316'}
              onChange={(event) => updateSelected({ fill: event.target.value })}
              className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
            />
          </label>
        )}

        {/* Stroke / Border Style & Weight Popup (Image & Shape) */}
        {(selectedLayer?.type === 'image' || selectedLayer?.type === 'shape') && (
          <div className="relative" ref={strokeMenuRef}>
            <button
              type="button"
              onClick={() => {
                setIsStrokeOpen((prev) => !prev);
                setIsRadiusOpen(false);
                setIsOpacityOpen(false);
              }}
              className={`custom-tool-button h-8 w-8 flex items-center justify-center rounded-lg transition-colors ${
                isStrokeOpen || (selectedLayer.strokeWidth && selectedLayer.strokeWidth > 0 && selectedLayer.strokeStyle !== 'none')
                  ? 'bg-slate-200/90 dark:bg-slate-700/90 text-slate-900 dark:text-white'
                  : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200'
              }`}
              title="Border style"
            >
              {/* Canva 3 horizontal lines icon */}
              <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                <rect x="2" y="3.5" width="16" height="3" rx="1" />
                <rect x="2" y="8.5" width="16" height="2" rx="0.75" />
                <rect x="2" y="13" width="16" height="1.2" rx="0.5" />
              </svg>
            </button>

            {isStrokeOpen && (
              <div
                className="absolute top-full mt-2 left-0 z-50 w-72 bg-white dark:bg-[#121226] border border-slate-200/90 dark:border-slate-700/90 rounded-2xl p-4 shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                {/* 5 Border Style Buttons */}
                <div className="flex items-center gap-1.5 w-full">
                  {/* None */}
                  <button
                    type="button"
                    onClick={() => updateSelected({ strokeWidth: 0, strokeStyle: 'none' })}
                    className={`h-9 flex-1 rounded-xl border flex items-center justify-center transition-all ${
                      selectedLayer.strokeWidth === 0 || selectedLayer.strokeStyle === 'none'
                        ? 'border-2 border-purple-600 dark:border-purple-400 bg-purple-50/50 dark:bg-purple-900/20'
                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                    }`}
                    title="None"
                  >
                    <svg className="w-4 h-4 text-slate-700 dark:text-slate-200" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="9" />
                      <line x1="5.6" y1="5.6" x2="18.4" y2="18.4" />
                    </svg>
                  </button>

                  {/* Solid */}
                  <button
                    type="button"
                    onClick={() => updateSelected({ strokeWidth: selectedLayer.strokeWidth || 2, strokeStyle: 'solid' })}
                    className={`h-9 flex-1 rounded-xl border flex items-center justify-center transition-all ${
                      selectedLayer.strokeStyle === 'solid' || (!selectedLayer.strokeStyle && (selectedLayer.strokeWidth || 0) > 0)
                        ? 'border-2 border-purple-600 dark:border-purple-400 bg-purple-50/50 dark:bg-purple-900/20'
                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                    }`}
                    title="Solid"
                  >
                    <div className="w-6 h-0.5 bg-slate-800 dark:bg-slate-200 rounded" />
                  </button>

                  {/* Dash wide */}
                  <button
                    type="button"
                    onClick={() => updateSelected({ strokeWidth: selectedLayer.strokeWidth || 2, strokeStyle: 'dashed-wide' })}
                    className={`h-9 flex-1 rounded-xl border flex items-center justify-center transition-all ${
                      selectedLayer.strokeStyle === 'dashed-wide'
                        ? 'border-2 border-purple-600 dark:border-purple-400 bg-purple-50/50 dark:bg-purple-900/20'
                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                    }`}
                    title="Dashed"
                  >
                    <svg className="w-6 h-2 text-slate-800 dark:text-slate-200" viewBox="0 0 24 4">
                      <line x1="1" y1="2" x2="10" y2="2" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                      <line x1="14" y1="2" x2="23" y2="2" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                    </svg>
                  </button>

                  {/* Short dash */}
                  <button
                    type="button"
                    onClick={() => updateSelected({ strokeWidth: selectedLayer.strokeWidth || 2, strokeStyle: 'dashed' })}
                    className={`h-9 flex-1 rounded-xl border flex items-center justify-center transition-all ${
                      selectedLayer.strokeStyle === 'dashed'
                        ? 'border-2 border-purple-600 dark:border-purple-400 bg-purple-50/50 dark:bg-purple-900/20'
                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                    }`}
                    title="Short dashed"
                  >
                    <svg className="w-6 h-2 text-slate-800 dark:text-slate-200" viewBox="0 0 24 4">
                      <line x1="0" y1="2" x2="5" y2="2" stroke="currentColor" strokeWidth="2.5" />
                      <line x1="9" y1="2" x2="14" y2="2" stroke="currentColor" strokeWidth="2.5" />
                      <line x1="18" y1="2" x2="23" y2="2" stroke="currentColor" strokeWidth="2.5" />
                    </svg>
                  </button>

                  {/* Dotted */}
                  <button
                    type="button"
                    onClick={() => updateSelected({ strokeWidth: selectedLayer.strokeWidth || 2, strokeStyle: 'dotted' })}
                    className={`h-9 flex-1 rounded-xl border flex items-center justify-center transition-all ${
                      selectedLayer.strokeStyle === 'dotted'
                        ? 'border-2 border-purple-600 dark:border-purple-400 bg-purple-50/50 dark:bg-purple-900/20'
                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                    }`}
                    title="Dotted"
                  >
                    <svg className="w-6 h-2 text-slate-800 dark:text-slate-200" viewBox="0 0 24 4">
                      <line x1="1" y1="2" x2="23" y2="2" stroke="currentColor" strokeWidth="2.5" strokeDasharray="1 4" strokeLinecap="round" />
                    </svg>
                  </button>
                </div>

                {/* Stroke weight */}
                <div className="mt-4 mb-2 flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 font-['Outfit']">Stroke weight</span>
                  <label className="flex items-center gap-1.5 cursor-pointer text-[11px] font-semibold text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200">
                    <span>Color</span>
                    <span
                      className="w-4 h-4 rounded-md border border-slate-300 dark:border-slate-600 relative overflow-hidden inline-block"
                      style={{ backgroundColor: selectedLayer.stroke || '#7c3aed' }}
                    >
                      <input
                        type="color"
                        value={selectedLayer.stroke || '#7c3aed'}
                        onChange={(e) => updateSelected({ stroke: e.target.value })}
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                      />
                    </span>
                  </label>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="0"
                    max="40"
                    value={selectedLayer.strokeWidth || 0}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      updateSelected({
                        strokeWidth: val,
                        strokeStyle: val > 0 && selectedLayer.strokeStyle === 'none' ? 'solid' : selectedLayer.strokeStyle || 'solid',
                      });
                    }}
                    className="flex-1 accent-purple-600 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
                  />
                  <input
                    type="number"
                    min="0"
                    max="40"
                    value={selectedLayer.strokeWidth || 0}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      updateSelected({
                        strokeWidth: val,
                        strokeStyle: val > 0 && selectedLayer.strokeStyle === 'none' ? 'solid' : selectedLayer.strokeStyle || 'solid',
                      });
                    }}
                    className="w-11 h-9 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-center text-xs font-bold text-slate-800 dark:text-slate-100 outline-none focus:border-purple-500"
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Corner Rounding Popup (Image & Rectangle Shape) */}
        {(selectedLayer?.type === 'image' || (selectedLayer?.type === 'shape' && (!selectedLayer.shapeType || selectedLayer.shapeType === 'rectangle'))) && (
          <div className="relative" ref={radiusMenuRef}>
            <button
              type="button"
              onClick={() => {
                setIsRadiusOpen((prev) => !prev);
                setIsStrokeOpen(false);
                setIsOpacityOpen(false);
              }}
              className={`custom-tool-button h-8 w-8 flex items-center justify-center rounded-lg transition-colors ${
                isRadiusOpen || (selectedLayer.radius && selectedLayer.radius > 0)
                  ? 'bg-slate-200/90 dark:bg-slate-700/90 text-slate-900 dark:text-white'
                  : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200'
              }`}
              title="Corner rounding"
            >
              {/* Canva corner rounding icon */}
              <svg className="w-4 h-4 text-current" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 17V11C4 7.13401 7.13401 4 11 4H17" strokeWidth="2.2" />
              </svg>
            </button>

            {isRadiusOpen && (
              <div
                className="absolute top-full mt-2 left-0 z-50 w-64 bg-white dark:bg-[#121226] border border-slate-200/90 dark:border-slate-700/90 rounded-2xl p-4 shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="text-xs font-semibold text-slate-700 dark:text-slate-200 font-['Outfit'] mb-3">
                  Corner rounding
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={selectedLayer.radius || 0}
                    onChange={(e) => updateSelected({ radius: Number(e.target.value) })}
                    className="flex-1 accent-purple-600 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
                  />
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={selectedLayer.radius || 0}
                    onChange={(e) => updateSelected({ radius: Number(e.target.value) })}
                    className="w-11 h-9 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-center text-xs font-bold text-slate-800 dark:text-slate-100 outline-none focus:border-purple-500"
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Crop & Flip (Image only) */}
        {selectedLayer?.type === 'image' && (
          <>
            <button
              type="button"
              onClick={() => {
                if (croppingId === selectedLayer.id) {
                  applyCrop();
                } else {
                  startCropping(selectedLayer.id);
                }
              }}
              className={`custom-tool-button h-8 px-2.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                croppingId === selectedLayer.id
                  ? 'border-purple-600 bg-purple-600 text-white shadow-sm hover:bg-purple-700'
                  : selectedLayer.cropData
                  ? 'border-purple-500/50 bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-300'
                  : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
              title={croppingId === selectedLayer.id ? 'Apply crop (Enter)' : 'Crop image'}
            >
              {croppingId === selectedLayer.id ? <Check className="w-4 h-4" /> : <Crop className="w-4 h-4" />}
              <span>{croppingId === selectedLayer.id ? 'Done' : 'Crop'}</span>
            </button>
            {croppingId === selectedLayer.id && (
              <>
                <button
                  type="button"
                  onClick={resetCrop}
                  className="custom-tool-button h-8 px-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  title="Reset to full image"
                >
                  Reset
                </button>
                <button
                  type="button"
                  onClick={cancelCrop}
                  className="custom-tool-button h-8 px-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  title="Cancel crop (Esc)"
                >
                  Cancel
                </button>
              </>
            )}
            {/* Flip Dropdown Menu (Horizontal & Vertical) */}
            <div className="relative" ref={flipMenuRef}>
              <button
                type="button"
                onClick={() => {
                  setIsFlipOpen((prev) => !prev);
                  setIsFontOpen(false);
                  setIsStrokeOpen(false);
                  setIsRadiusOpen(false);
                  setIsOpacityOpen(false);
                  setIsShapeMenuOpen(false);
                  setIsPositionOpen(false);
                }}
                className={`custom-tool-button h-8 px-2.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                  isFlipOpen || selectedLayer.flip || selectedLayer.flipHorizontal || selectedLayer.flipVertical
                    ? 'border-orange-500 ring-1 ring-orange-500/20 bg-orange-50 text-orange-600 dark:bg-orange-500/20 dark:text-orange-300'
                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
                title="Flip options"
              >
                <FlipHorizontal className="w-4 h-4" />
                <span>Flip</span>
                <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${isFlipOpen ? 'rotate-180' : ''}`} />
              </button>

              {isFlipOpen && (
                <div
                  className="absolute top-full mt-1.5 left-0 z-50 w-44 bg-white dark:bg-[#121226] border border-slate-200/90 dark:border-slate-700/90 rounded-2xl p-1.5 shadow-2xl"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    type="button"
                    onClick={() => {
                      const currentH = selectedLayer.flipHorizontal ?? selectedLayer.flip ?? false;
                      updateSelected({ flipHorizontal: !currentH, flip: !currentH });
                    }}
                    className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-medium cursor-pointer transition-colors ${
                      selectedLayer.flipHorizontal ?? selectedLayer.flip
                        ? 'bg-orange-50 text-orange-600 dark:bg-orange-500/20 dark:text-orange-300 font-semibold'
                        : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <FlipHorizontal className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                      <span>Flip horizontal</span>
                    </div>
                    {(selectedLayer.flipHorizontal ?? selectedLayer.flip) && (
                      <Check className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400" />
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const currentV = selectedLayer.flipVertical ?? false;
                      updateSelected({ flipVertical: !currentV });
                    }}
                    className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-medium cursor-pointer transition-colors ${
                      selectedLayer.flipVertical
                        ? 'bg-orange-50 text-orange-600 dark:bg-orange-500/20 dark:text-orange-300 font-semibold'
                        : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <FlipVertical className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                      <span>Flip vertical</span>
                    </div>
                    {selectedLayer.flipVertical && (
                      <Check className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400" />
                    )}
                  </button>
                </div>
              )}
            </div>
          </>
        )}

        {/* Text Controls */}
        {selectedLayer?.type === 'text' && (
          <>
            {/* Searchable Custom Font Dropdown */}
            <div className="relative" ref={fontMenuRef}>
              <button
                type="button"
                onClick={() => {
                  setIsFontOpen((open) => !open);
                  setIsStrokeOpen(false);
                  setIsRadiusOpen(false);
                  setIsOpacityOpen(false);
                }}
                className={`custom-tool-button h-8 px-2.5 rounded-lg border bg-white dark:bg-slate-900 flex items-center justify-between gap-1 text-xs font-semibold cursor-pointer w-36 transition-colors ${
                  isFontOpen
                    ? 'border-orange-500 ring-1 ring-orange-500/20 text-orange-600 dark:text-orange-300'
                    : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-slate-300'
                }`}
                title="Change font family"
              >
                <span
                  className="truncate text-left text-xs font-semibold"
                  style={{ fontFamily: selectedLayer.fontFamily || availableFonts[0] }}
                >
                  {selectedLayer.fontFamily || availableFonts[0]}
                </span>
                <ChevronDown
                  className={`w-3.5 h-3.5 shrink-0 text-slate-400 transition-transform duration-200 ${
                    isFontOpen ? 'rotate-180 text-orange-500' : ''
                  }`}
                />
              </button>

              {isFontOpen && (
                <div
                  className="absolute top-full mt-1.5 left-0 z-50 w-64 bg-white dark:bg-[#121226] border border-slate-200/90 dark:border-slate-700/90 rounded-2xl shadow-2xl overflow-hidden"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Search Input Bar */}
                  <div className="p-2 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/70 flex items-center gap-2">
                    <Search className="w-3.5 h-3.5 text-slate-400 shrink-0 ml-1" />
                    <input
                      type="text"
                      value={fontSearch}
                      onChange={(e) => setFontSearch(e.target.value)}
                      placeholder="Search font..."
                      autoFocus
                      className="w-full bg-transparent text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 outline-none font-medium"
                    />
                    {fontSearch && (
                      <button
                        type="button"
                        onClick={() => setFontSearch('')}
                        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5 cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Option to query all local PC fonts if supported */}
                  {'queryLocalFonts' in window && !hasScannedSystemFonts && (
                    <div className="px-3 py-1.5 bg-orange-50/70 dark:bg-orange-500/10 border-b border-orange-100 dark:border-orange-500/20 flex items-center justify-between">
                      <span className="text-[11px] text-orange-700 dark:text-orange-300 font-medium">
                        Access local PC fonts
                      </span>
                      <button
                        type="button"
                        onClick={scanSystemFonts}
                        className="text-[11px] font-bold text-orange-600 dark:text-orange-400 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <Sparkles className="w-3 h-3" /> Scan PC Fonts
                      </button>
                    </div>
                  )}

                  {/* Font list */}
                  <div className="max-h-60 overflow-y-auto py-1 scrollbar-thin">
                    {availableFonts
                      .filter((font) => font.toLowerCase().includes(fontSearch.toLowerCase().trim()))
                      .map((font) => {
                        const isSelected = (selectedLayer.fontFamily || availableFonts[0]) === font;
                        return (
                          <button
                            key={font}
                            type="button"
                            onClick={() => {
                              updateSelected({ fontFamily: font });
                              setIsFontOpen(false);
                              setFontSearch('');
                            }}
                            className={`w-full text-left px-3 py-2 flex items-center justify-between text-xs transition-colors cursor-pointer ${
                              isSelected
                                ? 'bg-orange-50 text-orange-600 dark:bg-orange-500/20 dark:text-orange-300 font-bold'
                                : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                            }`}
                          >
                            <span
                              className="truncate text-sm"
                              style={{ fontFamily: font }}
                            >
                              {font}
                            </span>
                            {isSelected && (
                              <Check className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400 shrink-0 ml-2" />
                            )}
                          </button>
                        );
                      })}
                    {availableFonts.filter((font) =>
                      font.toLowerCase().includes(fontSearch.toLowerCase().trim())
                    ).length === 0 && (
                      <div className="px-3 py-6 text-center text-xs text-slate-400">
                        No fonts found matching &quot;{fontSearch}&quot;
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
            <input
              className="custom-size-input text-center"
              type="text"
              inputMode="numeric"
              value={selectedLayer.fontSize !== undefined && selectedLayer.fontSize > 0 ? selectedLayer.fontSize : ''}
              placeholder="34"
              onChange={(event) => {
                const raw = event.target.value.replace(/[^0-9]/g, '');
                if (raw === '') {
                  updateSelected({ fontSize: 0 });
                } else {
                  const num = Math.min(160, parseInt(raw, 10));
                  updateSelected({ fontSize: num });
                }
              }}
              onBlur={(event) => {
                const num = parseInt(event.target.value, 10);
                if (!num || num < 8) {
                  updateSelected({ fontSize: 8 });
                } else if (num > 160) {
                  updateSelected({ fontSize: 160 });
                }
              }}
              onKeyDown={(event) => {
                if (event.key === 'ArrowUp') {
                  event.preventDefault();
                  updateSelected({ fontSize: Math.min(160, (selectedLayer.fontSize || 34) + 1) });
                } else if (event.key === 'ArrowDown') {
                  event.preventDefault();
                  updateSelected({ fontSize: Math.max(8, (selectedLayer.fontSize || 34) - 1) });
                } else if (event.key === 'Enter') {
                  event.currentTarget.blur();
                }
              }}
              title="Font size"
            />
            {/* Font Color with rainbow underline */}
            <label
              className="custom-tool-button h-8 w-8 relative flex flex-col items-center justify-center cursor-pointer select-none"
              title="Font color"
            >
              <span className="text-xs font-black leading-none text-slate-800 dark:text-slate-100">A</span>
              <span
                className="h-[3px] w-3.5 rounded-full mt-0.5"
                style={{
                  background:
                    selectedLayer.color && selectedLayer.color !== '#ffffff'
                      ? selectedLayer.color
                      : 'linear-gradient(90deg, #ef4444, #f59e0b, #10b981, #3b82f6, #8b5cf6)',
                }}
              />
              <input
                type="color"
                value={selectedLayer.color || '#ffffff'}
                onChange={(event) => updateSelected({ color: event.target.value })}
                className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
              />
            </label>
            <button
              type="button"
              onClick={() => updateSelected({ bold: !selectedLayer.bold })}
              className={toggleClass(selectedLayer.bold)}
              title="Bold"
            >
              <Bold className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => updateSelected({ italic: !selectedLayer.italic })}
              className={toggleClass(selectedLayer.italic)}
              title="Italic"
            >
              <Italic className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => updateSelected({ underline: !selectedLayer.underline })}
              className={toggleClass(selectedLayer.underline)}
              title="Underline"
            >
              <Underline className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => updateSelected({ uppercase: !selectedLayer.uppercase })}
              className={toggleClass(selectedLayer.uppercase)}
              title="Uppercase"
            >
              <span className="text-xs font-bold leading-none">AB</span>
            </button>
            <button
              type="button"
              onClick={() => updateSelected({ align: 'left' })}
              className={toggleClass(selectedLayer.align === 'left' || !selectedLayer.align)}
              title="Align left"
            >
              <AlignLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => updateSelected({ align: 'center' })}
              className={toggleClass(selectedLayer.align === 'center')}
              title="Align center"
            >
              <AlignCenter className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => updateSelected({ align: 'right' })}
              className={toggleClass(selectedLayer.align === 'right')}
              title="Align right"
            >
              <AlignRight className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => updateSelected({ list: !selectedLayer.list })}
              className={toggleClass(selectedLayer.list)}
              title="List"
            >
              <List className="w-4 h-4" />
            </button>
          </>
        )}

        {/* Opacity Checkerboard Button & Popover */}
        {selectedLayer && (
          <div className="custom-opacity-menu relative" ref={opacityMenuRef}>
            <button
              type="button"
              className={`custom-tool-button h-8 w-8 flex items-center justify-center ${
                isOpacityOpen ? 'bg-orange-100 text-orange-600 dark:bg-orange-500/25 dark:text-orange-300' : ''
              }`}
              onClick={() => {
                setIsOpacityOpen((prev) => !prev);
                setIsStrokeOpen(false);
                setIsRadiusOpen(false);
              }}
              title={`Opacity: ${selectedLayer.opacity ?? 100}%`}
            >
              {/* Checkerboard square icon */}
              <span className="w-4 h-4 rounded-[3px] border border-slate-300 dark:border-slate-600 overflow-hidden relative inline-block bg-[linear-gradient(45deg,#ccc_25%,transparent_25%),linear-gradient(-45deg,#ccc_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#ccc_75%),linear-gradient(-45deg,transparent_75%,#ccc_75%)] bg-[size:6px_6px] bg-[position:0_0,0_3px,3px_-3px,-3px_0] dark:bg-[linear-gradient(45deg,#555_25%,transparent_25%),linear-gradient(-45deg,#555_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#555_75%),linear-gradient(-45deg,transparent_75%,#555_75%)]">
                <span
                  className="absolute inset-0 bg-slate-900 dark:bg-white"
                  style={{ opacity: 1 - ((selectedLayer.opacity ?? 100) / 100) }}
                />
              </span>
            </button>
            {isOpacityOpen && (
              <div className="custom-opacity-dropdown">
                <div className="flex items-center gap-2 relative z-10">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={selectedLayer.opacity ?? 100}
                    onChange={(event) => updateSelected({ opacity: Number(event.target.value) })}
                    className="w-28 accent-orange-500 cursor-pointer"
                  />
                  <span className="custom-opacity-value">{selectedLayer.opacity ?? 100}%</span>
                </div>
                {/* Pointer caret */}
                <div className="absolute -bottom-1 right-2.5 w-2.5 h-2.5 rotate-45 bg-white dark:bg-[#0e0e24] border-r border-b border-slate-200/90 dark:border-slate-700/90 pointer-events-none" />
              </div>
            )}
          </div>
        )}

        {/* Delete button */}
        {selectedLayer && (
          <button
            type="button"
            onClick={deleteSelected}
            className={`${iconButton} text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/15`}
            title="Delete element (Delete/Backspace)"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}

        <span className="custom-toolbar-divider" />

        {/* Add Text & Add Shape */}
        <button
          type="button"
          onClick={() => addLayer('text')}
          className={`${iconButton} gap-1.5 px-2.5`}
          title="Add text"
        >
          <Type className="w-4 h-4" />
          <span className="text-xs font-semibold">Text</span>
        </button>
        {/* Add Shape Dropdown */}
        <div className="relative" ref={shapeMenuRef}>
          <button
            type="button"
            onClick={() => {
              setIsShapeMenuOpen((prev) => !prev);
              setIsFontOpen(false);
              setIsStrokeOpen(false);
              setIsRadiusOpen(false);
              setIsOpacityOpen(false);
            }}
            className={`${iconButton} gap-1.5 px-2.5 ${
              isShapeMenuOpen ? 'bg-orange-100 text-orange-600 dark:bg-orange-500/25 dark:text-orange-300' : ''
            }`}
            title="Add shape"
          >
            <Square className="w-4 h-4" />
            <span className="text-xs font-semibold">Shape</span>
            <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${isShapeMenuOpen ? 'rotate-180' : ''}`} />
          </button>

          {isShapeMenuOpen && (
            <div
              className="absolute top-full mt-1.5 right-0 z-50 w-44 bg-white dark:bg-[#121226] border border-slate-200/90 dark:border-slate-700/90 rounded-2xl p-2 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 px-2 py-1 uppercase tracking-wider">
                Select Shape
              </div>
              <div className="flex flex-col gap-1">
                <button
                  type="button"
                  onClick={() => {
                    addShape('rectangle');
                    setIsShapeMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg hover:bg-orange-50 dark:hover:bg-orange-500/15 text-slate-700 dark:text-slate-200 text-xs font-medium cursor-pointer transition-colors"
                >
                  <Square className="w-4 h-4 text-orange-500" />
                  <span>Rectangle</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    addShape('circle');
                    setIsShapeMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg hover:bg-orange-50 dark:hover:bg-orange-500/15 text-slate-700 dark:text-slate-200 text-xs font-medium cursor-pointer transition-colors"
                >
                  <Circle className="w-4 h-4 text-orange-500" />
                  <span>Circle</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    addShape('triangle');
                    setIsShapeMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg hover:bg-orange-50 dark:hover:bg-orange-500/15 text-slate-700 dark:text-slate-200 text-xs font-medium cursor-pointer transition-colors"
                >
                  <Triangle className="w-4 h-4 text-orange-500" />
                  <span>Triangle</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    addShape('star');
                    setIsShapeMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg hover:bg-orange-50 dark:hover:bg-orange-500/15 text-slate-700 dark:text-slate-200 text-xs font-medium cursor-pointer transition-colors"
                >
                  <Star className="w-4 h-4 text-orange-500" />
                  <span>Star</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );

    return (
      <div className="w-full flex flex-col gap-2">
        {activeTarget && createPortal(toolbarContent, activeTarget)}

        <div
          ref={(node) => {
            canvasRef.current = node;
            if (typeof ref === 'function') ref(node);
            else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
          }}
          className="mockup-canvas-container relative w-full shadow-2xl"
          style={{
            aspectRatio: `${outputWidth} / ${outputHeight}`,
            backgroundColor: backgroundColor === 'transparent' ? undefined : backgroundColor,
            backgroundImage: backgroundImage ? `url(${backgroundImage})` : undefined,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            border: 'none',
            outline: 'none',
            overflow: croppingId ? 'visible' : 'hidden',
          }}
          onPointerDown={(event) => {
            if (event.target === event.currentTarget) {
              setSelectedIds([]);
              setEditingId(null);
              setIsStrokeOpen(false);
              setIsRadiusOpen(false);
              setIsOpacityOpen(false);
              const canvas = event.currentTarget.getBoundingClientRect();
              const startX = ((event.clientX - canvas.left) / canvas.width) * 100;
              const startY = ((event.clientY - canvas.top) / canvas.height) * 100;
              setMarqueeBox({
                startX,
                startY,
                currentX: startX,
                currentY: startY,
              });
              (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
            }
          }}
          onPointerMove={pointerMove}
          onPointerUp={stopPointer}
          onPointerLeave={stopPointer}
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              if (croppingId) {
                applyCrop();
              }
              setSelectedIds([]);
              setEditingId(null);
              setIsStrokeOpen(false);
              setIsRadiusOpen(false);
              setIsOpacityOpen(false);
              setIsFontOpen(false);
              setIsShapeMenuOpen(false);
            }
          }}
          onDragOver={(event) => event.preventDefault()}
          onDrop={(event) => {
            event.preventDefault();
            readDroppedImage(event.dataTransfer.files[0]);
          }}
        >
          {/* Custom Visual Guide Overlays (Smart Align Lines) */}
          {activeGuides.map((guide, idx) => (
            <div
              key={idx}
              className="pointer-events-none absolute z-40 bg-purple-500/80 shadow-[0_0_4px_rgba(168,85,247,0.8)]"
              style={
                guide.type === 'vertical'
                  ? {
                      left: `${guide.position}%`,
                      top: 0,
                      bottom: 0,
                      width: '1.5px',
                    }
                  : {
                      top: `${guide.position}%`,
                      left: 0,
                      right: 0,
                      height: '1.5px',
                    }
              }
            />
          ))}

          {/* Canvas Marquee Box overlay */}
          {marqueeBox && (
            <div
              className="pointer-events-none absolute z-40 border border-purple-500 bg-purple-500/15"
              style={{
                left: `${Math.min(marqueeBox.startX, marqueeBox.currentX)}%`,
                top: `${Math.min(marqueeBox.startY, marqueeBox.currentY)}%`,
                width: `${Math.abs(marqueeBox.currentX - marqueeBox.startX)}%`,
                height: `${Math.abs(marqueeBox.currentY - marqueeBox.startY)}%`,
              }}
            />
          )}

          {backgroundColor === 'transparent' && !backgroundImage && (
            <div className="absolute inset-0 bg-grid-pattern opacity-50 pointer-events-none" />
          )}
          {isLoading && (
            <div className="absolute inset-0 z-20 grid place-items-center bg-black/20 text-xs text-white">
              Preparing image...
            </div>
          )}
          {layers.map((layer, index) =>
            layer.id === 'source-image' && hideSourceImage ? null : (
              <div
                key={layer.id}
                data-layer-id={layer.id}
                data-crop-container={croppingId === layer.id ? 'true' : undefined}
                onPointerDown={(event) => {
                  if (croppingId !== layer.id) {
                    pointerDown(event, layer);
                  }
                }}
                onClick={(event) => {
                  event.stopPropagation();
                  if (croppingId === layer.id) return;
                  if (croppingId && croppingId !== layer.id) {
                    applyCrop();
                  }
                  if (!event.shiftKey && !event.ctrlKey && !event.metaKey) {
                    if (!hasDraggedRef.current) {
                      setSelectedIds([layer.id]);
                    }
                  }
                }}
                onDoubleClick={(event) => {
                  event.stopPropagation();
                  setSelectedId(layer.id);
                  if (layer.type === 'text') {
                    textEditStartSnapshotRef.current = layers;
                    setEditingId(layer.id);
                  } else if (layer.type === 'image') {
                    startCropping(layer.id);
                  }
                }}
                onContextMenu={(event) => event.preventDefault()}
                className={`absolute ${editingId === layer.id ? 'cursor-text select-text' : croppingId === layer.id ? 'cursor-default' : 'cursor-move select-none'} ${
                  selectedIds.includes(layer.id) && croppingId !== layer.id ? 'custom-selected-element' : ''
                }`}
                style={{
                  left: `${layer.x}%`,
                  top: `${layer.y}%`,
                  width: `${layer.width}%`,
                  height: layer.type === 'text' ? 'auto' : `${layer.height}%`,
                  zIndex: croppingId === layer.id ? 40 : index + 1,
                  transform: layer.rotation ? `rotate(${layer.rotation}deg)` : undefined,
                  transformOrigin: 'center center',
                  opacity: (layer.opacity ?? 100) / 100,
                  borderRadius:
                    layer.type === 'shape' && (!layer.shapeType || layer.shapeType === 'rectangle')
                      ? `${layer.radius || 0}px`
                      : undefined,
                  backgroundColor:
                    layer.type === 'shape' && (!layer.shapeType || layer.shapeType === 'rectangle')
                      ? layer.fill
                      : undefined,
                  border:
                    layer.type === 'image' || (layer.type === 'shape' && (!layer.shapeType || layer.shapeType === 'rectangle'))
                      ? layer.strokeWidth && layer.strokeWidth > 0 && layer.strokeStyle !== 'none'
                        ? `${layer.strokeWidth}px ${
                            layer.strokeStyle === 'dashed-wide' || layer.strokeStyle === 'dashed'
                              ? 'dashed'
                              : layer.strokeStyle === 'dotted'
                              ? 'dotted'
                              : 'solid'
                          } ${layer.stroke || '#7c3aed'}`
                        : undefined
                      : undefined,
                }}
              >
                {layer.type === 'image' && layer.src && (
                  croppingId === layer.id && cropDraft ? (() => {
                    const { imgLeft, imgTop, baseImgW, baseImgH } = getCropImageLayout(layer, cropDraft);
                    return (
                      <div
                        className="w-full h-full relative select-none overflow-visible"
                        data-crop-frame="true"
                      >
                        {/* 1. Base Dimmed Image Background - full image extending outside the frame */}
                        <div
                          className="absolute select-none pointer-events-auto cursor-grab active:cursor-grabbing shadow-2xl rounded-sm overflow-hidden"
                          style={{
                            left: `${imgLeft}%`,
                            top: `${imgTop}%`,
                            width: `${baseImgW}%`,
                            height: `${baseImgH}%`,
                          }}
                          onPointerDown={(e) => handleCropPointerDown(e, layer)}
                          onPointerMove={handleCropPointerMove}
                          onPointerUp={handleCropPointerUp}
                          onPointerCancel={handleCropPointerUp}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <img
                            src={layer.originalSrc || layer.src}
                            alt="Full element"
                            className="w-full h-full object-fill opacity-35 filter brightness-75 pointer-events-none select-none"
                            style={{ transform: getLayerFlipTransform(layer) }}
                          />
                          <div className="absolute inset-0 bg-slate-900/40 pointer-events-none" />
                        </div>

                        {/* 2. Fixed Frame Viewport (stationary on canvas) with Bright Image inside */}
                        <div
                          className="absolute inset-0 overflow-hidden select-none pointer-events-auto cursor-grab active:cursor-grabbing border-2 border-purple-500 shadow-2xl z-20"
                          onPointerDown={(e) => handleCropPointerDown(e, layer)}
                          onPointerMove={handleCropPointerMove}
                          onPointerUp={handleCropPointerUp}
                          onPointerCancel={handleCropPointerUp}
                          onDoubleClick={(e) => {
                            e.stopPropagation();
                            applyCrop();
                          }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          {/* Crisp Clear Image inside the stationary frame */}
                          <div
                            className="absolute pointer-events-none select-none"
                            style={{
                              left: `${imgLeft}%`,
                              top: `${imgTop}%`,
                              width: `${baseImgW}%`,
                              height: `${baseImgH}%`,
                            }}
                          >
                            <img
                              src={layer.originalSrc || layer.src}
                              alt="Crop preview"
                              className="w-full h-full object-fill pointer-events-none select-none"
                              style={{ transform: getLayerFlipTransform(layer) }}
                            />
                          </div>

                          {/* 3x3 Rule-of-Thirds Grid Lines on the stationary frame */}
                          <div className="absolute inset-0 pointer-events-none grid grid-cols-3 grid-rows-3 z-10">
                            <div className="border-r border-b border-white/70 shadow-[0_0_1px_rgba(0,0,0,0.6)]" />
                            <div className="border-r border-b border-white/70 shadow-[0_0_1px_rgba(0,0,0,0.6)]" />
                            <div className="border-b border-white/70 shadow-[0_0_1px_rgba(0,0,0,0.6)]" />
                            <div className="border-r border-b border-white/70 shadow-[0_0_1px_rgba(0,0,0,0.6)]" />
                            <div className="border-r border-b border-white/70 shadow-[0_0_1px_rgba(0,0,0,0.6)]" />
                            <div className="border-b border-white/70 shadow-[0_0_1px_rgba(0,0,0,0.6)]" />
                            <div className="border-r border-b border-white/70 shadow-[0_0_1px_rgba(0,0,0,0.6)]" />
                            <div className="border-r border-b border-white/70 shadow-[0_0_1px_rgba(0,0,0,0.6)]" />
                            <div />
                          </div>
                        </div>

                        {/* 4 Corner Round Handles on the Stationary Frame */}
                        <div className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-white border-2 border-purple-500 rounded-full z-30 shadow-md pointer-events-none" />
                        <div className="absolute top-0 right-0 translate-x-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-white border-2 border-purple-500 rounded-full z-30 shadow-md pointer-events-none" />
                        <div className="absolute bottom-0 left-0 -translate-x-1/2 translate-y-1/2 w-3.5 h-3.5 bg-white border-2 border-purple-500 rounded-full z-30 shadow-md pointer-events-none" />
                        <div className="absolute bottom-0 right-0 translate-x-1/2 translate-y-1/2 w-3.5 h-3.5 bg-white border-2 border-purple-500 rounded-full z-30 shadow-md pointer-events-none" />

                        {/* 4 Edge Pill Handles on the Stationary Frame */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-1.5 bg-white border-2 border-purple-500 rounded-full z-30 shadow-sm pointer-events-none" />
                        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-4 h-1.5 bg-white border-2 border-purple-500 rounded-full z-30 shadow-sm pointer-events-none" />
                        <div className="absolute top-1/2 left-0 -translate-x-1/2 -translate-y-1/2 w-1.5 h-4 bg-white border-2 border-purple-500 rounded-full z-30 shadow-sm pointer-events-none" />
                        <div className="absolute top-1/2 right-0 translate-x-1/2 -translate-y-1/2 w-1.5 h-4 bg-white border-2 border-purple-500 rounded-full z-30 shadow-sm pointer-events-none" />

                        {/* Floating Quick Action Bar */}
                        <div
                          className="absolute z-40 flex items-center gap-1.5 bg-slate-900/90 backdrop-blur-md text-white px-2.5 py-1 rounded-full shadow-2xl border border-slate-700/60 pointer-events-auto select-none"
                          style={{
                            left: '50%',
                            top: 'calc(100% + 10px)',
                            transform: 'translateX(-50%)',
                          }}
                          onClick={(e) => e.stopPropagation()}
                          onPointerDown={(e) => e.stopPropagation()}
                        >
                          <button
                            type="button"
                            onClick={applyCrop}
                            className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-purple-600 hover:bg-purple-500 text-[11px] font-semibold text-white transition-colors cursor-pointer shadow"
                            title="Apply crop (Enter)"
                          >
                            <Check className="w-3 h-3" />
                            <span>Done</span>
                          </button>
                          <button
                            type="button"
                            onClick={resetCrop}
                            className="px-2 py-0.5 rounded-full hover:bg-slate-800 text-[11px] font-medium text-slate-300 hover:text-white transition-colors cursor-pointer"
                            title="Reset crop to full image"
                          >
                            Reset
                          </button>
                          <button
                            type="button"
                            onClick={cancelCrop}
                            className="p-1 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
                            title="Cancel (Esc)"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    );
                  })() : (
                    <div className="w-full h-full overflow-hidden relative" style={{ borderRadius: `${layer.radius || 0}px` }}>
                      <img
                        src={layer.src}
                        alt="Design element"
                        className="w-full h-full pointer-events-none"
                        style={{
                          objectFit: 'cover',
                          borderRadius: `${layer.radius || 0}px`,
                          transform: getLayerFlipTransform(layer),
                        }}
                      />
                    </div>
                  )
                )}
                {layer.type === 'shape' && layer.shapeType === 'circle' && (
                  <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible pointer-events-none" preserveAspectRatio="none">
                    <circle
                      cx="50"
                      cy="50"
                      r="50"
                      fill={layer.fill || '#9333ea'}
                      stroke={
                        layer.strokeWidth && layer.strokeWidth > 0 && layer.strokeStyle !== 'none'
                          ? layer.stroke || '#7c3aed'
                          : undefined
                      }
                      strokeWidth={layer.strokeWidth ? layer.strokeWidth * (100 / Math.max(20, layer.width * 8)) : 0}
                      strokeDasharray={
                        layer.strokeStyle === 'dashed-wide'
                          ? '8,6'
                          : layer.strokeStyle === 'dashed'
                          ? '4,4'
                          : layer.strokeStyle === 'dotted'
                          ? '2,2'
                          : undefined
                      }
                    />
                  </svg>
                )}
                {layer.type === 'shape' && layer.shapeType === 'triangle' && (
                  <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible pointer-events-none" preserveAspectRatio="none">
                    <polygon
                      points="50,0 100,100 0,100"
                      fill={layer.fill || '#9333ea'}
                      stroke={
                        layer.strokeWidth && layer.strokeWidth > 0 && layer.strokeStyle !== 'none'
                          ? layer.stroke || '#7c3aed'
                          : undefined
                      }
                      strokeWidth={layer.strokeWidth ? layer.strokeWidth * (100 / Math.max(20, layer.width * 8)) : 0}
                      strokeLinejoin="round"
                      strokeDasharray={
                        layer.strokeStyle === 'dashed-wide'
                          ? '8,6'
                          : layer.strokeStyle === 'dashed'
                          ? '4,4'
                          : layer.strokeStyle === 'dotted'
                          ? '2,2'
                          : undefined
                      }
                    />
                  </svg>
                )}
                {layer.type === 'shape' && layer.shapeType === 'star' && (
                  <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible pointer-events-none" preserveAspectRatio="none">
                    <polygon
                      points="50,0 61.8,35.3 100,38.2 69.1,57.3 80.9,100 50,70.0 19.1,100 30.9,57.3 0,38.2 38.2,35.3"
                      fill={layer.fill || '#9333ea'}
                      stroke={
                        layer.strokeWidth && layer.strokeWidth > 0 && layer.strokeStyle !== 'none'
                          ? layer.stroke || '#7c3aed'
                          : undefined
                      }
                      strokeWidth={layer.strokeWidth ? layer.strokeWidth * (100 / Math.max(20, layer.width * 8)) : 0}
                      strokeLinejoin="round"
                      strokeDasharray={
                        layer.strokeStyle === 'dashed-wide'
                          ? '8,6'
                          : layer.strokeStyle === 'dashed'
                          ? '4,4'
                          : layer.strokeStyle === 'dotted'
                          ? '2,2'
                          : undefined
                      }
                    />
                  </svg>
                )}
                {layer.type === 'text' && (
                  <TextLayerSpan
                    layer={layer}
                    isEditing={editingId === layer.id}
                    onUpdateText={(text) => updateSelected({ text }, false)}
                    onBlur={() => {
                      if (textEditStartSnapshotRef.current) {
                        const startSnap = textEditStartSnapshotRef.current;
                        textEditStartSnapshotRef.current = null;
                        if (JSON.stringify(startSnap) !== JSON.stringify(layers)) {
                          setPast((prev) => [...prev.slice(-30), startSnap]);
                          setFuture([]);
                        }
                      }
                      setEditingId(null);
                    }}
                  />
                )}
              </div>
            )
          )}

          {/* Dedicated Selection Overlay: for single selection (z-50) */}
          {selectedIds.length === 1 && selectedLayer && croppingId !== selectedLayer.id && (() => {
            const isUniformShape =
              selectedLayer.type === 'shape' &&
              (selectedLayer.shapeType === 'circle' || selectedLayer.shapeType === 'triangle' || selectedLayer.shapeType === 'star');

            return (
              <div
                className="absolute pointer-events-none mockup-popover-exclude z-50"
                style={{
                  left: `${selectedLayer.x}%`,
                  top: `${selectedLayer.y}%`,
                  width: `${selectedLayer.width}%`,
                  height: selectedLayer.type === 'text' ? 'auto' : `${selectedLayer.height}%`,
                  transform: selectedLayer.rotation ? `rotate(${selectedLayer.rotation}deg)` : undefined,
                  transformOrigin: 'center center',
                }}
              >
                {/* Mirror text placeholder so overlay height matches 1:1 for text */}
                {selectedLayer.type === 'text' && (
                  <div
                    className="opacity-0 pointer-events-none select-none"
                    style={{
                      fontFamily: selectedLayer.fontFamily,
                      fontSize: `${selectedLayer.fontSize || 34}px`,
                      fontWeight: selectedLayer.bold ? 'bold' : 'normal',
                      fontStyle: selectedLayer.italic ? 'italic' : 'normal',
                      textDecoration: selectedLayer.underline ? 'underline' : 'none',
                      textAlign: selectedLayer.align || 'left',
                      padding: '6px 8px',
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word',
                      lineHeight: 1.15,
                    }}
                  >
                    {selectedLayer.text || ' '}
                  </div>
                )}

                {/* Selection border with ZERO gap */}
                <div
                  className="absolute inset-0 border-2 border-fuchsia-500 pointer-events-none"
                  style={{
                    borderRadius:
                      selectedLayer.type === 'shape' && (!selectedLayer.shapeType || selectedLayer.shapeType === 'rectangle')
                        ? `${selectedLayer.radius || 0}px`
                        : selectedLayer.type === 'text'
                        ? '4px'
                        : '0px',
                  }}
                />

                {/* 4 Corner circles centered on the corners and above the line */}
                <div
                  onPointerDown={(event) => resizeStart(event, selectedLayer, 'nw')}
                  className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-white border-2 border-fuchsia-500 rounded-full cursor-nwse-resize pointer-events-auto z-50 shadow-sm hover:scale-125 transition-transform"
                  title={selectedLayer.type === 'text' ? 'Drag corner to scale font size' : 'Resize'}
                />
                <div
                  onPointerDown={(event) => resizeStart(event, selectedLayer, 'ne')}
                  className="absolute top-0 right-0 translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-white border-2 border-fuchsia-500 rounded-full cursor-nesw-resize pointer-events-auto z-50 shadow-sm hover:scale-125 transition-transform"
                  title={selectedLayer.type === 'text' ? 'Drag corner to scale font size' : 'Resize'}
                />
                <div
                  onPointerDown={(event) => resizeStart(event, selectedLayer, 'sw')}
                  className="absolute bottom-0 left-0 -translate-x-1/2 translate-y-1/2 w-3 h-3 bg-white border-2 border-fuchsia-500 rounded-full cursor-nesw-resize pointer-events-auto z-50 shadow-sm hover:scale-125 transition-transform"
                  title={selectedLayer.type === 'text' ? 'Drag corner to scale font size' : 'Resize'}
                />
                <div
                  onPointerDown={(event) => resizeStart(event, selectedLayer, 'se')}
                  className="absolute bottom-0 right-0 translate-x-1/2 translate-y-1/2 w-3 h-3 bg-white border-2 border-fuchsia-500 rounded-full cursor-nwse-resize pointer-events-auto z-50 shadow-sm hover:scale-125 transition-transform"
                  title={selectedLayer.type === 'text' ? 'Drag corner to scale font size' : 'Resize'}
                />

                {/* Left Side Pill Handle */}
                <div
                  onPointerDown={(event) => resizeStart(event, selectedLayer, 'w')}
                  onDoubleClick={(event) => {
                    event.stopPropagation();
                    autoFitTextWidth(selectedLayer, 'w');
                  }}
                  className="group/handle-w absolute top-1/2 left-0 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center cursor-ew-resize pointer-events-auto p-1 z-50 select-none"
                  title={selectedLayer.type === 'text' ? 'Drag to resize width, double-click to auto-fit text' : isUniformShape ? 'Resize' : 'Drag to decrease/increase width'}
                >
                  <div className="w-1.5 h-3.5 bg-white border-2 border-fuchsia-500 rounded-full shadow-sm transition-all group-hover/handle-w:hidden" />
                  <div className="hidden group-hover/handle-w:flex items-center justify-center w-5 h-5 bg-white border-2 border-fuchsia-500 rounded-full shadow-md text-fuchsia-600">
                    <MoveHorizontal className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                </div>

                {/* Right Side Pill Handle */}
                <div
                  onPointerDown={(event) => resizeStart(event, selectedLayer, 'e')}
                  onDoubleClick={(event) => {
                    event.stopPropagation();
                    autoFitTextWidth(selectedLayer, 'e');
                  }}
                  className="group/handle-e absolute top-1/2 right-0 translate-x-1/2 -translate-y-1/2 flex items-center justify-center cursor-ew-resize pointer-events-auto p-1 z-50 select-none"
                  title={selectedLayer.type === 'text' ? 'Drag to resize width, double-click to auto-fit text' : isUniformShape ? 'Resize' : 'Drag to decrease/increase width'}
                >
                  <div className="w-1.5 h-3.5 bg-white border-2 border-fuchsia-500 rounded-full shadow-sm transition-all group-hover/handle-e:hidden" />
                  <div className="hidden group-hover/handle-e:flex items-center justify-center w-5 h-5 bg-white border-2 border-fuchsia-500 rounded-full shadow-md text-fuchsia-600">
                    <MoveHorizontal className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                </div>

                {/* Top and Bottom Pill Handles (for all shapes and images) */}
                {selectedLayer.type !== 'text' && (
                  <>
                    <div
                      onPointerDown={(event) => resizeStart(event, selectedLayer, 'n')}
                      className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3.5 h-1.5 bg-white border-2 border-fuchsia-500 rounded-full cursor-ns-resize pointer-events-auto z-50 shadow-sm"
                      title={isUniformShape ? 'Resize' : 'Resize height'}
                    />
                    <div
                      onPointerDown={(event) => resizeStart(event, selectedLayer, 's')}
                      className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-3.5 h-1.5 bg-white border-2 border-fuchsia-500 rounded-full cursor-ns-resize pointer-events-auto z-50 shadow-sm"
                      title={isUniformShape ? 'Resize' : 'Resize height'}
                    />
                  </>
                )}

                {/* Rotate handle: stem line + circular button with Rotate icon */}
                <div
                  className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-auto select-none z-50 cursor-grab active:cursor-grabbing"
                  style={{ top: 'calc(100% + 6px)' }}
                  onPointerDown={(event) => rotateStart(event, selectedLayer)}
                  title="Drag to rotate (Hold Shift for 15° steps)"
                >
                  <div className="w-0.5 h-3 bg-fuchsia-500" />
                  <div className="w-5 h-5 rounded-full bg-white border-2 border-fuchsia-500 shadow-md flex items-center justify-center text-fuchsia-600 hover:scale-110 hover:bg-fuchsia-50 transition-transform">
                    <RotateCw className="w-3 h-3 stroke-[2.5]" />
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Multi-Selection Overlay (matching user screenshot): active when selectedIds.length > 1 */}
          {selectedIds.length > 1 && (() => {
            const selectedLayers = layers.filter((l) => selectedIds.includes(l.id));
            if (selectedLayers.length === 0) return null;

            const canvasRect = canvasRef.current?.getBoundingClientRect();
            const layerBoxes = selectedLayers.map((l) => {
              if (canvasRect && canvasRef.current) {
                const el = canvasRef.current.querySelector(`[data-layer-id="${l.id}"]`);
                if (el) {
                  const r = el.getBoundingClientRect();
                  return {
                    id: l.id,
                    type: l.type,
                    x: ((r.left - canvasRect.left) / canvasRect.width) * 100,
                    y: ((r.top - canvasRect.top) / canvasRect.height) * 100,
                    width: (r.width / canvasRect.width) * 100,
                    height: (r.height / canvasRect.height) * 100,
                  };
                }
              }
              return {
                id: l.id,
                type: l.type,
                x: l.x,
                y: l.y,
                width: l.width,
                height: l.height,
              };
            });

            const groupMinX = Math.min(...layerBoxes.map((b) => b.x));
            const groupMinY = Math.min(...layerBoxes.map((b) => b.y));
            const groupMaxX = Math.max(...layerBoxes.map((b) => b.x + b.width));
            const groupMaxY = Math.max(...layerBoxes.map((b) => b.y + b.height));
            const groupWidth = groupMaxX - groupMinX;
            const groupHeight = groupMaxY - groupMinY;

            return (
              <div className="absolute inset-0 pointer-events-none mockup-popover-exclude z-50">
                {/* 1. Individual Solid Purple Borders and Center Move Icon for each element */}
                {layerBoxes.map((b) => {
                  const origLayer = selectedLayers.find((l) => l.id === b.id);
                  const isRect = origLayer?.type === 'shape' && (!origLayer.shapeType || origLayer.shapeType === 'rectangle');
                  const radius = isRect ? `${origLayer?.radius || 0}px` : origLayer?.type === 'text' ? '2px' : '0px';

                  return (
                    <div
                      key={`multi-box-${b.id}`}
                      className="absolute pointer-events-none"
                      style={{
                        left: `${b.x}%`,
                        top: `${b.y}%`,
                        width: `${b.width}%`,
                        height: `${b.height}%`,
                        border: '1.5px solid #8b5cf6',
                        borderRadius: radius,
                      }}
                    >
                      {/* Center 4-way Move Crosshair Badge */}
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4.5 h-4.5 bg-white/95 shadow-sm border border-slate-300 rounded-full flex items-center justify-center pointer-events-none">
                        <Move className="w-2.5 h-2.5 text-slate-700" />
                      </div>
                    </div>
                  );
                })}

                {/* 2. Outer Dashed Bounding Box Wrapping All Selected Elements */}
                <div
                  className="absolute pointer-events-none"
                  style={{
                    left: `${groupMinX}%`,
                    top: `${groupMinY}%`,
                    width: `${groupWidth}%`,
                    height: `${groupHeight}%`,
                    border: '1.5px dashed #cbd5e1',
                  }}
                >
                  {/* 4 Corner White Circles with subtle slate border */}
                  <div
                    onPointerDown={(e) => multiResizeStart(e, 'nw')}
                    className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-white border-2 border-slate-400 rounded-full shadow-xs cursor-nwse-resize pointer-events-auto hover:scale-125 transition-transform"
                    title="Resize group"
                  />
                  <div
                    onPointerDown={(e) => multiResizeStart(e, 'ne')}
                    className="absolute top-0 right-0 translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-white border-2 border-slate-400 rounded-full shadow-xs cursor-nesw-resize pointer-events-auto hover:scale-125 transition-transform"
                    title="Resize group"
                  />
                  <div
                    onPointerDown={(e) => multiResizeStart(e, 'sw')}
                    className="absolute bottom-0 left-0 -translate-x-1/2 translate-y-1/2 w-3 h-3 bg-white border-2 border-slate-400 rounded-full shadow-xs cursor-nesw-resize pointer-events-auto hover:scale-125 transition-transform"
                    title="Resize group"
                  />
                  <div
                    onPointerDown={(e) => multiResizeStart(e, 'se')}
                    className="absolute bottom-0 right-0 translate-x-1/2 translate-y-1/2 w-3 h-3 bg-white border-2 border-slate-400 rounded-full shadow-xs cursor-nwse-resize pointer-events-auto hover:scale-125 transition-transform"
                    title="Resize group"
                  />

                  {/* 2 Side Vertical Pill Handles (Left & Right) */}
                  <div
                    onPointerDown={(e) => multiResizeStart(e, 'w')}
                    className="group/handle-mw absolute top-1/2 left-0 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center cursor-ew-resize pointer-events-auto p-1.5 z-50 select-none"
                    title="Drag to decrease/increase width"
                  >
                    <div className="w-1.5 h-4 bg-white border-2 border-slate-400 rounded-full shadow-xs transition-all group-hover/handle-mw:hidden" />
                    <div className="hidden group-hover/handle-mw:flex items-center justify-center w-5 h-5 bg-white border-2 border-fuchsia-500 rounded-full shadow-md text-fuchsia-600">
                      <MoveHorizontal className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  </div>
                  <div
                    onPointerDown={(e) => multiResizeStart(e, 'e')}
                    className="group/handle-me absolute top-1/2 right-0 translate-x-1/2 -translate-y-1/2 flex items-center justify-center cursor-ew-resize pointer-events-auto p-1.5 z-50 select-none"
                    title="Drag to decrease/increase width"
                  >
                    <div className="w-1.5 h-4 bg-white border-2 border-slate-400 rounded-full shadow-xs transition-all group-hover/handle-me:hidden" />
                    <div className="hidden group-hover/handle-me:flex items-center justify-center w-5 h-5 bg-white border-2 border-fuchsia-500 rounded-full shadow-md text-fuchsia-600">
                      <MoveHorizontal className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Marquee Rubberband Selection Box */}
          {marqueeBox && (() => {
            const minX = Math.min(marqueeBox.startX, marqueeBox.currentX);
            const maxX = Math.max(marqueeBox.startX, marqueeBox.currentX);
            const minY = Math.min(marqueeBox.startY, marqueeBox.currentY);
            const maxY = Math.max(marqueeBox.startY, marqueeBox.currentY);
            return (
              <div
                className="absolute pointer-events-none z-55 bg-fuchsia-500/15 border border-fuchsia-500 rounded-xs shadow-xs"
                style={{
                  left: `${minX}%`,
                  top: `${minY}%`,
                  width: `${maxX - minX}%`,
                  height: `${maxY - minY}%`,
                }}
              />
            );
          })()}

          {/* Shift-drag Angle indicator badge */}
          {dragAngleInfo && (
            <div
              className="absolute pointer-events-none z-60 -translate-x-1/2 -translate-y-9 px-2 py-0.5 rounded-md bg-slate-900/90 text-white text-[11px] font-bold shadow-md border border-white/20 select-none"
              style={{ left: `${dragAngleInfo.x}px`, top: `${dragAngleInfo.y}px` }}
            >
              <span>{dragAngleInfo.label}</span>
            </div>
          )}

          {/* Smart Alignment Guides (Canva-style thin dotted magenta lines for center, edges, corners) */}
          {activeGuides.length > 0 && (
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none z-40 mockup-popover-exclude overflow-visible"
              style={{ width: '100%', height: '100%' }}
            >
              {activeGuides.map((guide, idx) => {
                if (guide.type === 'vertical') {
                  return (
                    <line
                      key={`guide-v-${idx}-${guide.position}`}
                      x1={`${guide.position}%`}
                      y1="0%"
                      x2={`${guide.position}%`}
                      y2="100%"
                      stroke="#e01cd5"
                      strokeWidth="1"
                      strokeDasharray="3 3"
                    />
                  );
                }
                return (
                  <line
                    key={`guide-h-${idx}-${guide.position}`}
                    x1="0%"
                    y1={`${guide.position}%`}
                    x2="100%"
                    y2={`${guide.position}%`}
                    stroke="#e01cd5"
                    strokeWidth="1"
                    strokeDasharray="3 3"
                  />
                );
              })}
            </svg>
          )}
          {!layers.length && (
            <div className="absolute inset-0 grid place-items-center text-center text-xs text-slate-500 dark:text-slate-400 pointer-events-none">
              Drag an image here, or add text with the toolbar
            </div>
          )}
        </div>

        {imageUrl && (
          <div className="flex items-center justify-end px-1 text-[10px] text-slate-400">
            <button
              type="button"
              onClick={() => setHideSourceImage((value) => !value)}
              className="flex items-center gap-1 font-semibold hover:text-orange-500 cursor-pointer"
            >
              {hideSourceImage ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
              {hideSourceImage ? 'Show source' : 'Hide source'}
            </button>
          </div>
        )}

        {positionPortalTarget && createPortal(renderPositionControl(), positionPortalTarget)}
      </div>
    );
  }
);

CustomDesignEditor.displayName = 'CustomDesignEditor';
export default CustomDesignEditor;
