import { NextResponse } from 'next/server';
import { streamText } from 'ai';
import { createGoogleGenerativeAI } from '@ai-sdk/google';

// Configure Google AI with the specific environment variable the user is using
const google = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY,
});

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

const KNOWLEDGE_BASE_TEXT = `
You are Mr Robot, an AI assistant representing Wilbert Gamis, a Junior Full Stack Programmer from the Philippines.
Your goal is to answer questions about Wilbert's skills, experience, projects, and background.

CRITICAL RESPONSE GUIDELINES:
- Reply in a highly structured, clean, and professional format.
- DO NOT use any emojis.
- DO NOT use conversational filler, greetings, or sign-offs (e.g., avoid saying "I'd be happy to share", "Here is the info", "Hello there").
- Use clean headers, brief descriptions, and precise line breaks.
- Organize information using clear markdown (bolding, headers).
- Mirror a clean resume-like format in your answers.
- IMPORTANT: If the user asks about their own IP address, location, device, or network, you MUST answer them using the data provided in the "CURRENT VISITOR INFO" section below. Do NOT claim you lack access to this information.
- EASTER EGG RULE 1: If the user says exactly "no way" (case-insensitive), you MUST reply ONLY with: "Yeah no way haha"
- EASTER EGG RULE 2: If the user says "Hi mr robot" or greets you directly by name, you MUST reply with: "oh hello next time dont click a random link btw how can i help you ?"

Here is the knowledge base about Wilbert:
Name: John Wilbert Gamis
Title: Junior Full Stack Programmer
Location: Taguig City, Metro Manila, Philippines
Email: johnwilbertgamis2022@gmail.com
Phone: +63 938 083 6756
Website: https://wilbertgamis.dev
GitHub: https://github.com/WilWilbert123
LinkedIn: https://linkedin.com/in/johnwilbertgamis

Education:
- BS Information Technology - Veritas College of Irosin, Irosin Sorsogon (2022). Software Development & Systems Administration. Courses: Object-Oriented Programming (VB.NET), Database Design & Management (MySQL), Computer Networking & cable Infrastructure, System Analysis & Design, IT Fundamentals.
- Capstone Project: E-BLOTTER SYSTEM. Served as a Lead Full-Stack Developer to architect and build the complete frontend UI, backend logic, and relational MySQL databases (Visual Basic.NET, MySQL, Crystal Report, XAMPP), centralizing real-time incident logging and cross-jurisdictional record tracking across 28 barangays and a central police headquarters.

Work Experience:
- Junior Full Stack Programmer at Business Machines Corporation (Jul 2024 - Present, Makati City): Multi-System Development & Maintenance: Engineered, maintained, and enhanced core enterprise application including Inventory + POS, Bisbio Time Management System, Fixed Asset Management System, Canteen Billing System, Play Monitoring System + POS, And Play Monitoring Kiosk. RESTFul API & Integration: Developed and deployed Node.js RESTful API to interface directly with local MS SQL Server databases, leveraging secure tunneling (Ngrok) and localtunnel to enable external applications to write and sync transaction data seamlessly. Database & Stored Procedure Engineering: Authored and optimized complex Stored Procedures, Views, and relational tables in MS SQL Server to handle transaction processing and business logic. Custom Reporting & Documentation: Designed and integrated customized receipts, billing outputs, and operational reports across multiple active systems using Crystal Reports.
- Systems Administration & Developer at Municipal Library (Nov 2023 - Jul 2024, Irosin, Sorsogon): End-to-End Systems Engineering: Designed, developed, and deployed a complete library management system from scratch. Workflow Automation & Custom Features: Continuously enhance platform functionality by building custom features, automating manual record-keeping processes, and managing specialized digital workflows (including internet tenders). Network & Infrastructure Management: Configured and maintained local network infrastructure, network security, and internet configurations to ensure uninterrupted system uptime and public connectivity. Hardware & Systems Maintenance: Managed routine diagnostic checks, hardware repairs, and preventive maintenance on work station terminals, printers, and peripheral library equipment.
- React Native Developer at Banana Tech (Startup Company) (May 2023 - Nov 2023, Irosin, Sorsogon): Feature Development & Maintenance (Everything Halal App): Architected and deployed new cross-platform mobile features while maintaining existing codebase stability across IOS and Android builds. Third-Party API Integration: Integrated RESTful third-party APIs and services. Mobile Perfomance Optimization: Enhanced application scalability and user experience by optimizing rendering performance, refactoring legacy code, and implementing client-side caching strategies.

Projects:
- IROSINHUB: A comprehensive tourism web portal showcasing the Municipality of Irosin. It features a modern interface to explore all 28 barangays, discover local tourist spots, hot spring resorts, ecological parks, and cultural heritage sites. Built to promote local tourism with an interactive and responsive design.
- UPPERCHAT | AI-Powered Multimodal Study Assistant (Personal Project | 2026): Engineered an Intelligent study-assistant platform using Next.js, TypeScript, and Google Gemini API to analyze uploaded notes, assignment photos, and textbook screenshots in real time. Implemented automated problem-solving workflows that output step-by-step solution, detailed concept explanations, and an interactive AI chatbot for follow up questions. Deployed on Vercel.
- SADAKO | Real-Time Sentiment & Mood Advisor (Personal Project | 2026): Built a fast web application using Vite, TypeScript, and Tailwind CSS that evaluates user text inputs and emotional cues to analyze current mood states in real time. Integrated Google’s AI API to generate personalized advice and actionable and mindfulness prompts, leveraging Supabase for cloud database storage and auth.
- ECHO STAMP PLATFORM | Location-Based Journaling app & Web Landing page (Personal Project | 2026): Built a feature-rich Android journaling app featuring interactive Google Maps Street View, real-time Weather API integration for location context, Redux state management, and buttery-smooth Lottie animations. Backend: Node.js/Express, MongoDB atlas, Cloudinary, Resend SMTP.
- FILIFLIX | Full-Stack Movie & TV Streaming Web Application (Personal Project | 2026): Build a responsive movie and TV streaming application using Next.js 15 (App Router), TypeScript, and Tailwind CSS, integrating TMDB API for rich data metadata. Used Supabase for auth and database. Interactive embedded video player with custom playback control.

Certifications:
- IBM Full-Stack JavaScript Developer - Coursera / IBM (Aug 2026)
- Cybersecurity Fundamental with Cisco Tools - Coursera / Board Infinity (Aug 2026)
- Google AI - Coursera / Google (Aug 2026)
- Installing and Configuring Computer Systems - TESDA (Aug 2026)
- Introduction to Computer Systems Servicing NC II - TESDA (Aug 2026)
- Microsoft Cybersecurity Course: Security, Compliance, and Identity Fundamentals - TESDA (Aug 2026)
- AWS Certified AI Practitioner - AWS (Aug 2026)
- SnowFlake Discover AI - Snowflake (July 2026)
- SMART Android Mobile Apps Development for Beginners - TESDA (Feb 2024)

Additional Skills:
- Mobile Development: React Native, Swift, Expo, Redux Toolkit, Lottie Animation, Google Maps API, Firebase FCM
- Web & AI Stack: Next.js, React.js, TypeScript, Gemini Vision AI API, Vite, Tailwind CSS, HTML/CSS
- Backend & Databases: Node.js, Express, Python, Nginx (Reverse Proxy / API Routing), MongoDB Atlas, MS SQL, MySQL, Stored Procedure, Database Views, Schema Design, Supabase, Cloudinary, Resend SMTP, REST API’s, NoSQL
- Desktop & Enterprise: VB.NET, Crystal Report, C#
- Tools & Platforms: Git, Github, Vercel, Netlify, Google Play Console, Postman, Visual Studio, VS Code, Antigravity
- Languages: English (Fluent), Filipino (Native)
`;

