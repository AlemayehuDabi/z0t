import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FrameworkIcon, frameworkConfig } from "./FrameworkIcon";

const frameworks = ["react", "vue", "svelte", "solid", "astro"] as const;
type Framework = typeof frameworks[number];

export function FrameworkCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeFramework = frameworks[activeIndex];
  const config = frameworkConfig[activeFramework];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % frameworks.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative">
      {/* Ambient glow behind carousel */}
      <motion.div
        className="absolute -inset-8 rounded-full blur-3xl opacity-20"
        animate={{ backgroundColor: config.color }}
        transition={{ duration: 0.5 }}
      />

      {/* Framework Icons Row */}
      <div className="relative flex items-center justify-center gap-8">
        {frameworks.map((framework, index) => (
          <motion.button
            key={framework}
            onClick={() => setActiveIndex(index)}
            className="relative focus:outline-none"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <FrameworkIcon
              framework={framework}
              isActive={index === activeIndex}
              size={48}
            />
          </motion.button>
        ))}
      </div>

      {/* Active Framework Name */}
      <div className="mt-6 flex justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeFramework}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="flex items-center gap-2"
          >
            <motion.span
              className="text-sm font-medium tracking-wide"
              style={{ color: config.color }}
            >
              {config.name}
            </motion.span>
            <span className="text-muted-foreground text-sm">ready</span>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Dots indicator */}
      <div className="mt-4 flex justify-center gap-1.5">
        {frameworks.map((_, index) => (
          <motion.div
            key={index}
            className="h-1 rounded-full"
            animate={{
              width: index === activeIndex ? 24 : 6,
              backgroundColor: index === activeIndex ? config.color : "hsl(240, 5%, 25%)",
            }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
          />
        ))}
      </div>
    </div>
  );
}