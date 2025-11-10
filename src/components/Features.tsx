import { useState, useEffect, useRef } from "react";
import { MapPin, Bell, Users } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const features = [
  {
    icon: MapPin,
    title: "Interactive Map Reporting",
    description: "Click anywhere on the map to instantly report civic issues with photos. Geolocation-enabled for precise issue tracking and faster resolution by authorities.",
  },
  {
    icon: Bell,
    title: "Community Engagement",
    description: "Upvote, downvote, and suggest solutions for reported issues. Collaborate with neighbors to prioritize problems and drive collective action for your community.",
  },
  {
    icon: Users,
    title: "Admin Dashboard & Analytics",
    description: "Comprehensive admin panel with real-time statistics, filtering, and status management. Track resolution rates, high-priority issues, and community engagement metrics.",
  },
];

const Features = () => {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  return (
    <section id="features" ref={sectionRef} className="py-20 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`text-center mb-16 ${isVisible ? 'animate-on-scroll' : 'opacity-0'}`}>
          <h2 className="text-4xl font-bold text-foreground mb-4">
            Why CivicConnect?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Transforming how communities engage with civic infrastructure and local governance
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card 
                key={index} 
                className={`border-border hover:shadow-2xl hover:scale-105 hover:-translate-y-2 transition-all duration-300 group relative overflow-hidden ${isVisible ? 'animate-scale' : 'opacity-0'}`}
                style={{ animationDelay: `${index * 150}ms` }}
                onMouseMove={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const x = e.clientX - rect.left;
                  const y = e.clientY - rect.top;
                  e.currentTarget.style.setProperty('--mouse-x', `${x}px`);
                  e.currentTarget.style.setProperty('--mouse-y', `${y}px`);
                }}
              >
                {/* Direction-aware spotlight effect */}
                <div 
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                  style={{
                    background: 'radial-gradient(600px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(59, 130, 246, 0.1), transparent 40%)'
                  }}
                />
                <CardHeader className="relative z-10">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 group-hover:bg-primary/20 flex items-center justify-center mb-4 transition-all duration-300 group-hover:scale-110 group-hover:rotate-3">
                    <Icon className="h-6 w-6 text-primary transition-all duration-300" />
                  </div>
                  <CardTitle className="text-xl group-hover:text-primary transition-colors duration-300">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent className="relative z-10">
                  <CardDescription className="text-base group-hover:text-foreground transition-colors duration-300">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Features;