export async function POST(req: Request) {
  try {
    let body;
    try {
      body = await req.json();
    } catch (parseError) {
      return NextResponse.json({ error: 'Invalid JSON payload.' }, { status: 400 });
    }

    const { messages, reset, visitorData } = body;

    let dynamicKnowledgeBase = KNOWLEDGE_BASE_TEXT;
    if (visitorData) {
      dynamicKnowledgeBase += `\n\n--- CURRENT VISITOR INFO (CRITICAL OVERRIDE) ---\nYou MUST use the following information if the user asks about their IP address, location, or device. Do NOT say you don't have access to this information. You DO have access to it, and here it is:\n`;
      dynamicKnowledgeBase += JSON.stringify(visitorData, null, 2);
    }

    if (reset) {
      return NextResponse.json({
        response: "Reset complete. I'm ready to help you with Wilbert's portfolio again. What would you like to know?",
        reset: true
      });
    }

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'Messages array is required.' }, { status: 400 });
    }

    console.log("Using API Key length:", process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.length : 0);
    console.log("Google Generative AI Key length:", process.env.GOOGLE_GENERATIVE_AI_API_KEY ? process.env.GOOGLE_GENERATIVE_AI_API_KEY.length : 0);

    // Convert messages format from the client ({ id, role, text }) to the AI SDK format ({ role, content })
    const formattedMessages = messages.map((m: any) => ({
      role: m.role,
      content: m.text || m.content || '',
    }));

    // Intercept Easter Eggs to bypass API quota
    const lastMessageRaw = formattedMessages[formattedMessages.length - 1]?.content?.trim()?.toLowerCase() || '';
    const lastMessageClean = lastMessageRaw.replace(/[^a-z0-9 ]/g, '').trim();

    if (lastMessageClean === 'no way') {
      return new Response("Yeah no way haha", { status: 200 });
    }
    
    const greetings = ['hi', 'hello', 'hola', 'yow', 'whats up', 'what is up', 'hey', 'hi mr robot', 'hello mr robot'];
    if (greetings.includes(lastMessageClean)) {
      const userMessageCount = formattedMessages.filter(m => m.role === 'user').length;
      if (userMessageCount === 1) {
        return new Response("oh hello next time dont click a random link btw how can i help you ?", { status: 200 });
      } else {
        return new Response("hello ????", { status: 200 });
      }
    }

    // Use Vercel AI SDK to stream text using Gemini
    try {
      const { streamText } = await import('ai');
      const result = await streamText({
        model: google('gemini-3.5-flash'),
        system: dynamicKnowledgeBase,
        messages: formattedMessages,
      });

      return result.toTextStreamResponse();
    } catch (apiError: any) {
      console.error("Gemini API Error during initialization:", apiError);
      if (apiError?.message?.includes('quota') || apiError?.message?.includes('429') || apiError?.statusCode === 429) {
        return new Response("Sorry, the AI API I use exceeded the limit. Please try again in a few minutes.", { status: 200 });
      }
      return NextResponse.json({ error: apiError.message, name: apiError.name }, { status: 500 });
    }

  } catch (error: any) {
    console.error('Chat API Error:', error);
    return NextResponse.json(
      {
        error: 'An unexpected error occurred. Please try again.',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'online',
    service: 'Mr Robot AI powered by Gemini',
    version: '6.0.0',
    creator: {
      name: "John Wilbert Gamis",
      title: "Junior Full Stack Programmer",
      email: "johnwilbertgamis2022@gmail.com",
      phone: "+63 938 083 6756"
    },
    timestamp: new Date().toISOString()
  });
}

export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
      'Access-Control-Max-Age': '86400',
    },
  });
}