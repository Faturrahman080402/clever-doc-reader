
import * as pdfjs from 'pdfjs-dist';
import OpenAI from 'openai';

// Set the worker source for pdf.js
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

export interface PDFAnalysisResult {
  text: string;
  summary: string[];
  title?: string;
}

export const extractTextFromPDF = async (file: File): Promise<string> => {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
    
    let fullText = '';
    
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ');
      
      fullText += pageText + '\n\n';
    }
    
    return fullText;
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    throw new Error('Failed to extract text from PDF');
  }
};

export const analyzePDF = async (text: string, apiKey: string): Promise<PDFAnalysisResult> => {
  try {
    // Initialize OpenAI client with the provided API key
    const openai = new OpenAI({ apiKey });
    
    // Analyze the PDF content with OpenAI
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini", // You can change the model as needed
      messages: [
        {
          role: "system", 
          content: "You are a helpful assistant that analyzes PDF documents. Extract the main points and create a summary."
        },
        {
          role: "user", 
          content: `Please analyze the following document and provide:
          1. A probable title for this document
          2. A summary of up to 10 key points
          
          Document text:
          ${text.substring(0, 15000)}` // Limit text length to avoid token limits
        }
      ],
      temperature: 0.3,
    });
    
    const analysisText = response.choices[0].message.content || "";
    
    // Extract title and summary points
    let title = "";
    const summaryPoints: string[] = [];
    
    // Simple parsing of AI response
    const lines = analysisText.split('\n');
    for (const line of lines) {
      if (line.toLowerCase().includes('title:')) {
        title = line.split('title:')[1].trim();
      } 
      // Match numbered or bullet points
      else if (/^\d+\.|\-|\•/.test(line.trim())) {
        const point = line.replace(/^\d+\.|\-|\•/, '').trim();
        if (point) summaryPoints.push(point);
      }
    }
    
    return {
      text,
      summary: summaryPoints.length > 0 ? summaryPoints : [analysisText],
      title
    };
  } catch (error) {
    console.error('Error analyzing PDF with AI:', error);
    throw new Error('Failed to analyze PDF with AI');
  }
};

export const answerQuestion = async (
  question: string, 
  documentText: string, 
  apiKey: string
): Promise<string> => {
  try {
    const openai = new OpenAI({ apiKey });
    
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system", 
          content: "You are a helpful assistant that answers questions about documents. Use only the provided document text to answer questions. If the answer isn't in the document, say so clearly."
        },
        {
          role: "user", 
          content: `Document text: ${documentText.substring(0, 15000)}
          
          Question: ${question}`
        }
      ],
      temperature: 0.2,
    });
    
    return response.choices[0].message.content || "Sorry, I couldn't generate an answer.";
  } catch (error) {
    console.error('Error answering question:', error);
    throw new Error('Failed to answer question');
  }
};
