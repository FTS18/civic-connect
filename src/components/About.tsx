import { useEffect, useRef, useState } from "react";

const About = () => {
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
    <section 
      id="about" 
      ref={sectionRef}
      className={`py-20 bg-muted transition-opacity duration-1000 ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-foreground mb-6">
            About CivicConnect
          </h2>
          <p className="text-lg text-muted-foreground mb-4">
            CivicConnect is a modern civic engagement platform that empowers citizens to report and track 
            infrastructure issues in real-time. Using interactive maps, photo uploads, and community voting, 
            we create a transparent bridge between residents and local authorities.
          </p>
          <p className="text-lg text-muted-foreground">
            From potholes to broken streetlights, traffic issues to park maintenance - every report is geotagged, 
            photographed, and tracked through resolution. Our admin dashboard provides authorities with powerful 
            analytics and filtering tools to prioritize and resolve issues efficiently. Join the movement to build 
            smarter, more responsive communities.
          </p>
        </div>
      </div>
    </section>
  );
};

export default About;
