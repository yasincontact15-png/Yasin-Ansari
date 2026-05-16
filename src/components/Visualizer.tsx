import { motion, AnimatePresence } from "motion/react";
import { useEffect, useState } from "react";

type VisualizerState = "idle" | "listening" | "processing" | "speaking";

interface VisualizerProps {
  state: VisualizerState;
}

function ProcessingBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ 
            x: Math.random() * 100 - 50 + "%", 
            y: Math.random() * 100 - 50 + "%",
            opacity: 0,
            scale: 0.5
          }}
          animate={{ 
            x: [
              Math.random() * 100 - 50 + "%", 
              Math.random() * 100 - 50 + "%", 
              Math.random() * 100 - 50 + "%"
            ],
            y: [
              Math.random() * 100 - 50 + "%", 
              Math.random() * 100 - 50 + "%", 
              Math.random() * 100 - 50 + "%"
            ],
            opacity: [0, 0.4, 0],
            scale: [0.5, 1.5, 0.5],
            rotate: [0, 180, 360]
          }}
          transition={{ 
            duration: 4 + Math.random() * 4, 
            repeat: Infinity, 
            ease: "linear" 
          }}
          className="absolute w-32 h-32 bg-cyan-500/20 rounded-full blur-2xl"
          style={{ top: "50%", left: "50%" }}
        />
      ))}
      <svg className="absolute inset-0 w-full h-full opacity-30">
        <defs>
          <filter id="liquid">
            <feGaussianBlur in="SourceGraphic" stdDeviation="15" result="blur" />
            <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7" result="liquid" />
          </filter>
        </defs>
        <motion.g filter="url(#liquid)">
          {[...Array(5)].map((_, i) => (
            <motion.circle
              key={i}
              cx="50%"
              cy="50%"
              r={100 + i * 40}
              fill="none"
              stroke="rgba(34, 211, 238, 0.5)"
              strokeWidth="20"
              animate={{
                scale: [1, 1.2, 1],
                rotate: [0, 360],
                opacity: [0.2, 0.5, 0.2]
              }}
              transition={{
                duration: 5 + i,
                repeat: Infinity,
                ease: "linear"
              }}
            />
          ))}
        </motion.g>
      </svg>
    </div>
  );
}

