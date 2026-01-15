import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Github, Menu } from "lucide-react";
import { useState } from "react";
import Link from "next/link";

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 left-0 right-0 z-50"
    >
      <div className="mx-4 mt-4">
        <div className="glass-card backdrop-blur-xl border-hairline">
          <div className="container flex items-center justify-between h-14 px-4">
            {/* Logo */}
            <a href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-linear-to-br from-primary to-accent flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">z0</span>
              </div>
              <span className="font-semibold text-lg tracking-tight">z0t</span>
            </a>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-6">
              <Link href="/features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Features
              </Link>
              <Link href="/pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Pricing
              </Link>
              <Link href="/docs" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Docs
              </Link>
            </nav>

            {/* Desktop CTA */}
            <div className="hidden md:flex items-center gap-3">
              <Link href="/">
                <Button variant="ghost" size="sm" className="gap-2">
                  <Github className="w-4 h-4" />
                  GitHub
                </Button>
              </Link>
              
              <Link href="/auth">
                <Button size="sm">Get Started</Button>
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 text-muted-foreground hover:text-foreground"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-hairline"
            >
              <div className="p-4 space-y-3">
                <Link href="#features" className="block text-sm text-muted-foreground hover:text-foreground">
                  Features
                </Link>
                <Link href="#pricing" className="block text-sm text-muted-foreground hover:text-foreground">
                  Pricing
                </Link>
                <Link href="#docs" className="block text-sm text-muted-foreground hover:text-foreground">
                  Docs
                </Link>
                <div className="pt-3 flex gap-2">
                  <Link href="/">
                  <Button variant="ghost" size="sm" className="gap-2 flex-1">
                    <Github className="w-4 h-4" />
                    GitHub
                  </Button>
                  </Link>
                  <Link href="/auth">
                    <Button size="sm" className="flex-1">
                      Get Started
                    </Button>
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </motion.header>
  );
}