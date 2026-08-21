"use client";

import { ArrowRight, X } from "lucide-react";
import CircularGallery from "./CircularGallery/CircularGallery";
import { useTheme } from "next-themes";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const items = [
  { image: '/asset/certificate/AWS.png', text: 'AWS', link: 'https://skillbuilder.aws/learn/4URFGY63KV/official-practice-question-set-aws-certified-ai-practitioner--aifc01--english/FVG43Y1PAX' },
  { image: '/asset/certificate/Cybersecurity with cisco.png', text: 'Cisco', modalText: 'Cybersecurity Fundamental with CISCO Tools', link: 'https://www.coursera.org/account/accomplishments/specialization/certificate/T0WFQT95HWPK' },
  { image: '/asset/certificate/GoogleAI.png', text: 'Google AI', link: 'https://www.coursera.org/account/accomplishments/specialization/QKDOSG7NHJYH' },
  { image: '/asset/certificate/IBM-YLOXSG22AFYC.jpeg', text: 'IBM', modalText: 'IBM Full-Stack JavaScript Developer', link: 'https://www.coursera.org/account/accomplishments/professional-cert/YLOXSG22AFYC' },
  { image: '/asset/certificate/Installing and Configuring.png', text: 'Configuring', modalText: 'Installing and Configuring Computer Systems' },
  { image: '/asset/certificate/Introduction to Computer Systems Servicing NC II.png', text: 'Servicing', modalText: 'Introduction to Computer Systems Servicing NC II' },
  { image: '/asset/certificate/Microsoft Cybersecurity.png', text: 'Microsoft', modalText: 'Microsoft Cybersecurity Course: Security Compliance, and Identity Fundamentals' },
  { image: '/asset/certificate/SMART Android Mobile Apps  .png', text: 'Android', modalText: 'SMART Android Mobile Apps development for Beginners' },
  { image: '/asset/certificate/SnowflakeDiscoverAi.png', text: 'Snowflake', link: 'https://info.snowflake.com/rs/252-RFO-227/images/00QVI00000lCUfE2AW-SNOWFLAKE_DISCOVER_AI-06-10072026.pdf?mkt_tok=MjUyLVJGTy0yMjcAAAGi_YpQtNsuXLZ6q_rpC35VnEbTTNETVUOFsRe6UynxTxt1ipQTW1sdyCHrGlWFxr8OgpE9Ysa9LtWaKWd50OOExs_qKGBKY3dpob64h4US9svPlznyKsc' },
];

export default function Certifications() {
  const { theme, resolvedTheme } = useTheme();
  const [activeIndex, setActiveIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Choose text color based on theme
  const currentTheme = theme === 'dark' || resolvedTheme === 'dark' ? 'dark' : 'light';
  const textColor = currentTheme === 'dark' ? '#ffffff' : '#000000';

  return (
    <section className="py-24" id="certifications">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col items-center justify-center mb-2 gap-4 text-center">
          <h2 className="font-['Press_Start_2P'] text-xl sm:text-2xl md:text-3xl leading-snug">
            certifications
          </h2>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="font-['Silkscreen'] text-sm sm:text-base hover:underline underline-offset-4 flex items-center gap-2 justify-center cursor-pointer"
          >
            credentials <ArrowRight size={16} />
          </button>
        </div>

        {/* Circular Gallery */}
        <div style={{ height: '600px', position: 'relative' }} className="bg-background cursor-pointer">
          <CircularGallery
            items={items}
            bend={1.5}
            textColor={textColor}
            borderRadius={0}
            fontUrl="https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap"
            font="16px 'Press Start 2P'"
            scrollSpeed={2}
            onActiveItemChange={setActiveIndex}
            onItemClick={(index) => {
              if (items[index].link) {
                window.open(items[index].link, '_blank');
              }
            }}
          />
        </div>

      </div>

      {/* Retro Credentials Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setIsModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative w-full max-w-5xl pixel-border bg-background p-1 mt-10 md:mt-0 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Inner Container */}
              <div className="border-[2px] border-foreground p-6 md:p-8 bg-background relative flex flex-col max-h-[90vh] overflow-y-auto custom-scrollbar">
                
                {/* Modal Header */}
                <div className="flex justify-between items-center mb-8 border-b-[2px] border-foreground pb-4">
                  <h3 className="font-['Press_Start_2P'] text-lg sm:text-xl md:text-2xl">
                    CREDENTIALS
                  </h3>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="p-2 pixel-border hover:bg-foreground hover:text-background transition-colors"
                  >
                    <X size={24} />
                  </button>
                </div>

              {/* Grid of Certificates */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {items.map((item, index) => (
                  <div key={index} className="flex flex-col gap-2">
                    <div 
                      className={`relative aspect-[4/3] pixel-border overflow-hidden ${item.link ? 'cursor-pointer hover:scale-[1.02] transition-transform shadow-[4px_4px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_rgba(255,255,255,0.2)]' : 'cursor-not-allowed opacity-80'}`}
                      onClick={() => {
                        if (item.link) {
                          window.open(item.link, '_blank');
                        }
                      }}
                    >
                      <img 
                        src={item.image} 
                        alt={item.text}
                        className="w-full h-full object-contain p-2"
                      />
                    </div>
                    <div className="flex justify-between items-start mt-2 gap-2">
                      <span className="font-['Silkscreen'] text-[10px] sm:text-xs break-words leading-snug flex-1">{item.modalText || item.text}</span>
                      {item.link ? (
                        <span className="text-[10px] bg-foreground text-background px-2 py-1 font-['Press_Start_2P'] rounded-sm shrink-0">
                          VERIFIED
                        </span>
                      ) : (
                        <span className="text-[10px] border-[2px] border-foreground px-2 py-1 font-['Press_Start_2P'] rounded-sm opacity-50 shrink-0">
                          ISSUED
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
