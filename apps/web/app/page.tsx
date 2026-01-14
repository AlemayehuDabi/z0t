'use client'

import { Header } from "@/components/landing/Header";
import { HeroSection } from "@/components/landing/HeroSection";
import { TrustBadges } from "@/components/landing/TrustBadge";
import { Footer } from "@/components/landing/Footer";

const Home = () => {
  return (
    <div className="min-h-screen bg-background text-foreground px-10">
      <Header />
      
      <main>
        <HeroSection />
        
        {/* Trust Badges Section */}
        <section className="container pb-20">
          <TrustBadges />
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Home;