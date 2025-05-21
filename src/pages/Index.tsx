
import React, { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { PDFUploader } from '@/components/PDFUploader';
import { PDFAnalyzer } from '@/components/PDFAnalyzer';
import { PDFAnalysisResult, extractTextFromPDF, analyzePDF } from '@/services/pdfService';
import { useToast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText } from 'lucide-react';

const Index = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<PDFAnalysisResult | null>(null);
  const { toast } = useToast();

  const handlePdfUpload = async (uploadedFile: File) => {
    try {
      setFile(uploadedFile);
      setIsProcessing(true);
      toast({
        title: "Processing PDF",
        description: "Extracting text and analyzing content...",
      });
      
      // Extract text from PDF
      const extractedText = await extractTextFromPDF(uploadedFile);
      
      // Analyze the PDF content
      const result = await analyzePDF(extractedText);
      
      setAnalysisResult(result);
      toast({
        title: "Analysis Complete",
        description: "Your PDF has been successfully analyzed.",
      });
    } catch (error) {
      console.error("PDF processing error:", error);
      toast({
        title: "Processing Error",
        description: "Failed to process the PDF. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="container flex-1 py-10 px-4 md:px-6">
        <Tabs defaultValue={analysisResult ? "results" : "upload"}>
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
            <TabsTrigger value="upload">Upload PDF</TabsTrigger>
            <TabsTrigger value="results" disabled={!analysisResult}>Results</TabsTrigger>
          </TabsList>
          
          <TabsContent value="upload" className="mt-0">
            <div className="flex flex-col items-center mb-8 text-center">
              <FileText className="h-12 w-12 text-primary mb-4" />
              <h1 className="text-3xl font-bold mb-2">CleverDocReader</h1>
              <p className="text-gray-500 max-w-md mx-auto">
                Your AI-powered document analysis assistant
              </p>
            </div>
            <PDFUploader onPdfUpload={handlePdfUpload} isLoading={isProcessing} />
          </TabsContent>
          
          <TabsContent value="results" className="mt-0">
            {analysisResult && (
              <>
                <div className="flex items-baseline justify-between mb-6">
                  <h1 className="text-2xl font-bold">
                    {analysisResult.title || (file?.name || "Document Analysis")}
                  </h1>
                  <p className="text-sm text-gray-500">
                    {file?.name}
                  </p>
                </div>
                <PDFAnalyzer result={analysisResult} />
              </>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Index;
