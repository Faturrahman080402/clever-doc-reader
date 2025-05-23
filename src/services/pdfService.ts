
import * as pdfjs from 'pdfjs-dist';
import { analyzeTextWithGoogleAI, answerQuestionWithGoogleAI } from './googleAIService';

// Configure the worker source using a valid approach
if (typeof window !== 'undefined' && 'Worker' in window) {
  const workerUrl = new URL(
    'pdfjs-dist/build/pdf.worker.mjs',
    import.meta.url
  );
  pdfjs.GlobalWorkerOptions.workerSrc = workerUrl.toString();
}

export interface PDFAnalysisResult {
  text: string;
  summary: string[];
  title?: string;
}

export const extractTextFromPDF = async (file: File): Promise<string> => {
  try {
    console.log("Starting PDF extraction...");
    const arrayBuffer = await file.arrayBuffer();
    console.log("File loaded as ArrayBuffer");
    
    const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
    console.log(`PDF loaded with ${pdf.numPages} pages`);
    
    // Check if the PDF exceeds the page limit
    if (pdf.numPages > 300) {
      throw new Error(`PDF has ${pdf.numPages} pages, which exceeds the 300-page limit`);
    }
    
    let fullText = '';
    
    for (let i = 1; i <= pdf.numPages; i++) {
      console.log(`Processing page ${i}/${pdf.numPages}`);
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ');
      
      fullText += pageText + '\n\n';
    }
    
    console.log("Text extraction complete");
    return fullText;
  } catch (error) {
    console.error('Error extracting text from PDF:', error);
    throw new Error(typeof error === 'object' && error !== null ? (error as Error).message : 'Failed to extract text from PDF');
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
