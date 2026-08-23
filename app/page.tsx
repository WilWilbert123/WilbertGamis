import Navbar from "./components/navbar";
import Hero from "./components/hero";
import WorkProjects from "./components/work-projects";
import PersonalProjects from "./components/personal-projects";
import TechStack from "./components/tech-stack";
import Certifications from "./components/certifications";
import Affiliations from "./components/affiliations";
import GithubActivity from "./components/github-activity";
import Contact from "./components/contact";
import IntroSplash from "./components/intro-splash";

export default function Home() {
  return (
    <>
      <IntroSplash />
      <Navbar />
      <main className="flex-1">
        <Hero />
        <WorkProjects />
        <PersonalProjects />
        <TechStack />
        <Certifications />
        <Affiliations />
        <GithubActivity />
        <Contact />
      </main>
      <footer className="border-t-2 border-foreground py-8 text-center bg-background">
        <p className="font-['Silkscreen'] text-sm opacity-80">
          © {new Date().getFullYear()} WILBERT. ALL RIGHTS RESERVED.
        </p>
      </footer>
    </>
  );
}
