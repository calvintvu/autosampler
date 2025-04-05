"use client";

import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import React from "react";
import { AnimatePresence } from "framer-motion";

function FloatingPaths({ position, count = 8 }) {
  const paths = Array.from({ length: count }, (_, i) => ({
    id: i,
    d: `M-${380 - i * 5 * position} -${189 + i * 6}C-${
      380 - i * 5 * position
    } -${189 + i * 6} -${312 - i * 5 * position} ${216 - i * 6} ${
      152 - i * 5 * position
    } ${343 - i * 6}C${616 - i * 5 * position} ${470 - i * 6} ${
      684 - i * 5 * position
    } ${875 - i * 6} ${684 - i * 5 * position} ${875 - i * 6}`,
    color: `rgba(15,23,42,${0.1 + i * 0.03})`,
    width: 0.5 + i * 0.03,
  }));

  return (
    <div className="absolute inset-0 pointer-events-none">
      <svg
        className="w-full h-full text-slate-950 dark:text-white py-100"
        viewBox="0 0 696 316"
        fill="none"
      >
        <title>Autosampler</title>
        {paths.map((path) => (
          <motion.path
            key={path.id}
            d={path.d}
            stroke="currentColor"
            strokeWidth={path.width}
            strokeOpacity={0.1 + path.id * 0.03}
            initial={{ pathLength: 0.3, opacity: 0.6 }}
            animate={{
              pathLength: 1,
              opacity: [0.3, 0.6, 0.3],
              pathOffset: [0, 1, 0],
            }}
            transition={{
              duration: 20 + Math.random() * 10,
              repeat: Number.POSITIVE_INFINITY,
              ease: "linear",
            }}
          />
        ))}
      </svg>
    </div>
  );
}

export default function LandingPage({
  title = "Autosampler",
  subtitle = "Accelerate your music with",
}) {
  const words = title.split(" ");
  const subtitleBase = subtitle.split(" ").slice(0, -1).join(" ");
  const [currentWord, setCurrentWord] = React.useState(0);
  const animatedWords = ["production", "ideation", "creation", "intuition"];
  const navigate = useNavigate();

  React.useEffect(() => {
    const interval = setInterval(() => {
      setCurrentWord((prev) => (prev + 1) % animatedWords.length);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-white dark:bg-neutral-950">
      <div className="absolute inset-0">
        <FloatingPaths position={1} count={18} />
        <FloatingPaths position={-1} count={18} />
        <FloatingPaths position={0.5} count={18} />
      </div>

      <div className="relative z-10 container mx-auto px-4 md:px-6 text-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 2 }}
          className="max-w-4xl mx-auto"
        >
          <h1 className="text-5xl sm:text-7xl md:text-8xl font-bold mb-6 tracking-tighter">
            {words.map((word, wordIndex) => (
              <span key={wordIndex} className="inline-block mr-4 last:mr-0">
                {word.split("").map((letter, letterIndex) => (
                  <motion.span
                    key={`${wordIndex}-${letterIndex}`}
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{
                      delay: wordIndex * 0.1 + letterIndex * 0.03,
                      type: "spring",
                      stiffness: 150,
                      damping: 100,
                    }}
                    className="inline-block text-transparent bg-clip-text 
                                          bg-gradient-to-r from-neutral-900 to-neutral-700/80 
                                          dark:from-white dark:to-white/80"
                  >
                    {letter}
                  </motion.span>
                ))}
              </span>
            ))}
          </h1>

          <div
            className="mb-10 text-xl sm:text-2xl md:text-3xl font-medium text-neutral-700 
             dark:text-neutral-300 relative left-2 sm:left-4"
          >
            <div className="inline-flex items-center">
              <span>{subtitleBase}</span>
              <div className="relative ml-2 min-w-[180px] text-left">
                <AnimatePresence initial={false} mode="wait">
                  <motion.span
                    key={animatedWords[currentWord]}
                    className="font-bold text-transparent bg-clip-text bg-gradient-to-r 
                     from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{
                      opacity: { duration: 0.5, ease: "easeInOut" },
                    }}
                  >
                    {animatedWords[currentWord]}
                  </motion.span>
                </AnimatePresence>
              </div>
            </div>
          </div>

          <div
            className="inline-block group relative bg-gradient-to-b from-black/10 to-white/10 
                          dark:from-white/10 dark:to-black/10 p-px rounded-2xl backdrop-blur-lg 
                          overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300"
          >
            <Button
              variant="ghost"
              className="rounded-[1.15rem] px-8 py-6 text-lg font-semibold backdrop-blur-md 
                              bg-white/95 hover:bg-white/100 dark:bg-black/95 dark:hover:bg-black/100 
                              text-black dark:text-white transition-all duration-300 
                              group-hover:-translate-y-0.5 border border-black/10 dark:border-white/10
                              hover:shadow-md dark:hover:shadow-neutral-800/50"
              onClick={() => navigate("/dashboard")}
            >
              <span className="opacity-90 group-hover:opacity-100 transition-opacity">
                Get Started
              </span>
              <span
                className="ml-3 opacity-70 group-hover:opacity-100 group-hover:translate-x-1.5 
                                  transition-all duration-300"
              >
                →
              </span>
            </Button>
          </div>
        </motion.div>
        <div className="mt-16 text-center text-gray-500">
          <p>© 2025 Autosampler (in development), by Calvin Vu</p>
        </div>
        <div className="mt-16 text-center text-gray-500">
          <p>
            View source code{" "}
            <a
              href="https://github.com/calvintvu/autosampler"
              target="_blank"
              rel="noopener noreferrer"
              className="underline text-blue-500"
            >
              here
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
