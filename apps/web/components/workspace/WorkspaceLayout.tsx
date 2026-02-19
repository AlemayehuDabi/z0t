'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Save,
  Cloud,
  Code2,
  Rocket,
  ChevronDown,
  Terminal,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FrameworkSelector } from './FrameworkSelector';
import { PreviewConsole } from './PreviewConsole';
import { ChatSidebar } from './ChatSidebar';
import { CodeEditor } from './CodeEditor';

type Framework = 'react' | 'vue' | 'svelte' | 'solid' | 'astro';

export function WorkspaceLayout() {
  const [framework, setFramework] = useState<Framework>('react');
  const [isCodeOpen, setIsCodeOpen] = useState(false);
  const [isTerminalOpen, setIsTerminalOpen] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'live'>(
    'live',
  );

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      {/* Top Header */}
      <header className="flex items-center justify-between px-4 py-2 border-b border-border bg-card">
        {/* Left: Logo + Project Name */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-linear-to-br from-primary to-accent flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-xs">
                z0t
              </span>
            </div>
            <span className="font-semibold text-sm">z0t</span>
          </div>

          <div className="h-5 w-px bg-border" />

          {/* Project Name */}
          <div className="flex items-center gap-2">
            <input
              type="text"
              defaultValue="my-dashboard-app"
              className="bg-transparent text-sm font-medium focus:outline-none focus:ring-1 focus:ring-primary rounded px-2 py-1 -ml-2"
            />

            {/* Save Status */}
            <div className="flex items-center gap-1.5">
              {saveStatus === 'live' && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="flex items-center gap-1 text-xs text-vue"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-vue animate-pulse" />
                  Live
                </motion.span>
              )}
              {saveStatus === 'saving' && (
                <span className="text-xs text-muted-foreground">Saving...</span>
              )}
              {saveStatus === 'saved' && (
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Cloud className="w-3 h-3" />
                  Saved
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Center: Framework Selector */}
        <div className="absolute left-1/2 -translate-x-1/2">
          <FrameworkSelector value={framework} onChange={setFramework} />
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCodeOpen(!isCodeOpen)}
            className={isCodeOpen ? 'bg-secondary' : ''}
          >
            <Code2 className="w-4 h-4 mr-1.5" />
            Code
          </Button>
          <Button size="sm" className="gap-1.5">
            <Rocket className="w-4 h-4" />
            Ship
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Chat */}
        <div className="w-80 border-r border-border shrink-0">
          <ChatSidebar />
        </div>

        {/* Center/Right - Preview */}
        <div className="flex-1 flex flex-col min-w-0">
          <div className="flex-1 p-4">
            <PreviewConsole framework={framework} />
          </div>

          {/* Bottom Terminal Toggle */}
          <motion.div
            initial={false}
            animate={{ height: isTerminalOpen ? 200 : 0 }}
            className="border-t border-border bg-card overflow-hidden"
          >
            <div className="flex items-center justify-between px-4 py-2 border-b border-border">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Terminal className="w-3.5 h-3.5" />
                Terminal
              </div>
              <button
                onClick={() => setIsTerminalOpen(false)}
                className="p-1 rounded hover:bg-secondary transition-colors"
              >
                <X className="w-3.5 h-3.5 text-muted-foreground" />
              </button>
            </div>
            <div className="p-4 font-mono text-xs text-muted-foreground">
              <p>$ z0t build --framework={framework}</p>
              <p className="text-vue mt-1">✓ Build completed in 0.42s</p>
            </div>
          </motion.div>

          {/* Terminal Toggle Button */}
          {!isTerminalOpen && (
            <button
              onClick={() => setIsTerminalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 text-xs text-muted-foreground hover:text-foreground border-t border-border hover:bg-secondary/50 transition-colors"
            >
              <Terminal className="w-3.5 h-3.5" />
              Terminal
              <ChevronDown className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Code Editor Drawer */}
      <CodeEditor
        isOpen={isCodeOpen}
        onClose={() => setIsCodeOpen(false)}
        framework={framework}
      />
    </div>
  );
}
