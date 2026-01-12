import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Code2 } from "lucide-react";
import { frameworkConfig } from "../landing/FrameworkIcon";

type Framework = "react" | "vue" | "svelte" | "solid" | "astro";

interface CodeEditorProps {
  isOpen: boolean;
  onClose: () => void;
  framework: Framework;
}

const sampleCode: Record<Framework, string> = {
  react: `import { useState } from "react";

export function Dashboard() {
  const [count, setCount] = useState(0);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <button onClick={() => setCount(c => c + 1)}>
        Count: {count}
      </button>
    </div>
  );
}`,
  vue: `<script setup>
import { ref } from 'vue'

const count = ref(0)
</script>

<template>
  <div class="p-8">
    <h1 class="text-2xl font-bold">Dashboard</h1>
    <button @click="count++">
      Count: {{ count }}
    </button>
  </div>
</template>`,
  svelte: `<script>
  let count = 0;
</script>

<div class="p-8">
  <h1 class="text-2xl font-bold">Dashboard</h1>
  <button on:click={() => count++}>
    Count: {count}
  </button>
</div>`,
  solid: `import { createSignal } from "solid-js";

export function Dashboard() {
  const [count, setCount] = createSignal(0);

  return (
    <div class="p-8">
      <h1 class="text-2xl font-bold">Dashboard</h1>
      <button onClick={() => setCount(c => c + 1)}>
        Count: {count()}
      </button>
    </div>
  );
}`,
  astro: `---
let count = 0;
---

<div class="p-8">
  <h1 class="text-2xl font-bold">Dashboard</h1>
  <button id="counter">
    Count: <span id="count">{count}</span>
  </button>
</div>

<script>
  let count = 0;
  document.getElementById('counter').addEventListener('click', () => {
    count++;
    document.getElementById('count').textContent = count;
  });
</script>`,
};

export function CodeEditor({ isOpen, onClose, framework }: CodeEditorProps) {
  const config = frameworkConfig[framework];
  const code = sampleCode[framework];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed right-0 top-0 bottom-0 w-[500px] bg-card border-l border-border z-50 flex flex-col shadow-2xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <div className="flex items-center gap-2">
              <Code2 className="w-4 h-4" style={{ color: config.color }} />
              <span className="font-medium text-sm">Generated Code</span>
              <span 
                className="px-2 py-0.5 rounded-full text-xs font-medium"
                style={{ backgroundColor: `${config.color}20`, color: config.color }}
              >
                {config.name}
              </span>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-md hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Code Content */}
          <div className="flex-1 overflow-auto p-4">
            <pre className="font-mono text-sm leading-relaxed">
              <code className="text-muted-foreground">{code}</code>
            </pre>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}