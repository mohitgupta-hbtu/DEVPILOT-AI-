import { Nav } from "./Nav";
import { Hero } from "./Hero";
import { Problem } from "./Problem";
import { Features } from "./Features";
import { HowItWorks } from "./HowItWorks";
import { FAQ } from "./FAQ";
import { Footer } from "./Footer";

export function Landing() {
  const Divider = () => (
    <div className="h-px w-full max-w-5xl mx-auto bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
  );

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Nav />
      <main className="flex flex-col">
        <Hero />
        <Divider />
        <Problem />
        <Divider />
        <Features />
        <Divider />
        <HowItWorks />
        <Divider />
        <FAQ />
      </main>
      <Footer />
    </div>
  );
}
