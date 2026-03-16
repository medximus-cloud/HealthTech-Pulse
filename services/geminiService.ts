import { GoogleGenAI, Type } from "@google/genai";
import { GeneratedContent, Platform, ContentType, TrendsResult, TrendItem, Source } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

/**
 * Generates the text content and a search query for an image based on the input and content type.
 */
export const generateHealthTechContent = async (
  input: string, 
  platform: Platform,
  contentType: ContentType = ContentType.NEWS_ANALYSIS
): Promise<GeneratedContent> => {
  if (!apiKey) throw new Error("API Key is missing.");

  const model = "gemini-3-flash-preview";
  
  // Define persona once
  const persona = `You are **The Medical Futurist**. Your tone is visionary, optimistic, authoritative, and energetic. You focus on the future of medicine, digital health, and patient empowerment.`;
  
  let specificInstructions = "";
  let structurePrompt = "";

  switch (contentType) {
    case ContentType.POLL:
      specificInstructions = `
        Create a high-engagement ${platform} Poll about the topic.
        1. Write a compelling **Post Text** (Intro) that sets the context and asks the audience to weigh in.
        2. Provide 3-4 distinct **Poll Options** (Maximum 30 chars each for LinkedIn/Twitter limits).
        3. Explain *why* this choice matters in a brief conclusion.
        4. **Do NOT use hashtags.**
      `;
      structurePrompt = "Format the output clearly with the Post Text first, followed by a separate section for 'Poll Options'.";
      break;

    case ContentType.QUESTION:
      specificInstructions = `
        Create a provocative **Discussion Question** or Debate Starter for ${platform}.
        The goal is to get comments and engagement.
        1. Start with a controversial (but professional) statement or a "What if" scenario.
        2. Ask a direct, open-ended question.
        3. Keep it short and punchy.
        4. **Do NOT use hashtags.**
      `;
      break;

    case ContentType.VIDEO_SCRIPT:
      specificInstructions = `
        Write a **60-Second Video Script** (for TikTok/Reels/Shorts) about the topic.
        Format it as a table or clear list with:
        - **Visual Cue:** (e.g., [Me talking to camera], [Text Overlay: ...])
        - **Audio:** (The spoken script)
        
        Structure:
        1. **The Hook** (0-3s): Grab attention immediately.
        2. **The Problem/Insight** (3-40s): Explain the innovation or news.
        3. **The Payoff/Future** (40-50s): Why it matters.
        4. **CTA** (50-60s): Ask them to follow or comment.
      `;
      structurePrompt = "Ensure the script is conversational and spoken-word style.";
      break;

    case ContentType.NEWS_ANALYSIS:
    default:
      const platformContext = platform === Platform.LINKEDIN 
        ? "Write a visionary post (150-250 words). Start with a hook. **Use bullet points.** End with a question."
        : "Write a short, punchy insight (under 280 chars). Focus on immediate impact.";
      
      specificInstructions = `
        Analyze this news/topic.
        ${platformContext}
        **ALWAYS use bullet points** for key insights.
        **NEVER use hashtags.**
        Extract specific data/examples if available.
      `;
      break;
  }

  const systemInstruction = `
    ${persona}
    
    Task: ${specificInstructions}
    
    Instruction on Image:
    Provide a specific **Search Query** to find a real-world image or thumbnail related to this topic.
  `;

  const prompt = `
    Generate content based on this input: "${input}"
    Content Type: ${contentType}
    ${structurePrompt}
  `;

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      systemInstruction,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          postText: {
            type: Type.STRING,
            description: "The formatted content (post, script, or poll text).",
          },
          imagePrompt: {
            type: Type.STRING,
            description: "A specific search query to find an existing real-world image on the web.",
          },
        },
        required: ["postText", "imagePrompt"],
      },
    },
  });

  const text = response.text;
  if (!text) throw new Error("Failed to generate text content.");

  try {
    return JSON.parse(text) as GeneratedContent;
  } catch (e) {
    console.error("Failed to parse JSON response", e);
    throw new Error("Invalid response format from AI.");
  }
};

