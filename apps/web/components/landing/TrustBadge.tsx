import { motion } from "framer-motion";
import { Zap, Shield, Globe, Cpu } from "lucide-react";

interface TrustBadgeProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  delay?: number;
}

function TrustBadge({ icon, title, description, delay = 0 }: TrustBadgeProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.5, type: "spring", stiffness: 100 }}
      className="group relative"
    >
      <div className="glass-card p-6 h-full transition-all duration-300 hover:border-primary/20">
        {/* Icon */}
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4 text-primary group-hover:bg-primary/20 transition-colors">
          {icon}
        </div>

        {/* Content */}
        <h3 className="font-semibold text-foreground mb-2">{title}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
      </div>
    </motion.div>
  );
}

export function TrustBadges() {
  const badges = [
    {
      icon: <Zap className="w-5 h-5" />,
      title: "Zero-runtime overhead",
      description: "Generates optimized, framework-native code with no hidden dependencies.",
    },
    {
      icon: <Globe className="w-5 h-5" />,
      title: "Edge-ready by default",
      description: "Deploy anywhere. Built for Vercel, Netlify, Cloudflare, and more.",
    },
    {
      icon: <Cpu className="w-5 h-5" />,
      title: "AI-native architecture",
      description: "Purpose-built for natural language to production-grade code.",
    },
    {
      icon: <Shield className="w-5 h-5" />,
      title: "Type-safe by design",
      description: "Full TypeScript support with intelligent type inference.",
    },
  ];

  return (
    <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {badges.map((badge, index) => (
        <TrustBadge
          key={badge.title}
          icon={badge.icon}
          title={badge.title}
          description={badge.description}
          delay={index * 0.1}
        />
      ))}
    </section>
  );
}