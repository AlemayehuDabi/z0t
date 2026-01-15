'use client'

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, ArrowRight, Github, Chrome } from 'lucide-react';
import { Button } from '../ui/button';

export function AuthComp() {
  const [isLogin, setIsLogin] = useState(true);

  const  handleAuth = () => {
    try {
      
    } catch (error) {
      console.log("error: ", error)
    }
  }

  return (
    <div className="min-h-screen w-full bg-[#030303] flex items-center justify-center p-4 overflow-hidden relative">
      {/* Dynamic Background Effects */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-900/20 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-900/20 blur-[120px] rounded-full" />

      <motion.div
        layout
        className="relative w-full max-w-[1000px] min-h-[600px] bg-white/2 border border-white/5 backdrop-blur-2xl rounded-3xl flex overflow-hidden shadow-2xl"
      >
        {/* Sliding Side Overlay (The Visual Effect) */}
        <motion.div
          animate={{ x: isLogin ? '0%' : '100%' }}
          transition={{ type: "spring", stiffness: 40, damping: 15 }}
          className="absolute top-0 left-0 w-1/2 h-full bg-linear-to-br from-purple-600 via-blue-600 to-cyan-500 z-10 hidden md:flex flex-col items-center justify-center p-12 text-white"
        >
          <motion.div
            key={isLogin ? 'login-text' : 'signup-text'}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="text-center"
          >
            <h2 className="text-4xl font-bold mb-4">
              {isLogin ? "Welcome Back!" : "Join the coding Community"}
            </h2>
            <p className="text-white/80 text-lg mb-8 leading-relaxed">
              {isLogin 
                ? "Continue building high-performance applications with z0t." 
                : "Turn ideas into production-ready apps using AI, across any modern framework."}
            </p>
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="px-8 py-3 border-2 border-white/30 rounded-full hover:bg-white hover:text-blue-600 transition-all duration-300 font-medium tracking-wide"
            >
              {isLogin ? "Create an Account" : "Sign In"}
            </button>
          </motion.div>
        </motion.div>

        {/* --- Forms Container --- */}
        {/* sign up */}
        <div className="w-full md:w-1/2 h-full p-8 md:p-16 flex flex-col justify-center bg-transparent z-0">
            <AuthForm type="signup" isVisible={!isLogin} onToggle={() => setIsLogin(true)} />
        </div>
        
        {/* login */}
        <div className="w-full md:w-1/2 h-full p-8 md:p-16 flex flex-col justify-center bg-transparent z-0">
            <AuthForm type="login" isVisible={isLogin} onToggle={() => setIsLogin(false)} />
        </div>
      </motion.div>
    </div>
  );
}

function AuthForm({ type, isVisible, onToggle }: { type: 'login' | 'signup', isVisible: boolean, onToggle: () => void }) {
  return (
    <AnimatePresence mode="wait">
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, x: type === 'login' ? -50 : 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: type === 'login' ? -50 : 50 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="w-full"
        >
          <div className="mb-10">
            <h1 className="text-3xl font-bold text-white mb-2">
              {type === 'login' ? 'Sign In' : 'Sign Up'}
            </h1>
            <p className="text-gray-400">Please enter your details to proceed.</p>
          </div>

          <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
            {type === 'signup' && (
              <InputGroup icon={<User size={18} />} label="Full Name" placeholder="John Doe" />
            )}
            <InputGroup icon={<Mail size={18} />} label="Email Address" placeholder="name@example.com" />
            <InputGroup icon={<Lock size={18} />} label="Password" type="password" placeholder="••••••••" />

            <Button 
            size="lg"
            className="w-full rounded-xl font-semibold flex items-center justify-center gap-2 group transition-all"
            >
              {type === 'login' ? 'Enter Dashboard' : 'Create Account'}
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Button>
          </form>

          <div className="mt-8">
            <div className="relative flex items-center justify-center mb-6">
              <div className="w-full border-t border-white/10"></div>
              <span className="absolute bg-[#0b0b0b] px-4 text-sm text-gray-500">Or continue with</span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <SocialButton icon={<Chrome size={20} />} label="Google" />
              <SocialButton icon={<Github size={20} />} label="GitHub" />
            </div>
          </div>

          <p className="mt-8 text-center text-gray-400 text-sm md:hidden">
            {type === 'login' ? "Don't have an account?" : "Already have an account?"}{' '}
            <button onClick={onToggle} className="text-blue-500 font-medium">
                {type === 'login' ? 'Sign Up' : 'Sign In'}
            </button>
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function InputGroup({ icon, label, type = "text", placeholder }: { icon: React.ReactNode, label: string, type?: string, placeholder: string }) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-300 ml-1">{label}</label>
      <div className="relative group">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-blue-500 transition-colors">
          {icon}
        </div>
        <input
          type={type}
          placeholder={placeholder}
          className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder:text-gray-600 outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all"
        />
      </div>
    </div>
  );
}

function SocialButton({ icon, label }: { icon: React.ReactNode, label: string }) {
  return (
    <button className="flex items-center justify-center gap-2 bg-white/5 border border-white/10 py-2.5 rounded-xl text-white hover:bg-white/10 transition-colors">
      {icon}
      <span className="text-sm font-medium">{label}</span>
    </button>
  );
}