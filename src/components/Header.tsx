import React from 'react';
import { Plus, ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatKazakhShortDate } from '../utils/kazakh-date';

interface HeaderProps {
  onOpenNewTaskModal?: () => void;
  onOpenNewScheduleModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenNewTaskModal,
  onOpenNewScheduleModal,
}) => {
  const {
    currentDate,
    isViewingToday,
    goToPreviousDay,
    goToNextDay,
    goToToday,
    activeTab,
  } = useApp();

  const showDateNavigator = activeTab === 'dashboard' || activeTab === 'schedule';

  return (
    <header
      className="sticky top-0 z-30 border-b backdrop-blur-md transition-colors duration-200"
      style={{
        backgroundColor: 'var(--glass-header)',
        borderColor: 'var(--color-border)',
        paddingTop: 'max(env(safe-area-inset-top, 0px), 8px)',
      }}
    >
      <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
        {/* Brand identity */}
        <div className="flex items-center gap-2.5">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm shadow-inner transition-transform active:scale-95 cursor-pointer border"
            style={{
              background: 'linear-gradient(135deg, var(--color-sec-bg), var(--color-card-bg))',
              borderColor: 'var(--color-border)',
              color: 'var(--color-accent-primary)',
            }}
            onClick={goToToday}
            title="Бүгінгі күнге қайту"
          >
            <span className="text-base">✦</span>
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight text-[var(--color-text-primary)] leading-none">
              Daily Әдет
            </h1>
            <p className="text-[11px] font-medium text-[var(--color-text-muted)] tracking-wide mt-0.5">
              КҮНДЕЛІКТІ ЖОСПАР МЕН ӘДЕТТЕР
            </p>
          </div>
        </div>

        {/* Date Navigator / Action button */}
        <div className="flex items-center gap-2">
          {showDateNavigator && (
            <div
              className="flex items-center border rounded-xl p-0.5 text-xs font-medium"
              style={{
                backgroundColor: 'var(--color-sec-bg)',
                borderColor: 'var(--color-border)',
              }}
            >
              <button
                onClick={goToPreviousDay}
                className="p-1.5 rounded-lg hover:text-[var(--color-accent-primary)] transition-colors active:scale-90"
                aria-label="Алдыңғы күн"
                title="Алдыңғы күн"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <button
                onClick={goToToday}
                className={`px-2 py-1 rounded-md transition-all flex items-center gap-1 ${
                  isViewingToday
                    ? 'text-[var(--color-accent-primary)] font-semibold'
                    : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
                }`}
                title="Бүгін"
              >
                <Calendar className="w-3.5 h-3.5" />
                <span className="text-[11px] font-medium whitespace-nowrap">
                  {formatKazakhShortDate(currentDate)}
                </span>
              </button>

              <button
                onClick={goToNextDay}
                className="p-1.5 rounded-lg hover:text-[var(--color-accent-primary)] transition-colors active:scale-90"
                aria-label="Келесі күн"
                title="Келесі күн"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Quick Action Button */}
          {activeTab === 'schedule' ? (
            <button
              onClick={onOpenNewScheduleModal}
              className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-xl transition-all duration-150 active:scale-95 shadow-sm text-[#101923]"
              style={{
                backgroundColor: 'var(--color-accent-primary)',
              }}
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span className="hidden sm:inline">Кесте</span>
            </button>
          ) : (
            <button
              onClick={onOpenNewTaskModal}
              className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-xl transition-all duration-150 active:scale-95 shadow-sm text-[#101923]"
              style={{
                backgroundColor: 'var(--color-accent-primary)',
              }}
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span className="hidden sm:inline">Тапсырма</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
