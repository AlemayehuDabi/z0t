import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Check } from "lucide-react";
import { FrameworkIcon, frameworkConfig } from "../landing/FrameworkIcon";

const frameworks = ["react", "vue", "svelte", "solid", "astro"] as const;
type Framework = typeof frameworks[number];

interface FrameworkSelectorProps {
  value: Framework;
  onChange: (framework: Framework) => void;
}

export function FrameworkSelector({ value, onChange }: FrameworkSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const config = frameworkConfig[value];

  return (
    <div className="relative">
      {/* Trigger Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 px-4 py-2.5 rounded-lg glass-card hover:border-primary/30 transition-all group"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <FrameworkIcon framework={value} isActive size={24} />
        <span className="font-medium text-sm">{config.name}</span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        </motion.div>
      </motion.button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />

            {/* Menu */}
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="absolute top-full left-0 mt-2 w-56 z-50 glass-card p-2 glow-subtle"
            >
              {frameworks.map((framework) => {
                const fwConfig = frameworkConfig[framework];
                const isSelected = framework === value;

                return (
                  <motion.button
                    key={framework}
                    onClick={() => {
                      onChange(framework);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                      isSelected
                        ? "bg-primary/10 text-foreground"
                        : "hover:bg-secondary text-muted-foreground hover:text-foreground"
                    }`}
                    whileHover={{ x: 4 }}
                  >
                    <FrameworkIcon framework={framework} isActive={isSelected} size={20} />
                    <span className="font-medium text-sm flex-1 text-left">{fwConfig.name}</span>
                    {isSelected && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 400 }}
                      >
                        <Check className="w-4 h-4 text-primary" />
                      </motion.div>
                    )}
                  </motion.button>
                );
              })}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}