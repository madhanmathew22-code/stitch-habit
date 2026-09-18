import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';

interface HabitCompletionToggleProps {
  habitId: string;
  habitName: string;
  completed: boolean;
  onToggle: (id: string) => void;
}

interface Particle {
  id: number;
  x: number;
  y: number;
  color: string;
  size: number;
}

export default function HabitCompletionToggle({
  habitId,
  habitName,
  completed,
  onToggle,
}: HabitCompletionToggleProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [particles, setParticles] = useState<Particle[]>([]);

  const triggerCelebration = () => {
    // 1. Trigger Canvas Confetti at exact button viewport coordinates
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const x = (rect.left + rect.width / 2) / window.innerWidth;
      const y = (rect.top + rect.height / 2) / window.innerHeight;

      try {
        confetti({
          particleCount: 36,
          spread: 60,
          startVelocity: 22,
          origin: { x, y },
          colors: ['#10B981', '#34D399', '#6EE7B7', '#F59E0B', '#38BDF8', '#8B5CF6'],
          ticks: 180,
          gravity: 1.1,
          scalar: 0.7,
          disableForReducedMotion: true,
        });
      } catch (err) {
        // Fallback gracefully if canvas is constrained
      }
    }

    // 2. Spawn local micro-particles around the button for guaranteed responsive feedback
    const colors = ['#10B981', '#34D399', '#F59E0B', '#3B82F6', '#EC4899', '#8B5CF6'];
    const newParticles: Particle[] = Array.from({ length: 8 }, (_, idx) => {
      const angle = (idx / 8) * 2 * Math.PI + (Math.random() * 0.4 - 0.2);
      const distance = 22 + Math.random() * 14;
      return {
        id: Date.now() + idx,
        x: Math.cos(angle) * distance,
        y: Math.sin(angle) * distance,
        color: colors[idx % colors.length],
        size: 3 + Math.random() * 3,
      };
    });

    setParticles(newParticles);
    setTimeout(() => {
      setParticles([]);
    }, 700);
  };

  const handleToggleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!completed) {
      triggerCelebration();
    }
    onToggle(habitId);
  };

  return (
    <div className="relative flex items-center justify-center shrink-0">
      {/* Expanding Ripple Ring on Completion */}
      <AnimatePresence>
        {completed && (
          <motion.span
            key={`ripple-${habitId}`}
            initial={{ scale: 0.8, opacity: 0.7 }}
            animate={{ scale: 2.1, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.55, ease: 'easeOut' }}
            className="absolute inset-0 rounded-full bg-emerald-400 pointer-events-none -z-0"
          />
        )}
      </AnimatePresence>

      {/* Floating Micro-Confetti Sparkles */}
      <AnimatePresence>
        {particles.map((p) => (
          <motion.span
            key={p.id}
            initial={{ x: 0, y: 0, scale: 1, opacity: 1 }}
            animate={{
              x: p.x,
              y: p.y,
              scale: [1, 1.2, 0.4],
              opacity: [1, 0.9, 0],
            }}
            transition={{ duration: 0.65, ease: 'easeOut' }}
            style={{
              backgroundColor: p.color,
              width: p.size,
              height: p.size,
            }}
            className="absolute rounded-full pointer-events-none shadow-xs z-10"
          />
        ))}
      </AnimatePresence>

      {/* Interactive Spring Animated Checkbox Toggle */}
      <motion.button
        ref={buttonRef}
        type="button"
        id={`habit-toggle-${habitId}`}
        data-purpose="habit-completion-toggle"
        onClick={handleToggleClick}
        whileHover={{ scale: 1.14 }}
        whileTap={{ scale: 0.85 }}
        animate={
          completed
            ? {
                scale: [1, 1.28, 0.94, 1.04, 1],
                rotate: [0, 8, -5, 2, 0],
              }
            : { scale: 1, rotate: 0 }
        }
        transition={
          completed
            ? {
                duration: 0.45,
                ease: 'easeInOut',
              }
            : {
                duration: 0.2,
                ease: 'easeOut',
              }
        }
        aria-label={completed ? `Mark ${habitName} as incomplete` : `Mark ${habitName} as complete`}
        className={`w-7 h-7 rounded-full flex items-center justify-center cursor-pointer transition-colors shrink-0 select-none z-10 ${
          completed
            ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-300 ring-2 ring-emerald-400/50'
            : 'border-2 border-slate-200 hover:border-emerald-400 bg-white/90 hover:bg-emerald-50/40'
        }`}
      >
        <AnimatePresence mode="wait">
          {completed && (
            <motion.svg
              key="check-icon"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.5}
              viewBox="0 0 24 24"
            >
              <motion.path
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.25, ease: 'easeOut', delay: 0.05 }}
                d="M5 13l4 4L19 7"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </motion.svg>
          )}
        </AnimatePresence>
      </motion.button>
    </div>
  );
}
