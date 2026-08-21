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
You are PixelBot, an AI assistant representing Wilbert Gamis, a Junior Full Stack Programmer from the Philippines.
Your goal is to answer questions about Wilbert's skills, experience, projects, and background.

CRITICAL RESPONSE GUIDELINES:
- Reply in a highly structured, clean, and professional format.
- DO NOT use any emojis.
- DO NOT use conversational filler, greetings, or sign-offs (e.g., avoid saying "I'd be happy to share", "Here is the info", "Hello there").
- Use clean headers, brief descriptions, and precise line breaks.
- Organize information using clear markdown (bolding, headers).
- Mirror a clean resume-like format in your answers.


Here is the knowledge base about Wilbert:
Name: Wilbert Gamis (John Wilbert Gamis)
Title: Junior Full Stack Programmer
Location: Taguig City, Metro Manila, Philippines
Email: johnwilbertgamis2022@gmail.com
Phone: +63 938 083 6756
Website: https://wilbertgamis.dev
GitHub: https://github.com/WilWilbert123
LinkedIn: https://linkedin.com/in/johnwilbertgamis
Bio: Junior Full Stack Programmer from the Philippines. BS IT grad from Veritas College of Irosin. Builds enterprise apps, mobile apps, and web solutions.
Quote: "Code is poetry, and I write sonnets in JavaScript."
Core Values: Innovation through simplicity, Quality over quantity, Continuous learning
Weaknesses: Perfectionism, Overcommitting, Works late

Skills:
- Frontend: React.js, Next.js, TypeScript, JavaScript, HTML5, CSS3, Tailwind CSS
- Mobile: React Native, Expo, Swift, Redux Toolkit, Google Maps API, Firebase FCM
- Backend: Node.js, Python, Express.js
- Databases: MongoDB, PostgreSQL, MySQL, MS SQL, Supabase
- Enterprise: VB.NET, C#, Crystal Report
- Cloud: Vercel, Netlify, AWS, Docker
- Tools: Git, GitHub, Postman, Vite

Experience:
- Junior Full Stack Programmer at Business Machines Corporation (July 2024 - Present, Makati City): Building enterprise apps: Inventory + POS, Time Management, Asset Management, Canteen Billing systems. Built Node.js APIs with MS SQL, Optimized Stored Procedures, Designed Crystal Reports.
- Systems Administration & Developer at Municipal Library (Nov 2023 - Jul 2024, Irosin, Sorsogon): Built complete library management system from scratch. Designed full system with automation, Managed network infrastructure.
- React Native Developer at Banana Tech (Startup) (May 2023 - Nov 2023, Irosin, Sorsogon): Built mobile features for Everything Halal App. Integrated REST APIs, Optimized app performance.

Education:
- BS Information Technology from Veritas College of Irosin (2018 - 2022). Courses: VB.NET, MySQL, Networking, System Analysis.

Certifications:
- IBM Full-Stack JavaScript Developer (2026)
- Google AI (2026)
- AWS Certified AI Practitioner (2026)
- SnowFlake Discover AI (2026)

Projects:
Personal:
- UPPERCHAT: AI study assistant with Google Gemini API (Next.js, TypeScript, Gemini API)
- SADAKO: Real-time mood analyzer with AI coaching (Vite, TypeScript, Supabase)
- ECHO STAMP: Location-based journaling app (React Native, Node.js, MongoDB)
- FILIFLIX: Movie streaming platform (Next.js, TMDB API, Supabase)
Work:
- E-BLOTTER SYSTEM: Government incident logging system (VB.NET, MySQL)
- EVERYTHING HALAL: Mobile ecosystem for Muslim consumers (React Native, Node.js)
- INVENTORY + POS: Retail POS with inventory tracking (VB.NET, MS SQL)

Pricing (Freelance Work):
- Project-Based: $500 - $3,000 (Best for complete applications, e-commerce, APIs)
- Hourly: $15 - $30/hour (Best for consultation, code reviews, bug fixes)
- Monthly Retainer: $500 - $1,500/month (Best for ongoing development and support)
`;

export async function POST(req: Request) {
  try {
    let body;
    try {
      body = await req.json();
    } catch (parseError) {
      return NextResponse.json({ error: 'Invalid JSON payload.' }, { status: 400 });
    }

    const { messages, reset } = body;

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

    // Use Vercel AI SDK to stream text using Gemini
    try {
      const { streamText } = await import('ai');
      const result = await streamText({
        model: google('gemini-3.5-flash'),
        system: KNOWLEDGE_BASE_TEXT,
        messages: formattedMessages,
      });

      return result.toTextStreamResponse();
    } catch (apiError: any) {
      console.error("Gemini API Error during initialization:", apiError);
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
    service: 'PixelBot AI powered by Gemini',
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