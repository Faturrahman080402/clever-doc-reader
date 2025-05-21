
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';

// Define API key
const API_KEY = "AIzaSyCcLfyHhmoheTZinWDaJIPN6nn8nB3L9fQ";

// Initialize Google AI
const genAI = new GoogleGenerativeAI(API_KEY);

export const analyzeTextWithGoogleAI = async (text: string): Promise<{
  summary: string[];
  title?: string;
}> => {
  try {
    // For text generation using Gemini model
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const generationConfig = {
      temperature: 0.3,
      topK: 32,
      topP: 0.95,
      maxOutputTokens: 4096,
    };

    const safetySettings = [
      {
        category: HarmCategory.HARM_CATEGORY_HARASSMENT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
    ];

    const prompt = `Please analyze the following document and provide:
    1. A probable title for this document (start with 'TITLE:')
    2. A summary of up to 10 key points (each point should start with a number followed by a period)
    
    Document text:
    ${text.substring(0, 15000)}`; // Limit text to avoid token limits

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig,
      safetySettings,
    });

    const response = result.response;
    const responseText = response.text();

    // Parse the response to extract title and summary points
    let title = "";
    const summaryPoints: string[] = [];
    
    // Simple parsing of AI response
    const lines = responseText.split('\n');
    for (const line of lines) {
      if (line.toLowerCase().includes('title:')) {
        title = line.split('title:')[1]?.trim() || "";
      } 
      // Match numbered points (1., 2., etc)
      else if (/^\d+\./.test(line.trim())) {
        const point = line.replace(/^\d+\./, '').trim();
        if (point) summaryPoints.push(point);
      }
    }
    
    return {
      summary: summaryPoints.length > 0 ? summaryPoints : [responseText],
      title
    };

  } catch (error) {
    console.error('Error analyzing with Google AI:', error);
    throw new Error('Failed to analyze with Google AI');
  }
};

export const answerQuestionWithGoogleAI = async (
  question: string, 
  documentText: string
): Promise<string> => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const generationConfig = {
      temperature: 0.2,
      topK: 32,
      topP: 0.95,
      maxOutputTokens: 2048,
    };

    const safetySettings = [
      {
        category: HarmCategory.HARM_CATEGORY_HARASSMENT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
    ];

    const prompt = `Document text: ${documentText.substring(0, 15000)}
    
    Question: ${question}
    
    Answer the question using only information from the document. If the answer isn't in the document, say so clearly.`;

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig,
      safetySettings,
    });

    const response = result.response;
    return response.text();
    
  } catch (error) {
    console.error('Error answering question with Google AI:', error);
    throw new Error('Failed to answer question with Google AI');
  }
};
