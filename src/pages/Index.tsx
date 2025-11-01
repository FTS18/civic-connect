import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import About from "@/components/About";
import Screenshots from "@/components/Screenshots";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Header />
      <main id="home">
        <Hero />
        <About />
        <Features />
        <Screenshots />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
