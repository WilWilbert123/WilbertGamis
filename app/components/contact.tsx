"use client";

import { GitBranch, MessageCircle, Camera, Briefcase, Mail } from "lucide-react";
import { profile } from "../../data/profile";

export default function Contact() {
  return (
    <section className="py-24" id="contact">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        
        {/* Header */}
        <div className="mb-12">
          <h2 className="font-['Press_Start_2P'] text-xl sm:text-2xl md:text-3xl leading-snug">
            let's connect
          </h2>
          <p className="font-['Silkscreen'] mt-6 text-foreground/80 max-w-2xl mx-auto">
            My inbox is always open. Whether you have a project in mind or just want to say hi, I'll try my best to get back to you!
          </p>
        </div>

        {/* Social Links */}
        <div className="flex flex-wrap justify-center gap-6">
          <a href={profile.socials.github} target="_blank" rel="noopener noreferrer" className="p-4 border-2 border-foreground hover:bg-foreground hover:text-background transition-colors hover:-translate-y-1 transform duration-200">
            <GitBranch size={28} />
          </a>
          <a href={profile.socials.twitter} target="_blank" rel="noopener noreferrer" className="p-4 border-2 border-foreground hover:bg-foreground hover:text-background transition-colors hover:-translate-y-1 transform duration-200">
            <MessageCircle size={28} />
          </a>
          <a href={profile.socials.linkedin} target="_blank" rel="noopener noreferrer" className="p-4 border-2 border-foreground hover:bg-foreground hover:text-background transition-colors hover:-translate-y-1 transform duration-200">
            <Briefcase size={28} />
          </a>
          <a href={profile.socials.instagram} target="_blank" rel="noopener noreferrer" className="p-4 border-2 border-foreground hover:bg-foreground hover:text-background transition-colors hover:-translate-y-1 transform duration-200">
            <Camera size={28} />
          </a>
          <a href={profile.socials.email} className="p-4 border-2 border-foreground hover:bg-foreground hover:text-background transition-colors hover:-translate-y-1 transform duration-200">
            <Mail size={28} />
          </a>
        </div>

      </div>
    </section>
  );
}
