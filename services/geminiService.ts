
import { VideoResult, WebSource } from "../types";
import { checkLocalData } from "./localData";

// Currently restricted to local data only as per user request.
// To enable AI search again, uncomment the GoogleGenAI import and usage.

export const searchVideos = async (query: string): Promise<{ results: VideoResult[], webSources: WebSource[] }> => {
  // Simulate a short delay for better UX
  await new Promise(resolve => setTimeout(resolve, 300));

  if (!query.trim()) return { results: [], webSources: [] };

  // Check local data from the provided transcript
  // This uses the specific video ID: xlLcVJ4ny9A
  const results = checkLocalData(query);
  
  // Return local results only. 
  // Web sources are empty because we are not performing an external search.
  return { results, webSources: [] };
};
