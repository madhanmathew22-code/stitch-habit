import StatusBar from './StatusBar';
import HomeIndicator from './HomeIndicator';

interface OnboardingScreenProps {
  onNavigateHome: () => void;
}

export default function OnboardingScreen({ onNavigateHome }: OnboardingScreenProps) {
  return (
    <div className="w-full h-full bg-white/90 backdrop-blur-md flex flex-col justify-between relative overflow-hidden select-none">
      <StatusBar />

      {/* Top Container: Header and Hero Copy */}
      <div className="flex flex-col flex-grow px-7 pt-4 pb-2 justify-between">
        {/* NavigationHeader */}
        <header className="w-full flex justify-between items-center py-2" data-purpose="app-navigation">
          {/* Brand Logo */}
          <div className="flex items-center space-x-1.5 cursor-pointer select-none">
            {/* Leaf Logo Glyph */}
            <div className="w-7 h-7 flex items-center justify-center">
              <svg className="w-6 h-6 transform -rotate-12" fill="none" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                <path d="M27.5 4.5C27.5 4.5 17 4 9.5 11.5C3.5 17.5 4 27.5 4 27.5C4 27.5 14 28 20 22C27.5 14.5 27.5 4.5 27.5 4.5Z" fill="#10B981" />
                <path d="M4 27.5C11 25.5 18 18 27.5 4.5" stroke="#047857" strokeLinecap="round" strokeWidth="2.2" />
              </svg>
            </div>
            {/* Brand Text */}
            <div className="text-[21px] tracking-tight font-extrabold leading-none">
              <span className="text-slate-900">Habit</span>
              <span className="text-[#10B981]">Flow</span>
            </div>
          </div>

          {/* Skip Action Link */}
          <button
            id="onboarding-skip-btn"
            onClick={onNavigateHome}
            className="text-slate-500 hover:text-slate-800 text-[15px] font-medium transition-colors px-1 py-1 focus:outline-none focus:ring-2 focus:ring-emerald-500 rounded cursor-pointer"
            type="button"
          >
            Skip
          </button>
        </header>

        {/* HeroContent */}
        <section className="mt-6 mb-2" data-purpose="hero-copy">
          <h1 className="text-[34px] sm:text-[38px] font-bold text-slate-900 tracking-tight leading-[1.12]">
            A Healthier,<br />
            Happier You<br />
            Starts Here
          </h1>
          <p className="mt-3.5 text-[15px] leading-relaxed text-slate-500 font-normal max-w-[290px]">
            Build good habits, break bad ones and achieve your goals — one day at a time.
          </p>
        </section>

        {/* HeroIllustration */}
        <section className="flex-grow flex items-center justify-center my-2 relative" data-purpose="zen-illustration">
          <div className="relative w-full max-w-[280px] aspect-square flex items-center justify-center">
            {/* Sun Glow Backdrop */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-56 h-56 rounded-full bg-gradient-to-tr from-amber-200/50 via-yellow-100/60 to-transparent blur-2xl"></div>
              <div className="w-40 h-40 rounded-full bg-gradient-to-b from-amber-100/70 to-yellow-200/30"></div>
            </div>

            {/* SVG Sprout and Zen Stones Illustration */}
            <svg className="relative z-10 w-full h-full max-h-[260px] drop-shadow-sm" fill="none" viewBox="0 0 320 320" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <radialGradient cx="50%" cy="50%" id="sunGlow" r="50%">
                  <stop offset="0%" stopColor="#FEF08A" stopOpacity="0.8" />
                  <stop offset="70%" stopColor="#FEF9C3" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
                </radialGradient>
                <linearGradient id="stoneBaseGrad" x1="0%" x2="100%" y1="0%" y2="100%">
                  <stop offset="0%" stopColor="#64748B" />
                  <stop offset="50%" stopColor="#475569" />
                  <stop offset="100%" stopColor="#334155" />
                </linearGradient>
                <linearGradient id="stoneDarkGrad" x1="0%" x2="100%" y1="0%" y2="100%">
                  <stop offset="0%" stopColor="#475569" />
                  <stop offset="100%" stopColor="#1E293B" />
                </linearGradient>
                <linearGradient id="stoneLightGrad" x1="0%" x2="100%" y1="0%" y2="100%">
                  <stop offset="0%" stopColor="#94A3B8" />
                  <stop offset="100%" stopColor="#64748B" />
                </linearGradient>
                <linearGradient id="leafGradMain" x1="20%" x2="90%" y1="0%" y2="100%">
                  <stop offset="0%" stopColor="#4ADE80" />
                  <stop offset="40%" stopColor="#22C55E" />
                  <stop offset="100%" stopColor="#15803D" />
                </linearGradient>
                <linearGradient id="leafGradSecondary" x1="0%" x2="100%" y1="0%" y2="100%">
                  <stop offset="0%" stopColor="#86EFAC" />
                  <stop offset="60%" stopColor="#22C55E" />
                  <stop offset="100%" stopColor="#166534" />
                </linearGradient>
              </defs>

              <circle cx="160" cy="140" fill="url(#sunGlow)" r="85" />
              <ellipse cx="160" cy="265" fill="#E2E8F0" rx="85" ry="12" />

              {/* Zen Stones Stack */}
              <path d="M95 245 C95 228 115 220 145 222 C170 224 185 235 180 252 C178 259 155 264 125 262 C105 260 95 253 95 245 Z" fill="url(#stoneBaseGrad)" />
              <path d="M150 240 C145 225 175 212 205 218 C232 223 242 238 238 250 C234 262 205 264 175 260 C155 257 150 248 150 240 Z" fill="url(#stoneDarkGrad)" />
              <path d="M120 228 C115 208 140 196 175 198 C205 200 215 215 210 230 C205 242 170 245 140 242 C125 240 120 235 120 228 Z" fill="url(#stoneLightGrad)" />
              <path d="M130 195 C128 178 150 168 175 172 C200 175 208 190 202 204 C198 214 170 218 148 214 C135 210 130 203 130 195 Z" fill="url(#stoneDarkGrad)" />

              <ellipse cx="162" cy="254" fill="url(#stoneLightGrad)" rx="26" ry="12" />
              <ellipse cx="128" cy="256" fill="url(#stoneDarkGrad)" rx="16" ry="7" />

              {/* Green Sprout Plant */}
              <path d="M164 185 C164 165 163 125 160 90" stroke="#15803D" strokeLinecap="round" strokeWidth="4.5" />
              <path d="M164 185 C164 165 163 125 160 90" stroke="#22C55E" strokeLinecap="round" strokeWidth="2.5" />

              <path d="M162 135 C145 130 110 120 115 90 C125 72 155 98 162 118 Z" fill="url(#leafGradMain)" />
              <path d="M122 88 C135 105 150 118 162 124" opacity="0.7" stroke="#86EFAC" strokeLinecap="round" strokeWidth="1.2" />

              <path d="M160 110 C175 95 215 80 215 115 C215 142 180 142 161 126 Z" fill="url(#leafGradSecondary)" />
              <path d="M210 105 C195 118 178 123 162 124" opacity="0.6" stroke="#DCFCE7" strokeLinecap="round" strokeWidth="1.2" />

              <path d="M160 92 C155 75 162 55 170 54 C178 54 182 72 163 90 Z" fill="#4ADE80" />
              <path d="M163 158 C152 154 135 150 138 138 C144 130 158 142 163 152 Z" fill="url(#leafGradMain)" />
            </svg>
          </div>
        </section>

        {/* ActionArea */}
        <footer className="w-full pt-2 pb-6" data-purpose="cta-section">
          <button
            id="onboarding-get-started-btn"
            onClick={onNavigateHome}
            className="w-full bg-[#10B981] hover:bg-[#059669] active:bg-[#047857] text-white font-semibold text-[17px] tracking-wide py-4 px-6 rounded-full shadow-[0_10px_25px_-3px_rgba(16,185,129,0.35),0_4px_6px_-4px_rgba(16,185,129,0.2)] flex items-center justify-center space-x-2 transition-all duration-200 transform active:scale-[0.98] cursor-pointer"
            type="button"
          >
            <span>Get Started</span>
            <span className="text-xl leading-none font-normal">→</span>
          </button>
        </footer>
      </div>

      <HomeIndicator />
    </div>
  );
}
