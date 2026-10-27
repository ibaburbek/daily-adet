import React, { useState, useRef } from 'react';
import {
  Moon,
  Sun,
  Monitor,
  Image as ImageIcon,
  Upload,
  Trash2,
  Download,
  RotateCcw,
  CheckCircle2,
  Sparkles,
  Sliders,
  ShieldCheck,
  Smartphone,
  Eye,
  Info,
  Layers,
  FileCheck,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { BACKGROUND_PRESETS } from '../utils/background-presets';
import { validateImageFile, compressAndResizeImage, ProcessedImageResult } from '../utils/image-compress';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { BackgroundPresetId, ThemeMode } from '../types';

export const SettingsView: React.FC = () => {
  const {
    theme,
    resolvedTheme,
    setTheme,
    backgroundConfig,
    customImageUrl,
    activeCssBackground,
    setBackgroundPreset,
    setCustomImage,
    removeCustomImage,
    setOverlayOpacity,
    exportBackup,
    importBackup,
    resetToSampleData,
  } = useApp();

  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();

  // Local state for image upload preview and processing
  const fileInputRef = useRef<HTMLInputElement>(null);
  const backupInputRef = useRef<HTMLInputElement>(null);

  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [compressionInfo, setCompressionInfo] = useState<{
    originalSize: string;
    compressedSize: string;
    savedPercent: number;
  } | null>(null);

  // Pending image for preview before applying
  const [stagedImage, setStagedImage] = useState<ProcessedImageResult | null>(null);

  // Backup import notification
  const [backupStatus, setBackupStatus] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  // Reset confirmation
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // Handle image file selection
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError(null);
    setCompressionInfo(null);

    // Validate
    const validation = validateImageFile(file);
    if (!validation.valid) {
      setUploadError(validation.error || 'Қате файл форматы');
      return;
    }

    try {
      setIsProcessingImage(true);
      const processed = await compressAndResizeImage(file);
      setStagedImage(processed);

      const originalMb = (processed.originalSize / (1024 * 1024)).toFixed(2);
      const compressedKb = (processed.compressedSize / 1024).toFixed(0);
      const saved = Math.round(
        ((processed.originalSize - processed.compressedSize) / processed.originalSize) * 100
      );

      setCompressionInfo({
        originalSize: `${originalMb} МБ`,
        compressedSize: `${compressedKb} КБ`,
        savedPercent: Math.max(0, saved),
      });
    } catch (err) {
      setUploadError('Суретті өңдеу сәтсіз аяқталды: ' + String(err));
    } finally {
      setIsProcessingImage(false);
    }
  };

  // Apply the staged image to IndexedDB & active background
  const handleApplyStagedImage = async () => {
    if (!stagedImage) return;
    try {
      await setCustomImage(stagedImage.blob);
      setStagedImage(null);
    } catch (err) {
      setUploadError('Суретті сақтау кезінде қате орын алды: ' + String(err));
    }
  };

  const handleCancelStagedImage = () => {
    if (stagedImage) {
      URL.revokeObjectURL(stagedImage.previewUrl);
      setStagedImage(null);
      setCompressionInfo(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Handle JSON backup import
  const handleBackupFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const res = importBackup(content);
      if (res.success && res.count) {
        setBackupStatus({
          type: 'success',
          message: `Деректер сәтті қалпына келтірілді: ${res.count.tasks} тапсырма, ${res.count.habits} әдет, ${res.count.schedule} кесте әрекеті.`,
        });
      } else {
        setBackupStatus({
          type: 'error',
          message: res.error || 'Қалпына келтіру кезінде қате орын алды.',
        });
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-5 space-y-6 pb-36">
      {/* Title */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--color-text-primary)]">
          Баптаулар
        </h2>
        <p className="text-xs sm:text-sm text-[var(--color-accent-secondary)] mt-0.5">
          Дизайн, тақырып, фон және деректерді басқару
        </p>
      </div>

      {/* 1. Theme Selector */}
      <div
        className="rounded-2xl p-4 sm:p-5 border space-y-3.5 backdrop-blur-md"
        style={{
          backgroundColor: 'var(--glass-bg)',
          borderColor: 'var(--color-border)',
        }}
      >
        <div className="flex items-center gap-2">
          <Moon className="w-4 h-4 text-[var(--color-accent-primary)]" />
          <h3 className="text-sm font-bold text-[var(--color-text-primary)]">
            Қолданба тақырыбы (Theme)
          </h3>
        </div>

        <p className="text-xs text-[var(--color-text-secondary)]">
          Әдепкі түс — түнгі көк (Dark Navy). Өзіңізге ыңғайлы режимді таңдаңыз:
        </p>

        <div className="grid grid-cols-3 gap-2.5 pt-1">
          {/* Dark Mode */}
          <button
            onClick={() => setTheme('dark')}
            className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all active:scale-95 ${
              theme === 'dark'
                ? 'border-[var(--color-accent-primary)] bg-[var(--color-sec-bg)] ring-1 ring-[var(--color-accent-primary)]/50'
                : 'border-[var(--color-border)] bg-[var(--color-card-bg)] hover:border-[var(--color-accent-primary)]/40'
            }`}
          >
            <Moon className="w-5 h-5 text-[var(--color-accent-primary)]" />
            <span className="text-xs font-semibold text-[var(--color-text-primary)]">
              Күңгірт (Dark)
            </span>
            <span className="text-[10px] text-[var(--color-accent-secondary)]">
              Әдепкі режим
            </span>
          </button>

          {/* Light Mode */}
          <button
            onClick={() => setTheme('light')}
            className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all active:scale-95 ${
              theme === 'light'
                ? 'border-[var(--color-accent-primary)] bg-[var(--color-sec-bg)] ring-1 ring-[var(--color-accent-primary)]/50'
                : 'border-[var(--color-border)] bg-[var(--color-card-bg)] hover:border-[var(--color-accent-primary)]/40'
            }`}
          >
            <Sun className="w-5 h-5 text-amber-400" />
            <span className="text-xs font-semibold text-[var(--color-text-primary)]">
              Ашық (Light)
            </span>
            <span className="text-[10px] text-[var(--color-text-muted)]">
              Сәлдегүл акцент
            </span>
          </button>

          {/* System Theme */}
          <button
            onClick={() => setTheme('system')}
            className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all active:scale-95 ${
              theme === 'system'
                ? 'border-[var(--color-accent-primary)] bg-[var(--color-sec-bg)] ring-1 ring-[var(--color-accent-primary)]/50'
                : 'border-[var(--color-border)] bg-[var(--color-card-bg)] hover:border-[var(--color-accent-primary)]/40'
            }`}
          >
            <Monitor className="w-5 h-5 text-[var(--color-lavender)]" />
            <span className="text-xs font-semibold text-[var(--color-text-primary)]">
              Жүйелік (Auto)
            </span>
            <span className="text-[10px] text-[var(--color-text-muted)]">
              Құрылғыға сай
            </span>
          </button>
        </div>
      </div>

      {/* 2. Background Customization Interface */}
      <div
        className="rounded-2xl p-4 sm:p-5 border space-y-4 backdrop-blur-md"
        style={{
          backgroundColor: 'var(--glass-bg)',
          borderColor: 'var(--color-border)',
        }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-[var(--color-accent-primary)]" />
            <h3 className="text-sm font-bold text-[var(--color-text-primary)]">
              Фонды баптау (Background Customization)
            </h3>
          </div>
          <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-[var(--color-sec-bg)] text-[var(--color-text-secondary)] border border-[var(--color-border)]">
            {backgroundConfig.type === 'custom' ? 'Жеке сурет' : 'Кіріктірілген'}
          </span>
        </div>

        {/* Option A: Built-in gradients */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-[var(--color-text-primary)] block">
            A. Кіріктірілген градиенттер:
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {BACKGROUND_PRESETS.map((preset) => {
              const isSelected =
                backgroundConfig.type === 'preset' && backgroundConfig.presetId === preset.id;

              return (
                <div
                  key={preset.id}
                  onClick={() => setBackgroundPreset(preset.id)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all duration-200 flex items-center gap-3 active:scale-98 ${
                    isSelected
                      ? 'border-[var(--color-accent-primary)] ring-1 ring-[var(--color-accent-primary)]/50'
                      : 'border-[var(--color-border)] hover:border-[var(--color-accent-primary)]/40'
                  }`}
                  style={{
                    backgroundColor: 'var(--color-sec-bg)',
                  }}
                >
                  <div
                    className="w-10 h-10 rounded-lg shrink-0 border border-white/10 shadow-xs"
                    style={{ background: preset.previewGradient }}
                  />
                  <div className="space-y-0.5 min-w-0 flex-1">
                    <span className="text-xs font-bold text-[var(--color-text-primary)] block truncate">
                      {preset.nameKk}
                    </span>
                    <span className="text-[10px] text-[var(--color-text-muted)] block truncate">
                      {preset.descriptionKk}
                    </span>
                  </div>
                  {isSelected && (
                    <CheckCircle2 className="w-4 h-4 text-[var(--color-accent-primary)] shrink-0" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Option B: Upload personal image */}
        <div className="space-y-2 pt-2 border-t border-[var(--color-border-subtle)]">
          <label className="text-xs font-semibold text-[var(--color-text-primary)] block">
            B. Жеке сурет жүктеу (IndexedDB арқылы сақталады):
          </label>
          <p className="text-xs text-[var(--color-text-secondary)]">
            JPG, PNG және WebP форматтары. Сурет сапасы сақталып, оңтайландырылады.
          </p>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/png,image/jpeg,image/webp"
            className="hidden"
          />

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isProcessingImage}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all active:scale-95 text-[var(--color-text-primary)]"
              style={{
                backgroundColor: 'var(--color-sec-bg)',
                borderColor: 'var(--color-border)',
              }}
            >
              <Upload className="w-4 h-4 text-[var(--color-accent-primary)]" />
              <span>{isProcessingImage ? 'Өңделуде...' : 'Құрылғыдан сурет таңдау'}</span>
            </button>

            {backgroundConfig.hasCustomImage && (
              <button
                onClick={removeCustomImage}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border border-rose-500/30 text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 transition-colors active:scale-95"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Суретті өшіру және градиентке оралу</span>
              </button>
            )}
          </div>

          {uploadError && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
              {uploadError}
            </div>
          )}

          {/* Staged Image Preview before applying */}
          {stagedImage && (
            <div
              className="p-3.5 rounded-xl border space-y-3 mt-2"
              style={{
                backgroundColor: 'var(--color-sec-bg)',
                borderColor: 'var(--color-accent-primary)',
              }}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[var(--color-accent-primary)] flex items-center gap-1.5">
                  <Eye className="w-4 h-4" /> Алдын ала қарау (Preview)
                </span>
                {compressionInfo && (
                  <span className="text-[10px] font-mono text-[var(--color-accent-secondary)]">
                    {compressionInfo.originalSize} ➔ {compressionInfo.compressedSize} (-{compressionInfo.savedPercent}%)
                  </span>
                )}
              </div>

              <div className="relative rounded-lg overflow-hidden h-36 border border-[var(--color-border)]">
                <img
                  src={stagedImage.previewUrl}
                  alt="Алдын ала қарау"
                  className="w-full h-full object-cover"
                />
                <div
                  className="absolute inset-0 transition-opacity"
                  style={{
                    backgroundColor: '#101923',
                    opacity: backgroundConfig.overlayOpacity,
                  }}
                />
                <div className="absolute inset-0 flex items-center justify-center p-3">
                  <div className="px-3 py-1.5 rounded-lg bg-[var(--color-card-bg)]/90 border border-[var(--color-border)] text-xs text-[var(--color-text-primary)] font-medium backdrop-blur-xs">
                    Мәтін анық оқылады ма?
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleApplyStagedImage}
                  className="flex-1 py-2 rounded-xl text-xs font-bold bg-[var(--color-accent-primary)] text-[#101923] active:scale-95 shadow-sm"
                >
                  Фон ретінде қолдану
                </button>
                <button
                  onClick={handleCancelStagedImage}
                  className="px-3 py-2 rounded-xl text-xs font-medium border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
                >
                  Болдырмау
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Overlay Dark/Light Opacity Slider */}
        <div className="space-y-2 pt-2 border-t border-[var(--color-border-subtle)]">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-[var(--color-text-primary)] flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-[var(--color-accent-primary)]" />
              Фондық қараңғылық деңгейі (Overlay Opacity):
            </label>
            <span className="font-mono text-xs font-bold text-[var(--color-accent-primary)]">
              {Math.round(backgroundConfig.overlayOpacity * 100)}%
            </span>
          </div>
          <p className="text-[11px] text-[var(--color-text-secondary)]">
            Сурет үстіндегі мәтіндер мен карточкалардың анық әрі сапалы оқылуын қамтамасыз етеді.
          </p>
          <input
            type="range"
            min="0.10"
            max="0.90"
            step="0.05"
            value={backgroundConfig.overlayOpacity}
            onChange={(e) => setOverlayOpacity(parseFloat(e.target.value))}
            className="w-full accent-[var(--color-accent-primary)] cursor-pointer"
          />
        </div>

        {/* Live Preview Card */}
        <div className="space-y-2 pt-2 border-t border-[var(--color-border-subtle)]">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-[var(--color-text-primary)] flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-[var(--color-accent-primary)]" />
              Тікелей алдын ала қарау (Live Card Preview):
            </label>
            <span className="text-[10px] text-[var(--color-text-muted)]">
              Интерфейс үлгісі
            </span>
          </div>

          <div
            className="relative rounded-xl p-4 border overflow-hidden"
            style={{
              background: activeCssBackground,
            }}
          >
            {/* Overlay simulation */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                backgroundColor: resolvedTheme === 'dark' ? '#101923' : '#F4F6F4',
                opacity: backgroundConfig.overlayOpacity,
              }}
            />

            {/* Mock Task Card */}
            <div
              className="relative rounded-xl p-3.5 border backdrop-blur-md shadow-sm space-y-2"
              style={{
                backgroundColor: 'var(--glass-bg)',
                borderColor: 'var(--color-border)',
              }}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[var(--color-accent-primary)] text-[#101923]">
                  АКТУАЛДЫ ҮЛГІ
                </span>
                <span className="text-[11px] font-mono text-[var(--color-accent-secondary)]">
                  14:30
                </span>
              </div>
              <h4 className="text-xs sm:text-sm font-bold text-[var(--color-text-primary)]">
                Daily Әдет: Барлық мәтіндер анық әрі көзге жағымды
              </h4>
              <p className="text-[11px] text-[var(--color-text-secondary)]">
                Күңгірт көк және сәлдегүл палитрасы ұстамды әрі назарды шашыратпайды.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 3. PWA Installation Card */}
      <div
        className="rounded-2xl p-4 sm:p-5 border space-y-3.5 backdrop-blur-md"
        style={{
          backgroundColor: 'var(--glass-bg)',
          borderColor: 'var(--color-border)',
        }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-[var(--color-accent-primary)]" />
            <h3 className="text-sm font-bold text-[var(--color-text-primary)]">
              Қолданбаны құрылғыға орнату (PWA)
            </h3>
          </div>
          {isInstalled && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              Орнатылған ✓
            </span>
          )}
        </div>

        <p className="text-xs text-[var(--color-text-secondary)]">
          Daily Әдет қолданбасын мобильді құрылғы немесе компьютер экранына бөлек бағдарлама ретінде орнатып, офлайн пайдаланыңыз.
        </p>

        {isInstalled ? (
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>Қолданба толықтай құрылғы экранына орнатылған және дербес жұмыс істейді.</span>
          </div>
        ) : isInstallable ? (
          <button
            onClick={install}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-[var(--color-accent-primary)] text-[#101923] active:scale-95 shadow-sm"
          >
            <Download className="w-4 h-4" />
            <span>Құрылғыға орнату</span>
          </button>
        ) : isIOS ? (
          <div>
            <button
              onClick={() => setShowIOSGuide(true)}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold border border-[var(--color-border)] text-[var(--color-text-primary)] bg-[var(--color-sec-bg)] active:scale-95"
            >
              <Smartphone className="w-4 h-4 text-[var(--color-accent-primary)]" />
              <span>iPhone / iPad-қа орнату нұсқаулығы</span>
            </button>

            {showIOSGuide && (
              <div className="mt-3 p-3.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-sec-bg)] space-y-2 text-xs text-[var(--color-text-secondary)]">
                <p className="font-bold text-[var(--color-text-primary)]">
                  Safari браузерінде:
                </p>
                <ol className="list-decimal pl-4 space-y-1">
                  <li>Төменгі панельдегі <strong>«Бөлісу» (Share)</strong> батырмасын басыңыз.</li>
                  <li>Тізімнен төмен қарай сырғытып, <strong>«Басты экранға қосу» (Add to Home Screen)</strong> таңдаңыз.</li>
                  <li>Жоғарғы оң жақтағы <strong>«Қосу» (Add)</strong> басыңыз.</li>
                </ol>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="text-xs font-semibold text-[var(--color-accent-primary)] pt-1 hover:underline block"
                >
                  Жабу
                </button>
              </div>
            )}
          </div>
        ) : (
          <p className="text-[11px] text-[var(--color-text-muted)]">
            Орнату мүмкіндігі браузер арқылы автоматты қолдау табады.
          </p>
        )}
      </div>

      {/* 4. Backup & Restore */}
      <div
        className="rounded-2xl p-4 sm:p-5 border space-y-3.5 backdrop-blur-md"
        style={{
          backgroundColor: 'var(--glass-bg)',
          borderColor: 'var(--color-border)',
        }}
      >
        <div className="flex items-center gap-2">
          <FileCheck className="w-4 h-4 text-[var(--color-accent-primary)]" />
          <h3 className="text-sm font-bold text-[var(--color-text-primary)]">
            Деректердің сақтық көшірмесі (Backup & Restore)
          </h3>
        </div>

        <p className="text-xs text-[var(--color-text-secondary)]">
          Тапсырмаларыңыз, әдеттеріңіз бен кестеңізді JSON файлына экспорттаңыз немесе бұрынғы сақтық көшірмеден қалпына келтіріңіз.
        </p>

        <input
          type="file"
          ref={backupInputRef}
          onChange={handleBackupFile}
          accept=".json,application/json"
          className="hidden"
        />

        <div className="flex flex-wrap items-center gap-2 pt-1">
          <button
            onClick={exportBackup}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all active:scale-95 text-[var(--color-text-primary)]"
            style={{
              backgroundColor: 'var(--color-sec-bg)',
              borderColor: 'var(--color-border)',
            }}
          >
            <Download className="w-4 h-4 text-[var(--color-accent-primary)]" />
            <span>Көшірмені жүктеу (.json)</span>
          </button>

          <button
            onClick={() => backupInputRef.current?.click()}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all active:scale-95 text-[var(--color-text-primary)]"
            style={{
              backgroundColor: 'var(--color-sec-bg)',
              borderColor: 'var(--color-border)',
            }}
          >
            <Upload className="w-4 h-4 text-[var(--color-lavender)]" />
            <span>Көшірмені қалпына келтіру</span>
          </button>
        </div>

        {backupStatus && (
          <div
            className={`p-3 rounded-xl border text-xs ${
              backupStatus.type === 'success'
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
            }`}
          >
            {backupStatus.message}
          </div>
        )}

        {/* Reset Option */}
        <div className="pt-3 border-t border-[var(--color-border-subtle)] flex items-center justify-between">
          <span className="text-xs text-[var(--color-text-muted)]">
            Бастапқы үлгі деректері:
          </span>
          {showResetConfirm ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  resetToSampleData();
                  setShowResetConfirm(false);
                }}
                className="px-2.5 py-1 text-xs font-bold bg-rose-500 text-white rounded-lg active:scale-95"
              >
                Иә, қалпына келтіру
              </button>
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-2 py-1 text-xs text-[var(--color-text-secondary)] hover:text-white"
              >
                Жоқ
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowResetConfirm(true)}
              className="text-xs text-[var(--color-text-muted)] hover:text-rose-400 flex items-center gap-1 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Бастапқы күйге қайтару
            </button>
          )}
        </div>
      </div>

      {/* 5. App Info */}
      <div
        className="rounded-2xl p-4 border text-center space-y-1 backdrop-blur-md"
        style={{
          backgroundColor: 'var(--glass-bg)',
          borderColor: 'var(--color-border)',
        }}
      >
        <p className="text-xs font-bold text-[var(--color-text-primary)]">
          Daily Әдет v2.0
        </p>
        <p className="text-[11px] text-[var(--color-text-secondary)]">
          Күнделікті жоспар, әдеттер мен сағаттық кестені басқаруға арналған қазақша жеке жүйе.
        </p>
        <p className="text-[10px] text-[var(--color-accent-primary)] pt-1">
          Барлық деректер қауіпсіз түрде жергілікті құрылғыңызда (LocalStorage + IndexedDB) сақталады.
        </p>
      </div>
    </div>
  );
};
