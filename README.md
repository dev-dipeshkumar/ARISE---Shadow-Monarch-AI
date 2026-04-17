# ARISE - Shadow Monarch AI

ARISE is a premium, immersive AI assistant interface inspired by the "Shadow Monarch" aesthetic. It features advanced animations, holographic glow effects, and a sophisticated voice interaction system (JARVIS).

![Shadow Monarch Interface](https://picsum.photos/seed/monarch/1200/600?grayscale)

## 🌟 Features

- **Neural Link (AI Chat)**: A high-performance chat console powered by Google's Gemini 1.5 Pro, capable of complex reasoning and "shadow extraction" (information retrieval).
- **Voice Resonance (JARVIS)**: A full-screen voice mode with a sophisticated JARVIS-like persona. Includes real-time audio visualization, speech-to-text, and text-to-speech capabilities.
- **Quest Protocol**: A gamified task management system where you can track missions and level up your Monarch rank.
- **Monarch Dashboard**: Real-time monitoring of your system stats: Strength, Agility, Intelligence, Mana, and Shadow Strength.
- **Immersive UI**: 3D Spline backgrounds, particle effects, and holographic overlays that respond to user interaction.
- **Theme Support**: Seamlessly switch between Light and Dark modes while maintaining the Monarch aesthetic.

## 🚀 Tech Stack

- **Frontend**: React 18, Vite, TypeScript
- **Styling**: Tailwind CSS 4, Framer Motion (motion/react)
- **AI**: Google Gemini API (@google/genai)
- **3D**: Spline (@splinetool/react-spline)
- **Icons**: Lucide React
- **Notifications**: Sonner

## 🛠️ Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/arise-monarch-ai.git
   cd arise-monarch-ai
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up Environment Variables**:
   Create a `.env` file in the root directory and add your Gemini API Key:
   ```env
   GEMINI_API_KEY=your_api_key_here
   ```

4. **Run the development server**:
   ```bash
   npm run dev
   ```

## 🌐 Deployment (Vercel)

This project is optimized for deployment on [Vercel](https://vercel.com).

1. **Push your code to GitHub**.
2. **Import the project** into Vercel.
3. **Configure Environment Variables**:
   - In the Vercel dashboard, go to **Settings > Environment Variables**.
   - Add `GEMINI_API_KEY` with your Google AI Studio API key.
4. **Deploy**! Vercel will automatically detect the Vite configuration and build the project.

## 🛡️ Security Note

This project currently uses client-side API calls for demonstration purposes. For production use, it is recommended to move API calls to a server-side environment (like Vercel Functions) to protect your API keys.

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

*Powered by the shadows. Created by Dipesh Kumar.*
