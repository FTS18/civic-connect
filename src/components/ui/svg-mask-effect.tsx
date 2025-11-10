import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";

export const MaskContainer = ({
  children,
  revealText,
  size = 10,
  revealSize = 600,
  className,
}: {
  children?: string | React.ReactNode;
  revealText?: string | React.ReactNode;
  size?: number;
  revealSize?: number;
  className?: string;
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [mousePosition, setMousePosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const updateMousePosition = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (rect) {
      setMousePosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    }
  };

  return (
    <div
      ref={containerRef}
      className={`relative ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onMouseMove={updateMousePosition}
    >
      {/* Main content */}
      <div className="relative z-10">
        {children}
      </div>

      {/* Reveal text with mask */}
      <motion.div
        className="absolute inset-0 z-20 pointer-events-none flex items-center justify-center"
        style={{
          WebkitMaskImage: isHovered
            ? `radial-gradient(${revealSize}px circle at ${mousePosition.x}px ${mousePosition.y}px, black 0%, transparent 100%)`
            : "radial-gradient(0px circle at 50% 50%, black 0%, transparent 100%)",
          maskImage: isHovered
            ? `radial-gradient(${revealSize}px circle at ${mousePosition.x}px ${mousePosition.y}px, black 0%, transparent 100%)`
            : "radial-gradient(0px circle at 50% 50%, black 0%, transparent 100%)",
        }}
        transition={{ duration: 0.3, ease: "easeOut" } as any}
      >
        <div className="w-full h-full flex items-center justify-center">
          {revealText}
        </div>
      </motion.div>
    </div>
  );
};