/**
 * Rewrites the text to sound more natural and human-like.
 */
export const naturalizeText = async (text: string, platform: Platform): Promise<string> => {
  if (!apiKey) throw new Error("API Key is missing.");
  const model = "gemini-3-flash-preview";

  const prompt = `
    Rewrite the following content to sound more natural, human-written, and conversational.
    Remove robotic phrasing, excessive buzzwords, or stiff sentence structures.
    Keep the core message, facts, and structure (e.g., if it's a script or poll, keep that format).
    Do NOT use hashtags.
    
    Original Content:
    "${text}"
  `;

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
  });

  return response.text?.trim() || text;
};

/**
 * Finds a related image URL from the internet using Google Search grounding.
 */
export const findRelatedImage = async (searchQuery: string): Promise<string> => {
  if (!apiKey) throw new Error("API Key is missing.");

  const model = "gemini-3-flash-preview";

  const prompt = `
    Find a publicly accessible, high-quality image URL related to the following topic: "${searchQuery}".
    The image should be suitable for a professional healthcare presentation.
    
    Return ONLY the raw URL string of the image. Do not return Markdown or JSON.
    If you find a news article with a relevant image, extract the image URL.
  `;

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      tools: [{ googleSearch: {} }],
    },
  });

  let imageUrl = response.text?.trim() || "";
  
  // Basic cleanup if the model returns markdown like ![](url) or [link](url)
  const markdownMatch = imageUrl.match(/\((https?:\/\/[^)]+)\)/);
  if (markdownMatch) {
    imageUrl = markdownMatch[1];
  }

  // If the model fails to return a valid URL structure, return a placeholder or empty string
  if (!imageUrl.startsWith("http")) {
      console.warn("Model did not return a valid image URL:", imageUrl);
      return "";
  }

  return imageUrl;
};

/**
 * Scans for trending health tech news using Google Search grounding.
 */
export const getTrendingNews = async (): Promise<TrendsResult> => {
  if (!apiKey) throw new Error("API Key is missing.");

  const model = "gemini-3-flash-preview";
  
  const prompt = `
    Find 3 distinct, high-impact news stories related to **Healthcare Startups, Cutting-edge Medical Innovations, Digital Health, or Futuristic Medical Breakthroughs** from the last month.
    
    For each story, provide a Professional Headline and a 1-sentence Strategic Summary.
    
    Strictly format your response as follows for each item:
    
    ITEM_START
    HEADLINE: [Insert Headline Here]
    SUMMARY: [Insert Summary Here]
    ITEM_END
  `;

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      tools: [{ googleSearch: {} }],
    },
  });

  const text = response.text || "";
  
  const trends: TrendItem[] = [];
  const items = text.split("ITEM_START");
  
  for (const item of items) {
    const headlineMatch = item.match(/HEADLINE:\s*(.+)/);
    const summaryMatch = item.match(/SUMMARY:\s*(.+)/); 
    
    if (headlineMatch && summaryMatch) {
      let summary = summaryMatch[1].trim();
      if (summary.includes("ITEM_END")) {
        summary = summary.split("ITEM_END")[0].trim();
      }

      trends.push({
        headline: headlineMatch[1].trim(),
        summary: summary,
      });
    }
  }

  const sources: Source[] = [];
  const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
  
  if (groundingChunks) {
    groundingChunks.forEach((chunk: any) => {
      if (chunk.web) {
        sources.push({
          title: chunk.web.title || "Source",
          uri: chunk.web.uri
        });
      }
    });
  }

  const uniqueSources = sources.filter((v, i, a) => a.findIndex(t => (t.uri === v.uri)) === i);

  return {
    trends: trends.slice(0, 3),
    sources: uniqueSources
  };
};