import { MapPin, Mail } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-muted border-t border-border">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Brand & Description */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold text-foreground">CivicConnect</span>
            </div>
            <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
              CivicConnect is a real-time civic issue reporting platform that bridges the gap between citizens and local authorities. 
              Report issues with photos, track resolutions, engage with your community through voting and suggestions, and help build 
              better neighborhoods. Our interactive map-based system with Firebase backend and Cloudinary image storage ensures fast, 
              reliable, and transparent civic engagement for everyone.
            </p>
          </div>

          {/* Contact Info */}
          <div id="contact" className="flex flex-col md:items-end">
            <h3 className="font-semibold text-foreground mb-4">Contact Us</h3>
            <div className="space-y-3">
              <a href="mailto:dubeyananay@gmail.com" className="flex items-center gap-2 text-sm md:text-base text-muted-foreground hover:text-foreground transition-colors">
                <Mail className="h-4 w-4" />
                dubeyananay@gmail.com
              </a>
              <div className="text-sm md:text-base text-muted-foreground space-y-1">
                <a href="tel:+917719767324" className="block hover:text-foreground transition-colors">
                  Ananay: +91 7719767324
                </a>
                <a href="tel:+918303099225" className="block hover:text-foreground transition-colors">
                  Shikhar: +91 83030 99225
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Developers */}
        <div className="border-t border-border mt-6 md:mt-8 pt-6 md:pt-8">
          <h3 className="font-semibold text-foreground mb-4 text-center text-sm md:text-base">Developers</h3>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 sm:gap-8 mb-6">
            <a 
              href="https://ananay.netlify.app" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-sm md:text-base text-muted-foreground hover:text-primary transition-colors font-medium"
            >
              Ananay Dubey
            </a>
            <span className="hidden sm:inline text-muted-foreground">•</span>
            <a 
              href="https://linkedin.com/in/shikhar-yadav-16733330a" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-sm md:text-base text-muted-foreground hover:text-primary transition-colors font-medium"
            >
              Shikhar Yadav
            </a>
          </div>
        </div>

        {/* Copyright */}
        <div className="text-center">
          <p className="text-xs md:text-sm text-muted-foreground">
            © {new Date().getFullYear()} CivicConnect. All rights reserved. Building better communities together.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
