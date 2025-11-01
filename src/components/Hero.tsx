import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import heroImage from "@/assets/hero-civic.jpg";

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      <div 
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `url(${heroImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary/90 via-primary/70 to-accent/60" />
      </div>
      
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
              asChild
            >
              <a href="/portal">
                Open Portal
                <ArrowRight className="ml-2 h-5 w-5" />
              </a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
