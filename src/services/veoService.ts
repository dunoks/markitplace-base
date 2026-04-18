import { GoogleGenAI } from "@google/genai";

export class VeoService {
  private static ai: any = null;

  private static async getAIInstance() {
    // Creating instance right before call as per skill guidelines
    if (!this.ai) {
      const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY;
      if (!apiKey) {
         // This shouldn't normally happen if the environment is set up
         console.warn("No API Key found for Veo generation.");
      }
      this.ai = new GoogleGenAI({ apiKey: apiKey as string });
    }
    return this.ai;
  }

  static async hasKey(): Promise<boolean> {
    if (typeof window === 'undefined' || !(window as any).aistudio) return true;
    return await (window as any).aistudio.hasSelectedApiKey();
  }

  static async selectKey(): Promise<void> {
    if (typeof window !== 'undefined' && (window as any).aistudio) {
      await (window as any).aistudio.openSelectKey();
    }
  }

  static async generateVideo(prompt: string, imageBase64: string): Promise<string> {
    const ai = await this.getAIInstance();
    
    try {
      let operation = await ai.models.generateVideos({
        model: 'veo-3.1-lite-generate-preview',
        prompt: prompt,
        image: {
          imageBytes: imageBase64.split(',')[1], // Strip data:image/png;base64,
          mimeType: 'image/png',
        },
        config: {
          numberOfVideos: 1,
          resolution: '720p',
          aspectRatio: '16:9'
        }
      });

      // Polling for completion
      while (!operation.done) {
        await new Promise(resolve => setTimeout(resolve, 5000));
        operation = await ai.operations.getVideosOperation({ operation: operation });
      }

      const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
      if (!downloadLink) throw new Error("Video generation failed: No download link returned.");

      const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY;
      const response = await fetch(downloadLink, {
        method: 'GET',
        headers: {
          'x-goog-api-key': apiKey as string,
        },
      });

      if (!response.ok) throw new Error(`Failed to fetch video: ${response.statusText}`);
      
      const blob = await response.blob();
      return URL.createObjectURL(blob);
    } catch (error: any) {
      if (error?.message?.includes("Requested entity was not found.")) {
        // Reset and prompt for key again if needed (handled by UI)
        throw new Error("API_KEY_EXPIRED");
      }
      throw error;
    }
  }
}
