import { MapPin, Bell, Users } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const features = [
  {
    icon: MapPin,
    title: "Report Issues Easily",
    description: "Drop a pin on the map to report potholes, broken streetlights, graffiti, and more. Your voice matters.",
  },
  {
    icon: Bell,
    title: "Real-Time Updates",
    description: "Track the status of reported issues in real time. Stay informed about resolutions and community progress.",
  },
  {
    icon: Users,
    title: "Collaborate with Authorities",
    description: "Connect directly with local government and community leaders to drive meaningful civic improvements.",
  },
];

const Features = () => {
  return (
    <section id="features" className="py-20 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 animate-fade-in">
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
                className="border-border hover:shadow-lg transition-all duration-300 animate-slide-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
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
