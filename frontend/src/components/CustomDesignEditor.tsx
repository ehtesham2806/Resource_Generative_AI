import { forwardRef, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  Check,
  ChevronDown,
  Circle,
  Crop,
  Eye,
  EyeOff,
  FlipHorizontal,
  Italic,
  List,
  MoveHorizontal,
  Plus,
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

type DesignLayer = {
  id: string;
  type: LayerType;
  shapeType?: ShapeType;
  x: number;
  y: number;
  width: number;
  height: number;
  text?: string;
  fontFamily?: string;
  fontSize?: number;
  color?: string;
  radius?: number;
  fill?: string;
  src?: string;
  stroke?: string;
  strokeWidth?: number;
  strokeStyle?: StrokeStyleType;
  flip?: boolean;
  crop?: boolean;
  opacity?: number;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  uppercase?: boolean;
  align?: TextAlign;
  list?: boolean;
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
      className={`block w-full whitespace-pre-wrap break-words leading-tight outline-none ${
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
      }}
    />
  );
};

const CustomDesignEditor = forwardRef<HTMLDivElement, CustomDesignEditorProps>(
  ({ imageUrl, backgroundColor, backgroundImage, outputWidth, outputHeight, isLoading, toolbarSlot }, ref) => {
    const [layers, setLayers] = useState<DesignLayer[]>(() => (imageUrl ? [sourceLayer(imageUrl)] : []));
    const [selectedId, setSelectedId] = useState<string | null>(imageUrl ? 'source-image' : null);
    const [hideSourceImage, setHideSourceImage] = useState(false);
    const [availableFonts, setAvailableFonts] = useState<string[]>(DEFAULT_SYSTEM_AND_WEB_FONTS);
    const [isFontOpen, setIsFontOpen] = useState(false);
    const [fontSearch, setFontSearch] = useState('');
    const [hasScannedSystemFonts, setHasScannedSystemFonts] = useState(false);
    const [isOpacityOpen, setIsOpacityOpen] = useState(false);
    const [isStrokeOpen, setIsStrokeOpen] = useState(false);
    const [isRadiusOpen, setIsRadiusOpen] = useState(false);
    const [isShapeMenuOpen, setIsShapeMenuOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [past, setPast] = useState<DesignLayer[][]>([]);
    const [future, setFuture] = useState<DesignLayer[][]>([]);
    const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(() =>
      typeof document !== 'undefined' ? document.getElementById('custom-design-toolbar-slot') : null
    );

    const fontMenuRef = useRef<HTMLDivElement>(null);
    const shapeMenuRef = useRef<HTMLDivElement>(null);
    const opacityMenuRef = useRef<HTMLDivElement>(null);
    const strokeMenuRef = useRef<HTMLDivElement>(null);
    const radiusMenuRef = useRef<HTMLDivElement>(null);
    const dragRef = useRef<{ id: string; offsetX: number; offsetY: number } | null>(null);
    const dragStartSnapshotRef = useRef<DesignLayer[] | null>(null);
    const textEditStartSnapshotRef = useRef<DesignLayer[] | null>(null);
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
    } | null>(null);

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

    const deleteSelected = () => {
      if (!selectedId) return;
      pushHistory(layers);
      setLayers((current) => current.filter((layer) => layer.id !== selectedId));
      setSelectedId(null);
      setEditingId(null);
    };

    // Sync portal target with slot or DOM element
    useEffect(() => {
      const target = toolbarSlot || document.getElementById('custom-design-toolbar-slot');
      if (target) {
        setPortalTarget(target);
      }
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
      };

      if (isFontOpen || isOpacityOpen || isStrokeOpen || isRadiusOpen || isShapeMenuOpen) {
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
      }
    }, [isFontOpen, isOpacityOpen, isStrokeOpen, isRadiusOpen, isShapeMenuOpen]);

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

    const addShape = (shapeType: ShapeType = 'rectangle') => {
      pushHistory(layers);
      const id = `shape-${shapeType}-${Date.now()}`;
      const isSquareShape = shapeType === 'circle' || shapeType === 'triangle' || shapeType === 'star';
      // On 1200 x 800 (1.5 ratio), 24% width = 288px, 36% height = 288px! Perfectly 1:1 square!
      const width = isSquareShape ? 24 : 32;
      const height = isSquareShape ? 36 : 24;

      const layer: DesignLayer = {
        id,
        type: 'shape',
        shapeType,
        x: 20,
        y: 24,
        width,
        height,
        fill: '#f97316',
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
              width: 68,
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
      event.stopPropagation();
      const canvas = (event.currentTarget as HTMLElement).parentElement?.getBoundingClientRect();
      if (!canvas) return;
      dragStartSnapshotRef.current = layers;
      dragRef.current = {
        id: layer.id,
        offsetX: event.clientX - (canvas.left + (layer.x / 100) * canvas.width),
        offsetY: event.clientY - (canvas.top + (layer.y / 100) * canvas.height),
      };
      setSelectedId(layer.id);
      (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
    };

    const resizeStart = (event: React.PointerEvent, layer: DesignLayer, corner: string) => {
      event.stopPropagation();
      const canvas = (event.currentTarget as HTMLElement).parentElement?.parentElement?.getBoundingClientRect();
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

    const pointerMove = (event: React.PointerEvent) => {
      const canvas = event.currentTarget.getBoundingClientRect();
      if (dragRef.current) {
        const drag = dragRef.current;
        setLayers((current) =>
          current.map((layer) =>
            layer.id === drag.id
              ? {
                  ...layer,
                  x: Math.max(0, Math.min(100 - layer.width, ((event.clientX - canvas.left - drag.offsetX) / canvas.width) * 100)),
                  y: Math.max(0, Math.min(100 - layer.height, ((event.clientY - canvas.top - drag.offsetY) / canvas.height) * 100)),
                }
              : layer
          )
        );
      }
      if (resizeRef.current) {
        const resize = resizeRef.current;
        const deltaX = ((event.clientX - resize.startX) / canvas.width) * 100;
        const deltaY = ((event.clientY - resize.startY) / canvas.height) * 100;

        // 1) Text layer corner drag: scales font size based on dragging towards / opposite to text
        if (resize.isText && ['nw', 'ne', 'sw', 'se'].includes(resize.corner)) {
          const pixelDeltaX = event.clientX - resize.startX;
          const pixelDeltaY = event.clientY - resize.startY;

          let delta = 0;
          if (resize.corner === 'se') {
            // Dragging away/opposite to text (down & right): increases font size
            // Dragging towards text (up & left): decreases font size
            delta = (pixelDeltaX + pixelDeltaY) / 2;
          } else if (resize.corner === 'nw') {
            // Dragging away/opposite to text (up & left): increases font size
            // Dragging towards text (down & right): decreases font size
            delta = (-pixelDeltaX - pixelDeltaY) / 2;
          } else if (resize.corner === 'ne') {
            // Dragging away/opposite to text (up & right): increases font size
            // Dragging towards text (down & left): decreases font size
            delta = (pixelDeltaX - pixelDeltaY) / 2;
          } else if (resize.corner === 'sw') {
            // Dragging away/opposite to text (down & left): increases font size
            // Dragging towards text (up & right): decreases font size
            delta = (-pixelDeltaX + pixelDeltaY) / 2;
          }

          // Sensitivity: ~140px drag doubles font size
          const scale = Math.max(0.15, 1 + delta / 140);
          const startFont = resize.startFontSize || 34;
          const nextFontSize = Math.round(Math.max(8, Math.min(160, startFont * scale)));
          const actualScale = nextFontSize / startFont;
          const nextWidth = Math.max(8, Math.min(95, (resize.startWidth || 30) * actualScale));

          let nextX = resize.x;
          if (resize.corner.includes('w')) {
            nextX = Math.max(0, resize.x + resize.width - nextWidth);
          }

          setLayers((current) =>
            current.map((layer) => {
              if (layer.id !== resize.id) return layer;
              return {
                ...layer,
                x: nextX,
                width: Math.min(100 - nextX, nextWidth),
                fontSize: nextFontSize,
              };
            })
          );
          return;
        }

        // 2) Circle, Star, Triangle uniform scaling (aspect ratio locked, only size changes)
        if (resize.isUniformShape && ['nw', 'ne', 'sw', 'se'].includes(resize.corner)) {
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

          const scale = Math.max(0.15, 1 + delta / 140);
          const nextWidth = Math.max(4, Math.min(95, resize.width * scale));
          const nextHeight = Math.max(4, Math.min(95, resize.height * scale));

          let nextX = resize.x;
          let nextY = resize.y;
          if (resize.corner.includes('w')) {
            nextX = Math.max(0, resize.x + resize.width - nextWidth);
          }
          if (resize.corner.includes('n')) {
            nextY = Math.max(0, resize.y + resize.height - nextHeight);
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
          return;
        }

        // 3) Left/right handles (w/e) for text/rectangle width or general resize for images/rectangle shapes
        const fromWest = resize.corner.includes('w');
        const fromNorth = resize.corner.includes('n');
        const changesWidth = !resize.isUniformShape && (resize.corner.includes('w') || resize.corner.includes('e'));
        const changesHeight = !resize.isText && !resize.isUniformShape && (resize.corner.includes('n') || resize.corner.includes('s'));

        setLayers((current) =>
          current.map((layer) => {
            if (layer.id !== resize.id) return layer;
            const right = resize.x + resize.width;
            const bottom = resize.y + resize.height;
            const nextX = fromWest ? Math.max(0, Math.min(right - 8, resize.x + deltaX)) : resize.x;
            const nextY = fromNorth ? Math.max(0, Math.min(bottom - 8, resize.y + deltaY)) : resize.y;
            const nextWidth = fromWest
              ? right - nextX
              : changesWidth
              ? Math.max(8, Math.min(100 - resize.x, resize.width + deltaX))
              : resize.width;
            const nextHeight = fromNorth
              ? bottom - nextY
              : changesHeight
              ? Math.max(8, Math.min(100 - resize.y, resize.height + deltaY))
              : resize.height;
            return {
              ...layer,
              x: nextX,
              y: resize.isText ? layer.y : nextY,
              width: nextWidth,
              height: resize.isText ? layer.height : nextHeight,
            };
          })
        );
      }
    };

    const stopPointer = () => {
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
    };

    // Keyboard shortcuts: Delete, Ctrl+Z (Undo), Ctrl+Y / Ctrl+Shift+Z (Redo)
    useEffect(() => {
      const handleKeyDown = (event: KeyboardEvent) => {
        const activeEl = document.activeElement;
        const isInputFocused =
          activeEl instanceof HTMLInputElement ||
          activeEl instanceof HTMLTextAreaElement ||
          (activeEl instanceof HTMLElement && activeEl.isContentEditable);

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
          if (!isInputFocused && editingId === null && selectedId) {
            event.preventDefault();
            deleteSelected();
            return;
          }
        }
      };

      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selectedId, editingId, layers, past, future]);

    const iconButton = 'custom-tool-button h-8 min-w-8 px-2 cursor-pointer select-none';
    const toggleClass = (active = false) =>
      `${iconButton} ${active ? 'bg-orange-100 text-orange-600 dark:bg-orange-500/25 dark:text-orange-300 font-bold' : ''}`;

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
              onClick={() => updateSelected({ crop: !selectedLayer.crop })}
              className={`${toggleClass(selectedLayer.crop)} gap-1.5`}
              title="Crop image"
            >
              <Crop className="w-4 h-4" />
              <span className="text-xs font-semibold">Crop</span>
            </button>
            <button
              type="button"
              onClick={() => updateSelected({ flip: !selectedLayer.flip })}
              className={`${toggleClass(selectedLayer.flip)} gap-1.5`}
              title="Flip image"
            >
              <FlipHorizontal className="w-4 h-4" />
              <span className="text-xs font-semibold">Flip</span>
            </button>
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
          ref={ref}
          className="relative w-full overflow-hidden border border-slate-300 dark:border-slate-700 shadow-2xl"
          style={{
            aspectRatio: `${outputWidth} / ${outputHeight}`,
            backgroundColor: backgroundColor === 'transparent' ? undefined : backgroundColor,
            backgroundImage: backgroundImage ? `url(${backgroundImage})` : undefined,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
          onPointerMove={pointerMove}
          onPointerUp={stopPointer}
          onPointerLeave={stopPointer}
          onClick={() => {
            setSelectedId(null);
            setEditingId(null);
            setIsStrokeOpen(false);
            setIsRadiusOpen(false);
            setIsOpacityOpen(false);
          }}
          onDragOver={(event) => event.preventDefault()}
          onDrop={(event) => {
            event.preventDefault();
            readDroppedImage(event.dataTransfer.files[0]);
          }}
        >
          {backgroundColor === 'transparent' && !backgroundImage && (
            <div className="absolute inset-0 bg-grid-pattern opacity-50" />
          )}
          {isLoading && (
            <div className="absolute inset-0 z-20 grid place-items-center bg-black/20 text-xs text-white">
              Preparing image...
            </div>
          )}
          {layers.map((layer) =>
            layer.id === 'source-image' && hideSourceImage ? null : (
              <div
                key={layer.id}
                onPointerDown={(event) => {
                  if (editingId === layer.id) {
                    event.stopPropagation();
                    return;
                  }
                  pointerDown(event, layer);
                }}
                onClick={(event) => {
                  event.stopPropagation();
                  setSelectedId(layer.id);
                }}
                onDoubleClick={(event) => {
                  event.stopPropagation();
                  setSelectedId(layer.id);
                  if (layer.type === 'text') {
                    textEditStartSnapshotRef.current = layers;
                    setEditingId(layer.id);
                  }
                }}
                onContextMenu={(event) => event.preventDefault()}
                className={`absolute ${editingId === layer.id ? 'cursor-text select-text' : 'cursor-move select-none'} ${
                  selectedId === layer.id ? 'custom-selected-element' : ''
                }`}
                style={{
                  left: `${layer.x}%`,
                  top: `${layer.y}%`,
                  width: `${layer.width}%`,
                  height: layer.type === 'text' ? 'auto' : `${layer.height}%`,
                  opacity: (layer.opacity ?? 100) / 100,
                  borderRadius:
                    layer.type === 'shape' && layer.shapeType === 'circle'
                      ? '9999px'
                      : layer.type === 'shape' && (layer.shapeType === 'triangle' || layer.shapeType === 'star')
                      ? undefined
                      : `${layer.radius || 0}px`,
                  backgroundColor:
                    layer.type === 'shape' && (!layer.shapeType || layer.shapeType === 'rectangle' || layer.shapeType === 'circle')
                      ? layer.fill
                      : undefined,
                  border:
                    layer.type !== 'shape' || (!layer.shapeType || layer.shapeType === 'rectangle' || layer.shapeType === 'circle')
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
                  <div className="w-full h-full overflow-hidden" style={{ borderRadius: `${layer.radius || 0}px` }}>
                    <img
                      src={layer.src}
                      alt="Design element"
                      className="w-full h-full pointer-events-none"
                      style={{
                        objectFit: layer.crop ? 'cover' : 'contain',
                        borderRadius: `${layer.radius || 0}px`,
                        transform: layer.flip ? 'scaleX(-1)' : undefined,
                      }}
                    />
                  </div>
                )}
                {layer.type === 'shape' && layer.shapeType === 'triangle' && (
                  <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible pointer-events-none" preserveAspectRatio="none">
                    <polygon
                      points="50,4 96,96 4,96"
                      fill={layer.fill || '#f97316'}
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
                      points="50,3 64,36 99,36 71,58 82,92 50,71 18,92 29,58 1,36 36,36"
                      fill={layer.fill || '#f97316'}
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
                {selectedId === layer.id && (() => {
                  const isUniformShape =
                    layer.type === 'shape' &&
                    (layer.shapeType === 'circle' || layer.shapeType === 'triangle' || layer.shapeType === 'star');

                  return (
                    <div className="absolute inset-0 pointer-events-none mockup-popover-exclude z-20">
                      {/* Webinar-style selection border around elements with ZERO gap */}
                      <div
                        className="absolute inset-0 border-2 border-fuchsia-500 pointer-events-none"
                        style={{
                          borderRadius:
                            layer.type === 'shape' && layer.shapeType === 'circle'
                              ? '9999px'
                              : layer.type === 'shape'
                              ? `${layer.radius || 0}px`
                              : layer.type === 'text'
                              ? '4px'
                              : `${layer.radius || 0}px`,
                        }}
                      />

                      {/* 4 Corner circles centered on the corners and above the line */}
                      <div
                        onPointerDown={(event) => resizeStart(event, layer, 'nw')}
                        className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-white border-2 border-fuchsia-500 rounded-full cursor-nwse-resize pointer-events-auto z-30 shadow-sm hover:scale-125 transition-transform"
                        title={layer.type === 'text' ? 'Drag corner to scale font size' : isUniformShape ? 'Drag corner to scale size' : 'Resize'}
                      />
                      <div
                        onPointerDown={(event) => resizeStart(event, layer, 'ne')}
                        className="absolute top-0 right-0 translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-white border-2 border-fuchsia-500 rounded-full cursor-nesw-resize pointer-events-auto z-30 shadow-sm hover:scale-125 transition-transform"
                        title={layer.type === 'text' ? 'Drag corner to scale font size' : isUniformShape ? 'Drag corner to scale size' : 'Resize'}
                      />
                      <div
                        onPointerDown={(event) => resizeStart(event, layer, 'sw')}
                        className="absolute bottom-0 left-0 -translate-x-1/2 translate-y-1/2 w-3 h-3 bg-white border-2 border-fuchsia-500 rounded-full cursor-nesw-resize pointer-events-auto z-30 shadow-sm hover:scale-125 transition-transform"
                        title={layer.type === 'text' ? 'Drag corner to scale font size' : isUniformShape ? 'Drag corner to scale size' : 'Resize'}
                      />
                      <div
                        onPointerDown={(event) => resizeStart(event, layer, 'se')}
                        className="absolute bottom-0 right-0 translate-x-1/2 translate-y-1/2 w-3 h-3 bg-white border-2 border-fuchsia-500 rounded-full cursor-nwse-resize pointer-events-auto z-30 shadow-sm hover:scale-125 transition-transform"
                        title={layer.type === 'text' ? 'Drag corner to scale font size' : isUniformShape ? 'Drag corner to scale size' : 'Resize'}
                      />

                      {/* Left Side Pill Handle: ONLY for text or rectangle/image (NEVER for circle, star, triangle) */}
                      {!isUniformShape && (
                        <>
                          <div
                            onPointerDown={(event) => resizeStart(event, layer, 'w')}
                            className="group/handle-w absolute top-1/2 left-0 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center cursor-ew-resize pointer-events-auto p-1 z-30 select-none"
                            title="Drag to decrease/increase width"
                          >
                            <div className="w-1.5 h-3.5 bg-white border-2 border-fuchsia-500 rounded-full shadow-sm transition-all group-hover/handle-w:hidden" />
                            <div className="hidden group-hover/handle-w:flex items-center justify-center w-5 h-5 bg-white border-2 border-fuchsia-500 rounded-full shadow-md text-fuchsia-600">
                              <MoveHorizontal className="w-3.5 h-3.5 stroke-[3]" />
                            </div>
                          </div>

                          <div
                            onPointerDown={(event) => resizeStart(event, layer, 'e')}
                            className="group/handle-e absolute top-1/2 right-0 translate-x-1/2 -translate-y-1/2 flex items-center justify-center cursor-ew-resize pointer-events-auto p-1 z-30 select-none"
                            title="Drag to decrease/increase width"
                          >
                            <div className="w-1.5 h-3.5 bg-white border-2 border-fuchsia-500 rounded-full shadow-sm transition-all group-hover/handle-e:hidden" />
                            <div className="hidden group-hover/handle-e:flex items-center justify-center w-5 h-5 bg-white border-2 border-fuchsia-500 rounded-full shadow-md text-fuchsia-600">
                              <MoveHorizontal className="w-3.5 h-3.5 stroke-[3]" />
                            </div>
                          </div>
                        </>
                      )}

                      {/* Non-text top/bottom handles: ONLY for rectangle/image (NEVER for text, circle, star, triangle) */}
                      {layer.type !== 'text' && !isUniformShape && (
                        <>
                          <div
                            onPointerDown={(event) => resizeStart(event, layer, 'n')}
                            className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3.5 h-1.5 bg-white border-2 border-fuchsia-500 rounded-full cursor-ns-resize pointer-events-auto z-30"
                            title="Resize height"
                          />
                          <div
                            onPointerDown={(event) => resizeStart(event, layer, 's')}
                            className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-3.5 h-1.5 bg-white border-2 border-fuchsia-500 rounded-full cursor-ns-resize pointer-events-auto z-30"
                            title="Resize height"
                          />
                        </>
                      )}
                    </div>
                  );
                })()}
              </div>
            )
          )}
          {!layers.length && (
            <div className="absolute inset-0 grid place-items-center text-center text-xs text-slate-500 dark:text-slate-400 pointer-events-none">
              Drag an image here, or add text with the toolbar
            </div>
          )}
        </div>

        <div className="flex items-center justify-between px-1 text-[10px] text-slate-400">
          <span className="flex items-center gap-1">
            <Plus className="w-3 h-3" /> Drag images into the canvas
          </span>
          {imageUrl && (
            <button
              type="button"
              onClick={() => setHideSourceImage((value) => !value)}
              className="flex items-center gap-1 font-semibold hover:text-orange-500 cursor-pointer"
            >
              {hideSourceImage ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
              {hideSourceImage ? 'Show source' : 'Hide source'}
            </button>
          )}
        </div>
      </div>
    );
  }
);

CustomDesignEditor.displayName = 'CustomDesignEditor';
export default CustomDesignEditor;