export default function Visualizer({ state }: VisualizerProps) {
  const [jitter, setJitter] = useState(1);

  useEffect(() => {
    if (state === "speaking") {
      const interval = setInterval(() => {
        setJitter(0.98 + Math.random() * 0.08);
      }, 100);
      return () => clearInterval(interval);
    } else {
      setJitter(1);
    }
  }, [state]);

  const getRingAnimation = (index: number, reverse: boolean = false) => {
    const baseSpeed = state === "listening" ? 4 : state === "processing" ? 1 : state === "speaking" ? 2.5 : 20;
    return {
      rotate: reverse ? [-360, 0] : [0, 360],
      transition: { duration: baseSpeed + index * 2.5, repeat: Infinity, ease: "linear" }
    };
  };

  const getPulseAnimation = () => {
    if (state === "speaking") {
      return {
        scale: [1 * jitter, 1.05 * jitter, 0.98 * jitter, 1],
        opacity: [0.8, 1, 0.9, 1],
        transition: { duration: 0.15, repeat: 0, ease: "easeOut" }
      };
    }
    if (state === "listening") {
      return {
        scale: [1, 1.02, 1],
        opacity: [0.7, 1, 0.7],
        transition: { duration: 1.5, repeat: Infinity, ease: "easeInOut" }
      };
    }
    if (state === "processing") {
      return {
        scale: [0.95, 1.1, 0.95],
        opacity: [0.5, 1, 0.5],
        transition: { duration: 0.6, repeat: Infinity, ease: "linear" }
      };
    }
    return {
      scale: [1, 1.01, 1],
      opacity: [0.3, 0.5, 0.3],
      transition: { duration: 5, repeat: Infinity, ease: "easeInOut" }
    };
  };

  const getTheme = () => {
    switch (state) {
      case "listening": return { color: "rgba(59, 130, 246, 1)", glow: "shadow-blue-500/60", border: "border-blue-400" };
      case "processing": return { color: "rgba(34, 211, 238, 1)", glow: "shadow-cyan-400/80", border: "border-cyan-400" };
      case "speaking": return { color: "rgba(255, 255, 255, 1)", glow: "shadow-white/60", border: "border-white" };
      default: return { color: "rgba(6, 182, 212, 0.8)", glow: "shadow-cyan-500/40", border: "border-cyan-500/50" };
    }
  };

  const theme = getTheme();

  return (
    <div className="absolute inset-0 flex items-center justify-center overflow-hidden pointer-events-none">
      <AnimatePresence>
        {state === "processing" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-0"
          >
            <ProcessingBackground />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Ambient Glow */}
      <motion.div
        animate={getPulseAnimation()}
        className={`absolute w-[70dvh] h-[70dvh] rounded-full blur-[100px] ${theme.glow}`}
        style={{ backgroundColor: theme.color, opacity: 0.2 }}
      />

      {/* Rings Layer */}
      <div className="absolute inset-0 flex items-center justify-center opacity-40">
        {[4, 3, 2, 1, 0].map((i) => (
          <motion.div
            key={i}
            animate={getRingAnimation(i, i % 2 === 0)}
            className={`absolute rounded-full border-[1.5px] ${theme.border} ${i % 2 === 0 ? 'border-dashed' : 'border-dotted'}`}
            style={{ 
              width: `${40 + i * 15}%`, 
              height: `${40 + i * 15}%`,
              opacity: 0.2 + (1 - i / 5) * 0.5
            }}
          />
        ))}
      </div>

      {/* Core UI Container */}
      <motion.div
        animate={getPulseAnimation()}
        className={`
          relative w-[85%] max-w-[700px] h-[55%] 
          rounded-[60px] md:rounded-[120px] 
          flex flex-col items-center justify-center 
          shadow-[0_0_120px_rgba(34,211,238,0.2)] 
          overflow-hidden backdrop-blur-md
        `}
        style={{ 
          backgroundColor: state === "speaking" ? "rgba(255,255,255,1)" : theme.color,
          boxShadow: `0 0 100px ${theme.color}${state === "speaking" ? '66' : '33'}`
        }}
      >
        {/* Dynamic Scan Line (Processing only) */}
        {state === "processing" && (
          <motion.div 
            animate={{ y: ["-100%", "100%"] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            className="absolute inset-x-0 h-2 bg-white/20 blur-sm z-10"
          />
        )}

        <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent pointer-events-none" />
        
        {/* Animated Text Core */}
        <motion.div 
          animate={state === "speaking" ? {
            scale: [1, 1.02 * jitter, 1],
            filter: [`drop-shadow(0 0 10px ${theme.color}44)`, `drop-shadow(0 0 25px ${theme.color}aa)`, `drop-shadow(0 0 10px ${theme.color}44)`]
          } : {}}
          className={`
            font-sans font-black tracking-[0.2em] 
            text-4xl md:text-6xl lg:text-7xl 
            text-center px-12 leading-[1.1] uppercase
            transition-colors duration-500
            ${state === "speaking" ? "text-[#020408]" : "text-white"}
          `}
        >
          Yasin<br />
          <span className={state === "processing" ? "animate-pulse" : ""}>Assistant</span>
        </motion.div>

        {/* Decorative HUD Details */}
        <div className="absolute top-8 left-8 w-4 h-4 border-t-2 border-l-2 border-white/40" />
        <div className="absolute top-8 right-8 w-4 h-4 border-t-2 border-r-2 border-white/40" />
        <div className="absolute bottom-8 left-8 w-4 h-4 border-b-2 border-l-2 border-white/40" />
        <div className="absolute bottom-8 right-8 w-4 h-4 border-b-2 border-r-2 border-white/40" />
      </motion.div>
    </div>
  );
}

