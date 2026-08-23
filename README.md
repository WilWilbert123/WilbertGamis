# Wilbert Gamis - Developer Portfolio & AI Chat Assistant

Welcome to the source code of my personal developer portfolio. This project is a modern, highly interactive web application designed to showcase my skills, professional experience, and full-stack projects. It leverages cutting-edge web technologies including 3D graphics, fluid animations, and artificial intelligence.

## Key Features

- **Interactive UI & Animations:** Built with Framer Motion and custom CSS/JS for fluid page transitions, scroll effects, and dynamic component rendering (e.g., WarpText, CircularGallery).
- **Mr Robot AI Chat Assistant:** A custom-built AI chatbot powered by the Google Gemini API (Vercel AI SDK). It is context-aware and trained on my resume to answer questions about my background dynamically.
- **Visitor Analytics:** Integrates with Supabase to track, store, and display real-time visitor metadata (IP, Location, Device Info, Browser) directly inside the AI Chat widget for a unique hacker-themed user experience.
- **Responsive Design:** Fully responsive and optimized for all screen sizes using Tailwind CSS.
- **Server-Side Rendering:** Utilizes Next.js App Router for optimal performance, SEO, and fast page loads.

## Tech Stack

### Core
- **Framework:** Next.js (App Router)
- **Library:** React 19
- **Language:** TypeScript

### Styling & Animation
- **Styling:** Tailwind CSS
- **Animations:** Framer Motion, GSAP
- **Graphics/WebGL:** OGL, Three.js (for select interactive elements)

### Backend & Services
- **Database / Auth:** Supabase (PostgreSQL)
- **AI Integration:** Google Gemini API (via Vercel AI SDK)

---

## Getting Started

If you want to clone this repository to explore the codebase or run it locally, follow this step-by-step guide.

### Prerequisites

Ensure you have the following installed and set up on your local machine:
- [Node.js](https://nodejs.org/) (Version 18 or higher recommended)
- `npm` (Node Package Manager)
- A [Google Gemini API Key](https://aistudio.google.com/app/apikey)
- A [Supabase](https://supabase.com/) account and project for the database integration.

### Step 1: Clone the Repository

Open your terminal and run the following command to clone the project:

```bash
git clone https://github.com/WilWilbert123/WilbertGamis.git
cd portfolio
```

### Step 2: Install Dependencies

Install all the required packages for the frontend and backend integrations:

```bash
npm install
```

### Step 3: Configure Environment Variables

The application requires environment variables for both the AI Chatbot and the Supabase database connection. 

1. Create a new file named `.env.local` in the root directory.
2. Add your API keys and Supabase URLs in the following format:

```env
# Google Gemini AI - Required for Mr Robot Chatbot
GEMINI_API_KEY=your_gemini_api_key_here

# Supabase - Required for Visitor Data Tracking
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

*Note: Never commit your `.env.local` file to version control. Keep these keys secure.*

### Step 4: Run the Development Server

Start the Next.js local development server:

```bash
npm run dev
```

### Step 5: View the Application

Open your web browser and navigate to:

[http://localhost:3000](http://localhost:3000)

The portfolio should now be running locally. You can open the chat widget in the bottom corner to test the Gemini AI integration and view the Supabase visitor data tracking in action.

---

## Project Structure

A quick overview of the important directories in this project:

- `/app`: Contains the Next.js App Router pages, API routes (including the `/api/chat` endpoint), and layout configurations.
- `/app/components`: Reusable React components (Hero, Chat Widget, CircularGallery, TextType, etc.).
- `/data`: Static data files containing project information, tech stack details, and resume content.
- `/public`: Static assets including images, icons, and fonts.

## Contributing

Feedback and contributions are always welcome. If you find a bug, have a suggestion for an animation, or want to improve the codebase, feel free to open an issue or submit a pull request.

## License

This project is open-source and available under the MIT License.
