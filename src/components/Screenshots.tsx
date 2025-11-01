import { useEffect, useRef, useState } from "react";
import screenshotMap from "@/assets/screenshot-map.jpg";
import screenshotForm from "@/assets/screenshot-form.jpg";
import screenshotDashboard from "@/assets/screenshot-dashboard.jpg";

const screenshots = [
  {
    image: screenshotMap,
    title: "Interactive Map View",
    description: "View and report issues on an intuitive map interface with real-time location tracking.",
  },
  {
    image: screenshotForm,
    title: "Quick Issue Reporting",
    description: "Simple forms to report civic problems with photos, descriptions, and precise locations.",
  },
  {
    image: screenshotDashboard,
    title: "Real-Time Analytics",
    description: "Track issue resolution progress and community impact with comprehensive dashboards.",
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
              } items-center gap-8 lg:gap-12 transition-all duration-1000 ${
                visibleItems.has(index) ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
              }`}
            >
              <div className="flex-1">
                <img
                  src={screenshot.image}
                  alt={screenshot.title}
                  className="rounded-lg shadow-2xl w-full h-auto"
                />
              </div>
              <div className="flex-1 text-center lg:text-left">
                <h3 className="text-3xl font-bold text-foreground mb-4">
                  {screenshot.title}
                </h3>
                <p className="text-lg text-muted-foreground">
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
