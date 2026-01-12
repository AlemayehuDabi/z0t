import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Monitor, Smartphone, RefreshCw, Gauge } from "lucide-react";
import { frameworkConfig } from "../landing/FrameworkIcon";

type Framework = "react" | "vue" | "svelte" | "solid" | "astro";
type Device = "desktop" | "mobile";

interface PreviewConsoleProps {
  framework: Framework;
}

const speedScores: Record<Framework, number> = {
  react: 82,
  vue: 86,
  svelte: 95,
  solid: 97,
  astro: 92,
};

export function PreviewConsole({ framework }: PreviewConsoleProps) {
  const [device, setDevice] = useState<Device>("desktop");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const config = frameworkConfig[framework];
  const speed = speedScores[framework];

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  return (
    <div className="flex flex-col h-full bg-card rounded-xl border border-border overflow-hidden">
      {/* Browser Chrome */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-surface-elevated">
        {/* URL Bar */}
        <div className="flex items-center gap-3 flex-1">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-destructive/60" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
            <div className="w-3 h-3 rounded-full bg-vue/60" />
          </div>
          <div className="flex-1 max-w-md">
            <div className="flex items-center gap-2 bg-secondary rounded-md px-3 py-1.5">
              <span className="text-xs text-muted-foreground">localhost:3000</span>
            </div>
          </div>
          <motion.button
            onClick={handleRefresh}
            className="p-1.5 rounded-md hover:bg-secondary transition-colors"
            animate={{ rotate: isRefreshing ? 360 : 0 }}
            transition={{ duration: 0.5 }}
          >
            <RefreshCw className="w-4 h-4 text-muted-foreground" />
          </motion.button>
        </div>

        {/* Device Toggle */}
        <div className="flex items-center gap-1 ml-4">
          <button
            onClick={() => setDevice("desktop")}
            className={`p-1.5 rounded-md transition-colors ${
              device === "desktop" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-secondary"
            }`}
          >
            <Monitor className="w-4 h-4" />
          </button>
          <button
            onClick={() => setDevice("mobile")}
            className={`p-1.5 rounded-md transition-colors ${
              device === "mobile" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-secondary"
            }`}
          >
            <Smartphone className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Preview Content */}
      <div className="flex-1 relative flex items-center justify-center p-8 bg-background/50">
        <AnimatePresence mode="wait">
          <motion.div
            key={`${framework}-${device}`}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className={`bg-background border border-border rounded-lg shadow-2xl ${
              device === "desktop" ? "w-full h-full" : "w-80 h-full max-h-[500px]"
            }`}
          >
            {/* Sample App Content */}
            <div className="p-6">
              <div className="space-y-4">
                <div className="h-8 w-48 bg-secondary rounded-md" />
                <div className="h-4 w-full bg-secondary/50 rounded" />
                <div className="h-4 w-3/4 bg-secondary/50 rounded" />
                <div className="mt-6 grid grid-cols-2 gap-4">
                  <div className="h-24 bg-secondary rounded-lg" />
                  <div className="h-24 bg-secondary rounded-lg" />
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Speed Meter */}
      <div className="px-4 py-3 border-t border-border bg-surface-elevated">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Gauge className="w-4 h-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Performance Score</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-24 h-1.5 bg-secondary rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{ backgroundColor: config.color }}
                initial={{ width: 0 }}
                animate={{ width: `${speed}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
            </div>
            <motion.span
              key={speed}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-sm font-semibold tabular-nums"
              style={{ color: config.color }}
            >
              {speed}
            </motion.span>
          </div>
        </div>
      </div>
    </div>
  );
}