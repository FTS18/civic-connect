import { useEffect, useRef, useState } from "react";
import screenshotMap from "@/assets/Map.png";
import screenshotForm from "/okk.jpeg";
import screenshotDashboard from "/image.png";

const screenshots = [
  {
    image: screenshotMap,
    title: "Interactive Map View",
    description: "Explore civic issues on an intuitive, interactive map powered by Leaflet with marker clustering. Click anywhere to report new issues with precise geolocation. View all reported problems with color-coded status indicators - yellow for reported, red for in-progress, and green for resolved. Filter by category, status, and search by keywords to find specific issues in your neighborhood.",
  },
  {
    image: screenshotForm,
    title: "Quick Issue Reporting",
    description: "Report civic problems in seconds with our streamlined form interface. Upload photos directly from your device using Cloudinary integration for reliable image storage. Add detailed descriptions, select from multiple categories including potholes, streetlights, traffic, and more. Automatic geolocation captures exact coordinates, or manually adjust the location on the map for pinpoint accuracy.",
  },
  {
    image: screenshotDashboard,
    title: "Real-Time Analytics Dashboard",
    description: "Comprehensive admin dashboard with powerful analytics and management tools. Track key metrics including total issues, resolution rates, average response times, and community engagement. Filter and sort issues by status, category, priority, and date range. View detailed statistics with visual charts, manage issue statuses, and monitor high-priority problems requiring immediate attention.",
  },
];

const Screenshots = () => {
  const [visibleItems, setVisibleItems] = useState<Set<number>>(new Set());
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const observers = itemRefs.current.map((ref, index) => {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setVisibleItems((prev) => new Set([...prev, index]));
          }
        },
        { threshold: 0.1 }
      );

      if (ref) {
        observer.observe(ref);
      }

      return observer;
    });

    return () => {
      observers.forEach((observer) => observer.disconnect());
    };
  }, []);

  return (
    <section id="screenshots" className="py-20 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-foreground mb-4">
            See CivicConnect in Action
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Experience the power of civic engagement through our intuitive platform
          </p>
        </div>

        <div className="space-y-20">
          {screenshots.map((screenshot, index) => (
            <div
              key={index}
              ref={(el) => (itemRefs.current[index] = el)}
              className={`flex flex-col ${
                index % 2 === 0 ? "lg:flex-row" : "lg:flex-row-reverse"
              } items-center gap-8 lg:gap-12 ${
                visibleItems.has(index) 
                  ? (index % 2 === 0 ? 'animate-fade-left' : 'animate-fade-right')
                  : 'opacity-0'
              }`}
              style={{ animationDelay: '200ms' }}
            >
              <div 
                className="flex-1 group relative overflow-hidden rounded-lg"
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
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10 pointer-events-none"
                  style={{
                    background: 'radial-gradient(600px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(59, 130, 246, 0.15), transparent 40%)'
                  }}
                />
                <img
                  src={screenshot.image}
                  alt={screenshot.title}
                  className="rounded-lg shadow-2xl w-full h-auto aspect-video object-cover transform group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="flex-1 text-center lg:text-left group">
                <h3 className="text-3xl font-bold text-foreground mb-4 group-hover:text-primary transition-colors duration-300">
                  {screenshot.title}
                </h3>
                <p className="text-lg text-muted-foreground group-hover:text-foreground transition-colors duration-300">
                  {screenshot.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Screenshots;