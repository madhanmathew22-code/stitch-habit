import { useTheme } from '../context/ThemeContext';

interface StatusBarProps {
  dark?: boolean;
}

export default function StatusBar({ dark: propDark }: StatusBarProps) {
  const { theme } = useTheme();
  const isDark = propDark !== undefined ? propDark : theme === 'dark';

  const textColor = isDark ? 'text-white' : 'text-slate-900';
  const batteryBorder = isDark ? 'border-white' : 'border-slate-900';
  const batteryFill = isDark ? 'bg-white' : 'bg-slate-900';
  const notchBg = isDark ? 'bg-white/15' : 'bg-slate-900/10';

  return (
    <div className={`w-full pt-3 px-7 flex justify-between items-center z-20 shrink-0 select-none ${textColor}`} data-purpose="status-bar">
      <span className="text-[14px] font-semibold tracking-tight">9:41</span>
      {/* Notch / Dynamic Island pill */}
      <div className={`w-24 h-4 ${notchBg} rounded-full mx-auto hidden sm:block`}></div>
      <div className="flex items-center space-x-1.5">
        {/* Cellular Signal */}
        <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
          <path d="M2 17h3v4H2v-4zm6-5h3v9H8v-9zm6-5h3v14h-3V7zm6-5h3v19h-3V2z" />
        </svg>
        {/* Wifi */}
        <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
          <path d="M12 4C7.31 4 3.07 5.9 0 8.98L12 21 24 8.98A16.88 16.88 0 0012 4zm0 3.25c3.78 0 7.22 1.44 9.8 3.82L12 18.89 2.2 11.07A14.65 14.65 0 0112 7.25z" />
        </svg>
        {/* Battery */}
        <div className={`w-5 h-2.5 border ${batteryBorder} rounded-sm p-0.5 flex items-center`}>
          <div className={`h-full w-full ${batteryFill} rounded-[1px]`}></div>
        </div>
      </div>
    </div>
  );
}

