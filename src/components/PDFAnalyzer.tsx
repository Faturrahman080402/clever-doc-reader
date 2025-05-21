
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { PDFAnalysisResult, answerQuestion } from '@/services/pdfService';
import { Search } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";

interface PDFAnalyzerProps {
  result: PDFAnalysisResult;
}

export const PDFAnalyzer: React.FC<PDFAnalyzerProps> = ({ result }) => {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [isAnswering, setIsAnswering] = useState(false);
  const { toast } = useToast();
  
  const handleQuestionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) {
      toast({
        title: "Question required",
        description: "Please enter a question about the document.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setIsAnswering(true);
      const response = await answerQuestion(question, result.text);
      setAnswer(response);
    } catch (error) {
      console.error("Error answering question:", error);
      toast({
        title: "Error",
        description: "Failed to answer your question. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsAnswering(false);
    }
  };

  // Function to search for text in the document
  const searchInDocument = (searchText: string) => {
    if (!searchText.trim()) return;
    
    const foundIndex = result.text.toLowerCase().indexOf(searchText.toLowerCase());
    if (foundIndex >= 0) {
      // Create a snippet around the found text
      const snippetStart = Math.max(0, foundIndex - 100);
      const snippetEnd = Math.min(result.text.length, foundIndex + searchText.length + 100);
      const snippet = result.text.substring(snippetStart, snippetEnd);
      
      setAnswer(`Found "${searchText}" in the document:\n\n"...${snippet}..."`);
    } else {
      setAnswer(`The text "${searchText}" was not found in the document.`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Document summary card */}
      <Card>
        <CardHeader>
          <CardTitle>{result.title || "Document Analysis"}</CardTitle>
          <CardDescription>
            Key points extracted from the document
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="list-disc pl-6 space-y-2">
            {result.summary.map((point, index) => (
              <li key={index} className="text-sm text-gray-700">{point}</li>
            ))}
          </ul>
        </CardContent>
      </Card>
      
      {/* Question answering form */}
      <Card>
        <CardHeader>
          <CardTitle>Ask about the document</CardTitle>
          <CardDescription>
            Ask questions or search for specific information in the document
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleQuestionSubmit} className="space-y-4">
            <div className="grid w-full gap-1.5">
              <Label htmlFor="question">Your question</Label>
              <div className="flex gap-2">
                <Input
                  id="question"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="What is the main topic of this document?"
                  disabled={isAnswering}
                  className="flex-1"
                />
                <Button 
                  type="submit" 
                  disabled={isAnswering}
                >
                  {isAnswering ? "Thinking..." : "Ask"}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => searchInDocument(question)}
                  disabled={isAnswering || !question.trim()}
                >
                  <Search className="h-4 w-4 mr-2" />
                  Search
                </Button>
              </div>
            </div>
            
            {answer && (
              <div className="grid w-full gap-1.5">
                <Label htmlFor="answer">Answer</Label>
                <Textarea
                  id="answer"
                  value={answer}
                  readOnly
                  className="min-h-[120px]"
                />
              </div>
            )}
          </form>
        </CardContent>
      </Card>
      
      {/* Raw document text (collapsible) */}
      <Card>
        <CardHeader>
          <CardTitle>Document Text</CardTitle>
          <CardDescription>
            The extracted raw text from your document
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="max-h-[300px] overflow-y-auto border rounded-md p-4">
            <pre className="whitespace-pre-wrap text-sm">{result.text}</pre>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
