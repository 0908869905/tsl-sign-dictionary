
import { GoogleGenAI, Type } from "@google/genai";
import { VideoResult, WebSource } from "../types";
import { checkLocalData } from "./localData";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const searchVideos = async (query: string): Promise<{ results: VideoResult[], webSources: WebSource[] }> => {
  if (!query.trim()) return { results: [], webSources: [] };

  // 1. Initial Local Search (Exact Match)
  // This ensures fast response for obvious queries
  let results: VideoResult[] = checkLocalData(query);
  const matchedIds = new Set(results.map(r => r.timestamp)); // Use timestamp as unique key for deduplication

  try {
    // 2. Parallel AI Tasks: Synonym Expansion & Web Search
    // We use Gemini to make the search "semantic" by finding related keywords
    const [synonymResponse, webResponse] = await Promise.all([
      // Task A: Get Synonyms to expand search coverage
      ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `List 3 to 5 traditional Chinese synonyms or related terms for "${query}" that are likely to appear in a Taiwan CDC press conference transcript. For example if input is "打針", output ["疫苗", "接種"]. Return only a JSON array of strings.`,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          }
        }
      }),
      
      // Task B: Get external Web Sources using Google Search Grounding
      ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Find official or educational web resources about Taiwan Sign Language (TSL) for the term "${query}".`,
        config: {
          tools: [{ googleSearch: {} }]
        }
      })
    ]);

    // 3. Process Synonyms
    const synonyms = JSON.parse(synonymResponse.text || "[]") as string[];
    console.log(`[Gemini] Synonyms for "${query}":`, synonyms);

    synonyms.forEach(syn => {
      // Avoid re-searching the original query
      if (syn.toLowerCase() !== query.toLowerCase()) {
        const synResults = checkLocalData(syn);
        synResults.forEach(r => {
          if (!matchedIds.has(r.timestamp)) {
            results.push(r);
            matchedIds.add(r.timestamp);
          }
        });
      }
    });

    // 4. Process Web Sources
    const webSources: WebSource[] = [];
    const chunks = webResponse.candidates?.[0]?.groundingMetadata?.groundingChunks;
    
    if (chunks) {
      chunks.forEach(chunk => {
        if (chunk.web?.uri && chunk.web?.title) {
          webSources.push({
            uri: chunk.web.uri,
            title: chunk.web.title
          });
        }
      });
    }

    // Sort results chronologically
    results.sort((a, b) => a.timestamp - b.timestamp);

    return { results, webSources };

  } catch (error) {
    console.warn("AI search enhancement failed, falling back to basic local search:", error);
    // If AI fails, still return the local exact matches we found earlier
    return { results, webSources: [] };
  }
};
