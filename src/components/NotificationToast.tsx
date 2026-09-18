import { Bell, CheckCircle2, X } from 'lucide-react';
import { ReminderNotification } from '../types';

interface NotificationToastProps {
  notification: ReminderNotification | null;
  onClose: () => void;
  onOpenCenter?: () => void;
  onQuickComplete?: (habitId: string) => void;
}

export default function NotificationToast({
  notification,
  onClose,
  onOpenCenter,
  onQuickComplete,
}: NotificationToastProps) {
  if (!notification) return null;

  const hasIncomplete = notification.incompleteHabitIds.length > 0;

  return (
    <aside
      aria-label="Daily reminder alert"
      className="fixed top-3 left-4 right-4 z-50 max-w-sm mx-auto animate-in slide-in-from-top-4 duration-300 pointer-events-auto"
    >
      <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-emerald-100 p-3.5 ring-1 ring-slate-900/5">
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-emerald-500 flex items-center justify-center text-white shrink-0 shadow-sm shadow-amber-500/20">
            <Bell className="w-4 h-4 animate-bounce" />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0 pr-1">
            <div className="flex items-center justify-between gap-1 mb-0.5">
              <h4 className="text-xs font-bold text-slate-900 truncate">
                {notification.title}
              </h4>
              <span className="text-[10px] text-slate-400 shrink-0 font-medium">Just now</span>
            </div>

            <p className="text-[11px] text-slate-600 leading-snug line-clamp-2 mb-2">
              {notification.body}
            </p>

            {/* Incomplete habit chips & quick action */}
            {hasIncomplete && (
              <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-slate-100">
                {notification.incompleteHabitNames.slice(0, 3).map((name, idx) => {
                  const habitId = notification.incompleteHabitIds[idx];
                  return (
                    <button
                      key={name}
                      type="button"
                      onClick={() => onQuickComplete && habitId && onQuickComplete(habitId)}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-[10px] font-semibold border border-emerald-200/70 transition cursor-pointer"
                      title="Tap to mark done"
                    >
                      <CheckCircle2 className="w-2.5 h-2.5" />
                      <span>{name}</span>
                    </button>
                  );
                })}

                {notification.incompleteHabitNames.length > 3 && (
                  <span className="text-[10px] text-slate-400">
                    +{notification.incompleteHabitNames.length - 3} more
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Dismiss notification"
            className="w-6 h-6 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition shrink-0 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
}
