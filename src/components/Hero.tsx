import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      {/* Video Background */}
      <video
        className="absolute inset-0 w-full h-full object-cover z-0"
        autoPlay
        muted
        loop
        playsInline
      >
        <source src="/vd.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      
      {/* Dark Overlay for Contrast */}
      <div className="absolute inset-0 z-[1]" style={{ backgroundColor: 'var(--hero-bg-overlay)' }} />
      
      {/* Gradient Overlay for Additional Depth */}
      <div 
        className="absolute inset-0 z-[2]"
        style={{
          background: 'var(--hero-gradient-dark-overlay)',
        }}
      />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-3xl mx-auto text-center animate-fade-in">
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-primary-foreground mb-6 leading-tight">
            CivicConnect
          </h1>
          <p className="text-xl sm:text-2xl text-primary-foreground/90 mb-4 font-medium">
            Empowering citizens through technology
          </p>
          <p className="text-lg text-primary-foreground/80 mb-8 max-w-2xl mx-auto">
            A platform that allows citizens to report civic issues on an interactive map in real time. 
            Connect with your community and local authorities to create positive change.
          </p>
          <div className="space-x-4">
            <Button  
              size="lg" 
              variant="hero"
              className="bg-card text-card-foreground hover:bg-card/90 text-lg px-8 py-6 h-auto"
              onClick={() => window.location.href = '/portal'}
            >
              Open Portal
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;