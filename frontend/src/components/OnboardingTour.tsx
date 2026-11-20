import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Upload,
  LayoutGrid,
  Square,
  Sparkles,
  Download,
  X,
  ChevronRight,
  ChevronLeft,
  Lightbulb,
} from 'lucide-react';

export interface OnboardingTourProps {
  isOpen: boolean;
  onClose: () => void;
  onTabChange?: (tab: 'upload' | 'template' | 'canvas') => void;
  onComplete?: () => void;
}

export const ONBOARDING_STORAGE_KEY = 'craftora_onboarding_completed';

interface TourStep {
  id: string;
  targetId: string;
  fallbackTargetId?: string;
  sidebarTab?: 'upload' | 'template' | 'canvas';
  title: string;
  description: string;
  tip?: string;
  icon: React.ComponentType<{ className?: string }>;
  accentColor: string;
  preferredPlacement: 'right' | 'bottom' | 'bottom-end' | 'top' | 'left';
}

const TOUR_STEPS: TourStep[] = [
  {
    id: 'upload',
    targetId: 'tour-panel-upload',
    fallbackTargetId: 'tour-nav-upload',
    sidebarTab: 'upload',
    title: 'Upload Images & PDFs',
    description:
      'Drag & drop or browse any PNG, JPG, WebP image or multi-page PDF. The system automatically processes high-resolution frames and detects dominant color palettes.',
    tip: 'Supports PDF, PNG, JPG & WebP up to 50MB with instant preview.',
    icon: Upload,
    accentColor: 'from-blue-500 to-indigo-600',
    preferredPlacement: 'right',
  },
  {
    id: 'templates',
    targetId: 'tour-panel-template',
    fallbackTargetId: 'tour-nav-template',
    sidebarTab: 'template',
    title: 'Pick Device & Templates',
    description:
      'Choose between Apple MacBook, Dell XPS, ThinkPad, Hardcover 3D Book, Mobile, Tablet, Webinar Graphic, or the full Custom Canvas layer editor.',
    tip: 'Filter mockups by category or search by device model.',
    icon: LayoutGrid,
    accentColor: 'from-purple-500 to-pink-600',
    preferredPlacement: 'right',
  },
  {
    id: 'canvas',
    targetId: 'tour-panel-canvas',
    fallbackTargetId: 'tour-nav-canvas',
    sidebarTab: 'canvas',
    title: 'Canvas Dimensions & Styling',
    description:
      'Fine-tune output resolutions (1200×800, 1920×1080, square, portrait), select brand gradients, and adjust device scale and vertical offsets.',
    tip: 'Pick one of 6+ curated gradient presets or set custom dimensions.',
    icon: Square,
    accentColor: 'from-emerald-500 to-teal-600',
    preferredPlacement: 'right',
  },
  {
    id: 'preview',
    targetId: 'tour-preview-canvas',
    title: 'Interactive Live Preview & OCR',
    description:
      'Inspect your realistic mockup in real-time. Click headings and badges to edit text directly, or use AI OCR to modify and translate image text.',
    tip: 'Click any editable text element or badge to customize fonts and colors.',
    icon: Sparkles,
    accentColor: 'from-amber-500 to-orange-600',
    preferredPlacement: 'bottom',
  },
  {
    id: 'export',
    targetId: 'tour-step-export',
    title: 'High-Res Multi-Scale Export',
    description:
      'Download studio-quality PNG assets in 1x standard, 2x HD, or 3x Retina resolution for presentations, portfolios, marketing ads, and websites.',
    tip: 'Use 2x or 3x for ultra-sharp Retina rendering on displays.',
    icon: Download,
    accentColor: 'from-fuchsia-600 via-violet-600 to-purple-600',
    preferredPlacement: 'bottom-end',
  },
];

interface SpotlightRect {
  x: number;
  y: number;
  width: number;
  height: number;
  radius: number;
}

interface TooltipCoords {
  left: number;
  top: number;
  arrowPlacement: 'left' | 'top' | 'bottom' | 'right';
  arrowOffset: number;
}

