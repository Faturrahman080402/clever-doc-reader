
import * as pdfjs from 'pdfjs-dist';
import { analyzeTextWithGoogleAI, answerQuestionWithGoogleAI } from './googleAIService';

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

export const analyzePDF = async (text: string): Promise<PDFAnalysisResult> => {
  try {
    // Use Google AI to analyze the content
    const analysisResult = await analyzeTextWithGoogleAI(text);
    
    return {
      text,
      summary: analysisResult.summary,
      title: analysisResult.title
    };
  } catch (error) {
    console.error('Error analyzing PDF with AI:', error);
    throw new Error('Failed to analyze PDF with AI');
  }
};

export const answerQuestion = async (
  question: string, 
  documentText: string
): Promise<string> => {
  try {
    return await answerQuestionWithGoogleAI(question, documentText);
  } catch (error) {
    console.error('Error answering question:', error);
    throw new Error('Failed to answer question');
  }
};
