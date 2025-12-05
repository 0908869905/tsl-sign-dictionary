
import { GoogleGenAI, Type } from "@google/genai";
import { VideoResult, WebSource } from "../types";
import { checkLocalData } from "./localData";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const searchVideos = async (query: string): Promise<{ results: VideoResult[], webSources: WebSource[], expandedTerms: string[] }> => {
  if (!query.trim()) return { results: [], webSources: [], expandedTerms: [] };

  try {
    // Parallel Execution: Synonym Expansion + Web Grounding
    const [synonymsResponse, groundingResponse] = await Promise.all([
      // Task A: Generate Synonyms to improve recall
      ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `List 5 Traditional Chinese synonyms or related terms for "${query}" that might appear in Taiwan CDC press conferences (e.g., medical terms, pandemic keywords, formal vs colloquial).`,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          }
        }
      }),
      // Task B: Web Grounding to find external sources
      ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Find official Taiwan CDC or medical information about "${query}" (TSL 手語).`,
        config: {
          tools: [{ googleSearch: {} }]
        }
      })
    ]);

    // 1. Process Synonyms
    let synonyms: string[] = [];
    try {
      if (synonymsResponse.text) {
        synonyms = JSON.parse(synonymsResponse.text);
      }
    } catch (e) {
      console.warn("Failed to parse synonyms:", e);
    }

    // Combine original query with synonyms for broader search
    const searchTerms = [query, ...synonyms];

    // 2. Search Local Data with expanded terms
    const results = checkLocalData(searchTerms);

    // 3. Process Web Sources from Grounding
    const webSources: WebSource[] = [];
    const chunks = groundingResponse.candidates?.[0]?.groundingMetadata?.groundingChunks;
    
    if (chunks) {
      chunks.forEach((chunk: any) => {
        if (chunk.web?.uri && chunk.web?.title) {
          webSources.push({
            uri: chunk.web.uri,
            title: chunk.web.title
          });
        }
      });
    }

    // Deduplicate web sources based on URI
    const uniqueWebSources = webSources.filter((source, index, self) =>
      index === self.findIndex((s) => s.uri === source.uri)
    ).slice(0, 4); // Limit to 4 sources

    return { results, webSources: uniqueWebSources, expandedTerms: synonyms };

  } catch (error) {
    console.error("Gemini API Error:", error);
    // Fallback to basic local search if API fails
    return { 
      results: checkLocalData([query]), 
      webSources: [],
      expandedTerms: []
    };
  }
};