export const OnboardingTour: React.FC<OnboardingTourProps> = ({
  isOpen,
  onClose,
  onTabChange,
  onComplete,
}) => {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [spotlight, setSpotlight] = useState<SpotlightRect | null>(null);
  const [tooltipCoords, setTooltipCoords] = useState<TooltipCoords | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const step = TOUR_STEPS[currentStep] || TOUR_STEPS[0];
  const StepIcon = step.icon;

  // Handle Finish / Skip
  const handleFinish = useCallback(() => {
    localStorage.setItem(ONBOARDING_STORAGE_KEY, 'true');
    onClose();
    if (onComplete) {
      onComplete();
    }
  }, [onClose, onComplete]);

  const handleNext = () => {
    if (currentStep < TOUR_STEPS.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      handleFinish();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  // Switch sidebar tab when step changes
  useEffect(() => {
    if (!isOpen) return;
    const currentTab = TOUR_STEPS[currentStep]?.sidebarTab;
    if (currentTab && onTabChange) {
      onTabChange(currentTab);
    }
  }, [isOpen, currentStep, onTabChange]);

  // Update spotlight & tooltip coordinates
  const updatePositions = useCallback(() => {
    if (!isOpen) return;
    const currentStepConfig = TOUR_STEPS[currentStep];
    if (!currentStepConfig) return;

    let targetEl = document.getElementById(currentStepConfig.targetId);
    if (!targetEl && currentStepConfig.fallbackTargetId) {
      targetEl = document.getElementById(currentStepConfig.fallbackTargetId);
    }

    if (!targetEl) {
      // Element not yet ready, clear spotlight
      return;
    }

    const rect = targetEl.getBoundingClientRect();
    const padding = 8;
    const x = Math.max(0, rect.left - padding);
    const y = Math.max(0, rect.top - padding);
    const width = rect.width + padding * 2;
    const height = rect.height + padding * 2;

    setSpotlight({
      x,
      y,
      width,
      height,
      radius: 14,
    });

    // Calculate tooltip coordinates
    const tooltipWidth = tooltipRef.current?.offsetWidth || 360;
    const tooltipHeight = tooltipRef.current?.offsetHeight || 250;
    const margin = 16;
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    let left = 0;
    let top = 0;
    let arrowPlacement: 'left' | 'top' | 'bottom' | 'right' = 'left';
    let arrowOffset = 30;

    const preferred = currentStepConfig.preferredPlacement;

    if (preferred === 'right') {
      if (rect.right + tooltipWidth + margin + 14 <= vw) {
        left = rect.right + 14;
        top = Math.max(
          margin,
          Math.min(vh - tooltipHeight - margin, rect.top + Math.min(60, rect.height / 3))
        );
        arrowPlacement = 'left';
        arrowOffset = Math.max(20, Math.min(tooltipHeight - 20, rect.top + 30 - top));
      } else {
        // Fallback to bottom
        left = Math.max(margin, Math.min(vw - tooltipWidth - margin, rect.left));
        top = Math.min(vh - tooltipHeight - margin, rect.bottom + 14);
        arrowPlacement = 'top';
        arrowOffset = Math.max(20, Math.min(tooltipWidth - 20, rect.left + 40 - left));
      }
    } else if (preferred === 'bottom-end') {
      left = Math.max(margin, rect.right - tooltipWidth);
      top = rect.bottom + 14;
      arrowPlacement = 'top';
      arrowOffset = Math.max(20, Math.min(tooltipWidth - 20, rect.right - left - 30));
    } else if (preferred === 'bottom') {
      left = Math.max(
        margin,
        Math.min(vw - tooltipWidth - margin, rect.left + rect.width / 2 - tooltipWidth / 2)
      );
      top = rect.bottom + 14;
      arrowPlacement = 'top';
      arrowOffset = Math.max(20, Math.min(tooltipWidth - 20, rect.left + rect.width / 2 - left));

      if (top + tooltipHeight + margin > vh) {
        // Flip to top if overflowing viewport bottom
        top = Math.max(margin, rect.top - tooltipHeight - 14);
        arrowPlacement = 'bottom';
      }
    } else {
      // Default bottom
      left = Math.max(margin, Math.min(vw - tooltipWidth - margin, rect.left));
      top = Math.min(vh - tooltipHeight - margin, rect.bottom + 14);
      arrowPlacement = 'top';
      arrowOffset = 30;
    }

    setTooltipCoords({
      left,
      top,
      arrowPlacement,
      arrowOffset,
    });
  }, [isOpen, currentStep]);

  // Recalculate on step change, resize, and scroll
  useEffect(() => {
    if (!isOpen) return;

    // Small delay to allow tab DOM switch to finish rendering
    const timer = setTimeout(() => {
      updatePositions();
    }, 60);

    const handleResize = () => updatePositions();
    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleResize, true);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleResize, true);
    };
  }, [isOpen, currentStep, updatePositions]);

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') {
        handleFinish();
      } else if (e.key === 'ArrowRight') {
        if (currentStep < TOUR_STEPS.length - 1) {
          setCurrentStep((prev) => prev + 1);
        } else {
          handleFinish();
        }
      } else if (e.key === 'ArrowLeft') {
        if (currentStep > 0) {
          setCurrentStep((prev) => prev - 1);
        }
      }
    },
    [isOpen, currentStep, handleFinish]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9990] pointer-events-auto select-none">
      {/* SVG Spotlight Mask */}
      {spotlight && (
        <svg
          className="fixed inset-0 w-full h-full pointer-events-none transition-all duration-300"
          style={{ width: '100vw', height: '100vh' }}
        >
          <defs>
            <mask id="craftora-tour-mask">
              <rect x="0" y="0" width="100%" height="100%" fill="white" />
              <rect
                x={spotlight.x}
                y={spotlight.y}
                width={spotlight.width}
                height={spotlight.height}
                rx={spotlight.radius}
                ry={spotlight.radius}
                fill="black"
              />
            </mask>
          </defs>
          <rect
            x="0"
            y="0"
            width="100%"
            height="100%"
            fill="rgba(8, 8, 20, 0.68)"
            mask="url(#craftora-tour-mask)"
          />
        </svg>
      )}

      {/* Target Element Spotlight Glow Ring */}
      {spotlight && (
        <div
          style={{
            position: 'fixed',
            left: `${spotlight.x}px`,
            top: `${spotlight.y}px`,
            width: `${spotlight.width}px`,
            height: `${spotlight.height}px`,
            borderRadius: `${spotlight.radius}px`,
            pointerEvents: 'none',
          }}
          className="ring-2 ring-indigo-500/90 shadow-[0_0_35px_rgba(99,102,241,0.55)] transition-all duration-300 z-[9991]"
        >
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-500"></span>
          </span>
        </div>
      )}

      {/* Floating Tooltip Card */}
      <div
        ref={tooltipRef}
        style={{
          position: 'fixed',
          left: tooltipCoords ? `${tooltipCoords.left}px` : '50%',
          top: tooltipCoords ? `${tooltipCoords.top}px` : '50%',
          transform: tooltipCoords ? 'none' : 'translate(-50%, -50%)',
          zIndex: 9995,
        }}
        className="w-[360px] max-w-[calc(100vw-32px)] bg-white dark:bg-[#0c0c20] text-slate-900 dark:text-white border border-slate-200/90 dark:border-[#26264c] rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.35)] dark:shadow-[0_25px_70px_rgba(0,0,0,0.7)] p-4 sm:p-5 flex flex-col gap-3 transition-all duration-300 animate-in fade-in zoom-in-95"
        role="dialog"
        aria-modal="true"
        aria-labelledby="tour-tooltip-title"
      >
        {/* Tooltip Arrow Pointer */}
        {tooltipCoords && tooltipCoords.arrowPlacement === 'left' && (
          <div
            style={{ top: `${tooltipCoords.arrowOffset}px` }}
            className="absolute -left-2 w-3.5 h-3.5 bg-white dark:bg-[#0c0c20] border-l border-b border-slate-200/90 dark:border-[#26264c] transform rotate-45"
          />
        )}
        {tooltipCoords && tooltipCoords.arrowPlacement === 'top' && (
          <div
            style={{ left: `${tooltipCoords.arrowOffset}px` }}
            className="absolute -top-2 w-3.5 h-3.5 bg-white dark:bg-[#0c0c20] border-l border-t border-slate-200/90 dark:border-[#26264c] transform rotate-45"
          />
        )}
        {tooltipCoords && tooltipCoords.arrowPlacement === 'bottom' && (
          <div
            style={{ left: `${tooltipCoords.arrowOffset}px` }}
            className="absolute -bottom-2 w-3.5 h-3.5 bg-white dark:bg-[#0c0c20] border-r border-b border-slate-200/90 dark:border-[#26264c] transform rotate-45"
          />
        )}
        {tooltipCoords && tooltipCoords.arrowPlacement === 'right' && (
          <div
            style={{ top: `${tooltipCoords.arrowOffset}px` }}
            className="absolute -right-2 w-3.5 h-3.5 bg-white dark:bg-[#0c0c20] border-r border-t border-slate-200/90 dark:border-[#26264c] transform rotate-45"
          />
        )}

        {/* Top Header Row: Step Badge + Title + Close Button */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center space-x-2.5">
            <div
              className={`p-2 rounded-xl bg-gradient-to-tr ${step.accentColor} text-white shadow-sm shrink-0`}
            >
              <StepIcon className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                  Step {currentStep + 1} of {TOUR_STEPS.length}
                </span>
              </div>
              <h3
                id="tour-tooltip-title"
                className="text-sm font-bold text-slate-900 dark:text-white font-['Outfit'] mt-1 leading-snug"
              >
                {step.title}
              </h3>
            </div>
          </div>

          <button
            onClick={handleFinish}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#1a1a36] rounded-lg transition-colors -mr-1 -mt-1"
            title="Skip tour (Esc)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tooltip Description */}
        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
          {step.description}
        </p>

        {/* Handy Pro Tip Box */}
        {step.tip && (
          <div className="flex items-start space-x-2 p-2.5 rounded-xl bg-indigo-50/70 dark:bg-[#14142e] border border-indigo-100 dark:border-[#202046] text-[11px] text-slate-700 dark:text-slate-300">
            <Lightbulb className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
            <span className="leading-snug">{step.tip}</span>
          </div>
        )}

        {/* Footer Controls: Skip, Dots, Back, Next */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-[#1a1a36]">
          {/* Skip Tour Button */}
          <button
            onClick={handleFinish}
            className="text-xs font-semibold text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors py-1.5 px-2 -ml-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-[#181832]"
          >
            Skip
          </button>

          {/* Dots Indicator */}
          <div className="flex items-center space-x-1.5">
            {TOUR_STEPS.map((s, idx) => (
              <button
                key={s.id}
                onClick={() => setCurrentStep(idx)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  idx === currentStep
                    ? 'w-5 bg-gradient-to-r from-indigo-500 to-purple-600'
                    : 'w-1.5 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600'
                }`}
                title={`Jump to step ${idx + 1}`}
              />
            ))}
          </div>

          {/* Back & Next Navigation Buttons */}
          <div className="flex items-center space-x-2">
            {currentStep > 0 && (
              <button
                onClick={handlePrev}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#181832] border border-slate-200 dark:border-[#222244] transition-colors"
              >
                Back
              </button>
            )}

            <button
              onClick={handleNext}
              className="px-4 py-1.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-md shadow-indigo-500/20 hover:shadow-indigo-500/35 active:scale-95 transition-all flex items-center space-x-1"
            >
              <span>{currentStep === TOUR_STEPS.length - 1 ? 'Got it' : 'Next'}</span>
              {currentStep < TOUR_STEPS.length - 1 && <ChevronRight className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
