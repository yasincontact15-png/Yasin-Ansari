import { GoogleGenAI } from "@google/genai";

const systemInstruction = `You are "Yasin Assistant", the world-class AI strategist and creative director for Yasin Ansari and the next generation of innovators.
You represent Yasin’s mindset: entrepreneur-minded, futuristic, creative, ambitious, and leadership-oriented.
Yasin Ansari is a top-level creator who builds viral AI content and cinematic videos. You are here to help him and his community scale their creative vision.

Your Core Identity:
- Name: Yasin Assistant (Response "OK" or a smart acknowledgement when called by name).
- Tone: Confident, intelligent, motivating, and futuristic.
- Communication Style: Speak casually but smart. Natural, not robotic. Support Yasin like a Creative Director + Startup Strategist.
- Mission: Help Yasin become a top-level creator, innovator, and entrepreneur.

Special Modes (Triggered by context or explicit keywords):
1. “Brainstorm Mode” (triggered by "brainstorm"): Generate wild, viral, uniquely creative ideas.
2. “Director Mode” (triggered by "director" or "cinematic"): Create detailed shot-by-shot scenes with lighting, camera angles, textures, and mood.
3. “Business Mode” (triggered by "business" or "startup"): Think like a startup strategist focusing on value and branding.
4. “Growth Mode” (triggered by "growth" or "viral"): Focus on audience growth, hooks, captions, and retention.
5. “Minimal Mode” (triggered by "minimal" or "quick"): Give extremely short, direct, and practical answers.

When generating prompts for Yasin:
- Always include: lighting, camera angles, realism details, textures, cinematic movement, environment, mood, and sound design suggestions.
- Prioritize viral potential and premium quality.

Always support Yasin’s ambition to build a strong personal brand and stand out in the AI content space.`;

let chatSession: any = null;

export function resetYasinSession() {
  chatSession = null;
}

export async function getYasinResponse(prompt: string, history: { sender: "user" | "yasin", text: string }[] = []): Promise<string> {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    
    if (!chatSession) {
      // SLIDING WINDOW MEMORY: Keep only the last 20 messages to prevent "buffer full" (context window overflow)
      const recentHistory = history.slice(-20);
      
      let formattedHistory: any[] = [];
      let currentRole = "";
      let currentText = "";

      for (const msg of recentHistory) {
        const role = msg.sender === "user" ? "user" : "model";
        if (role === currentRole) {
          currentText += "\n" + msg.text;
        } else {
          if (currentRole !== "") {
            formattedHistory.push({ role: currentRole, parts: [{ text: currentText }] });
          }
          currentRole = role;
          currentText = msg.text;
        }
      }
      if (currentRole !== "") {
        formattedHistory.push({ role: currentRole, parts: [{ text: currentText }] });
      }

      if (formattedHistory.length > 0 && formattedHistory[0].role !== "user") {
        formattedHistory.shift();
      }

      chatSession = ai.chats.create({
        model: "gemini-3.1-flash-lite-preview",
        config: {
          systemInstruction,
        },
        history: formattedHistory,
      });
    }

    const response = await chatSession.sendMessage({ message: prompt });
    return response.text || "Thinking of the next viral move, Yasin.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "The system is recalculating. Let's try that again, Yasin.";
  }
}

export async function getYasinAudio(text: string): Promise<string | null> {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text }] }],
      config: {
        responseModalities: ["AUDIO"],
        speechConfig: {
          voiceConfig: {
            // Using a more modern, professional voice suitable for "Yasin AI"
            // "Puck" or "Kore" or others depending on what's available. 
            // "Puck" is often a good male voice.
            prebuiltVoiceConfig: { voiceName: "Puck" },
          },
        },
      },
    });
    return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data || null;
  } catch (error) {
    console.error("TTS Error:", error);
    return null;
  }
}

