import React from 'react';
import { LayoutDashboard, CalendarClock, CheckSquare, Flame, Settings } from 'lucide-react';
import { useApp, ActiveTab } from '../context/AppContext';

interface NavItem {
  id: ActiveTab;
  label: string;
  icon: React.ElementType;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'Басты бет', icon: LayoutDashboard },
  { id: 'schedule', label: 'Кесте', icon: CalendarClock },
  { id: 'tasks', label: 'Тапсырма', icon: CheckSquare },
  { id: 'habits', label: 'Әдеттер', icon: Flame },
  { id: 'settings', label: 'Баптаулар', icon: Settings },
];

export const Navbar: React.FC = () => {
  const { activeTab, setActiveTab } = useApp();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 border-t backdrop-blur-xl transition-colors duration-200"
      style={{
        backgroundColor: 'var(--nav-bg)',
        borderColor: 'var(--color-border)',
        paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 10px)',
      }}
    >
      <div className="max-w-2xl mx-auto px-3 pt-2">
        <div className="flex items-center justify-around">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`relative flex flex-col items-center justify-center py-1.5 px-3 rounded-xl transition-all duration-150 min-w-[56px] min-h-[48px] touch-manipulation select-none active:scale-95 ${
                  isActive
                    ? 'text-[var(--color-accent-primary)] font-semibold'
                    : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
                }`}
                aria-label={item.label}
              >
                <div className="relative">
                  <Icon
                    className={`w-5 h-5 transition-transform duration-200 ${
                      isActive ? 'scale-110 stroke-[2.4]' : 'stroke-[1.8]'
                    }`}
                  />
                  {isActive && (
                    <span
                      className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[var(--color-accent-primary)] shadow-sm"
                      style={{
                        boxShadow: '0 0 6px var(--color-accent-primary)',
                      }}
                    />
                  )}
                </div>
                <span className="text-[11px] mt-1 tracking-tight truncate max-w-[68px]">
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
