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
            CivicConnect bridges the gap between citizens and local government through 
            innovative technology. Our platform enables real-time reporting and tracking 
            of civic issues, fostering transparency and accountability.
          </p>
          <p className="text-lg text-muted-foreground">
            From broken streetlights to potholes, graffiti to park maintenance - every 
            report matters. Join thousands of engaged citizens making their communities 
            better, one report at a time.
          </p>
        </div>
      </div>
    </section>
  );
};

export default About;
