import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";

const codeLines = [
  { text: "// z0t is thinking...", delay: 800, isComment: true },
  { text: "", delay: 400 },
  { text: 'import { useState } from "react";', delay: 50 },
  { text: 'import { motion } from "framer-motion";', delay: 50 },
  { text: "", delay: 200 },
  { text: "export function Dashboard() {", delay: 50 },
  { text: "  const [data, setData] = useState([]);", delay: 50 },
  { text: "", delay: 100 },
  { text: "  return (", delay: 50 },
  { text: '    <motion.div className="grid gap-4">', delay: 50 },
  { text: "      <StatsCard title=\"Revenue\" value=\"$48,290\" />", delay: 80 },
  { text: "      <StatsCard title=\"Users\" value=\"12,847\" />", delay: 80 },
  { text: "      <ChartWidget data={data} />", delay: 50 },
  { text: "    </motion.div>", delay: 50 },
  { text: "  );", delay: 50 },
  { text: "}", delay: 50 },
];

interface CodeLineProps {
  text: string;
  isComment?: boolean;
}

function CodeLine({ text, isComment }: CodeLineProps) {
  if (!text) return <div className="h-5" />;

  // Simple syntax highlighting
  const highlightCode = (code: string) => {
    if (isComment) {
      return <span className="text-muted-foreground/60">{code}</span>;
    }

    return code.split(/(\s+)/).map((part, i) => {
      // Keywords
      if (["import", "from", "export", "function", "const", "return"].includes(part)) {
        return <span key={i} className="text-accent">{part}</span>;
      }
      // Strings
      if (part.startsWith('"') || part.startsWith("'")) {
        return <span key={i} className="text-vue">{part}</span>;
      }
      // JSX tags
      if (part.startsWith("<") || part.startsWith("</") || part.endsWith(">") || part.endsWith("/>")) {
        return <span key={i} className="text-primary">{part}</span>;
      }
      // Component names
      if (/^[A-Z][a-zA-Z]*$/.test(part)) {
        return <span key={i} className="text-svelte">{part}</span>;
      }
      return <span key={i}>{part}</span>;
    });
  };

  return (
    <div className="font-mono text-sm leading-6 whitespace-pre">
      {highlightCode(text)}
    </div>
  );
}

export function LiveTerminal() {
  const [visibleLines, setVisibleLines] = useState<typeof codeLines>([]);
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (currentLineIndex >= codeLines.length) {
      setIsTyping(false);
      // Reset after a pause
      setTimeout(() => {
        setVisibleLines([]);
        setCurrentLineIndex(0);
        setIsTyping(true);
      }, 4000);
      return;
    }

    const line = codeLines[currentLineIndex];
    const timeout = setTimeout(() => {
      setVisibleLines((prev) => [...prev, line]);
      setCurrentLineIndex((prev) => prev + 1);
    }, line.delay);

    return () => clearTimeout(timeout);
  }, [currentLineIndex]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [visibleLines]);

  return (
    <div className="glass-card overflow-hidden glow-subtle">
      {/* Terminal Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-hairline bg-surface-elevated/50">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-destructive/80" />
          <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
          <div className="w-3 h-3 rounded-full bg-vue/80" />
        </div>
        <span className="ml-2 text-xs text-muted-foreground font-mono">z0t — AI Code Generation</span>
      </div>

      {/* Terminal Content */}
      <div
        ref={containerRef}
        className="p-4 h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent"
      >
        {visibleLines.map((line, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.15 }}
          >
            <CodeLine text={line.text} isComment={line.isComment} />
          </motion.div>
        ))}

        {/* Cursor */}
        {isTyping && (
          <motion.span
            className="inline-block w-2 h-5 bg-primary ml-0.5"
            animate={{ opacity: [1, 0] }}
            transition={{ duration: 0.8, repeat: Infinity }}
          />
        )}
      </div>
    </div>
  );
}