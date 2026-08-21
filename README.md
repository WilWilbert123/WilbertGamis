# 🚀 Wilbert Gamis - Developer Portfolio & AI PixelBot

Welcome to my personal developer portfolio! This project showcases my skills, experience, and projects. It also features a custom AI Chatbot ("PixelBot") powered by the Google Gemini API, allowing visitors to ask questions about my professional background dynamically.

## 🛠️ Tech Stack
- **Framework:** Next.js 16 (App Router)
- **Styling:** Tailwind CSS, Framer Motion
- **AI Integration:** Vercel AI SDK, Google Gemini API
- **Language:** TypeScript

---

## 📖 Step-by-Step Guide to Clone and Run Locally

If you want to clone this repository to explore the code or use it as inspiration, follow these steps!

### Prerequisites
Before you begin, ensure you have the following installed:
- [Node.js](https://nodejs.org/) (Version 18+ recommended)
- `npm`, `yarn`, `pnpm`, or `bun` (This guide uses `npm`)
- A [Google Gemini API Key](https://aistudio.google.com/app/apikey) for the AI PixelBot feature.

### Step 1: Clone the Repository
Open your terminal and run the following command to clone this repository to your local machine:
```bash
git clone https://github.com/WilWilbert123/portfolio.git
cd portfolio
```

### Step 2: Install Dependencies
Once inside the project directory, install the required packages:
```bash
npm install
```

### Step 3: Configure Environment Variables
The AI Chat widget requires a Google Gemini API Key to function. 
1. Create a new file in the root directory and name it `.env.local`.
2. Add your Gemini API key to the file like this:
```env
GEMINI_API_KEY=your_gemini_api_key_here
```
*(Note: Do not wrap the key in quotes, and never commit your `.env.local` file to public version control!)*

### Step 4: Run the Development Server
Start the Next.js development server:
```bash
npm run dev
```

### Step 5: View the Application
Open your browser and navigate to:
[http://localhost:3000](http://localhost:3000)

You should now see the portfolio running locally. You can click on the Chat Widget in the bottom corner to test out PixelBot!

---

## 🤝 Contributing
Feedback and contributions are always welcome. If you find a bug or have a suggestion, feel free to open an issue or submit a pull request!

## 📝 License
This project is open-source and available under the MIT License.
