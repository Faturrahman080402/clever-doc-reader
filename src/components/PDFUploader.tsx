
import React, { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Upload, AlertTriangle } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

interface PDFUploaderProps {
  onPdfUpload: (file: File) => void;
  isLoading: boolean;
}

export const PDFUploader: React.FC<PDFUploaderProps> = ({ onPdfUpload, isLoading }) => {
  const [dragActive, setDragActive] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    setFileError(null);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      validateAndUpload(file);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    setFileError(null);
    if (e.target.files && e.target.files[0]) {
      validateAndUpload(e.target.files[0]);
    }
  };

  const validateAndUpload = (file: File) => {
    console.log("File selected:", file.name, "Type:", file.type, "Size:", file.size);
    
    if (file.type !== 'application/pdf') {
      const errorMessage = "Please upload a PDF file.";
      setFileError(errorMessage);
      toast({
        title: "Invalid file type",
        description: errorMessage,
        variant: "destructive"
      });
      return;
    }
    
    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      const errorMessage = "File size exceeds 10MB limit.";
      setFileError(errorMessage);
      toast({
        title: "File too large",
        description: errorMessage,
        variant: "destructive"
      });
      return;
    }
    
    console.log("File validation passed, sending to processing");
    onPdfUpload(file);
  };

  const onButtonClick = () => {
    if (inputRef.current) {
      inputRef.current.click();
    }
  };

  return (
    <div 
      className={`w-full max-w-3xl mx-auto border-2 border-dashed rounded-lg p-6 ${
        dragActive ? 'border-primary bg-primary/5' : 'border-gray-300'
      } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
    >
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf"
        onChange={handleChange}
        className="hidden"
        disabled={isLoading}
      />
      
      <div className="flex flex-col items-center justify-center text-center">
        <Upload className="h-10 w-10 text-primary mb-4" />
        <h3 className="text-lg font-semibold mb-2">Upload a PDF</h3>
        <p className="text-sm text-gray-500 mb-4">
          Drag and drop or click to upload a PDF file
        </p>
        
        {fileError && (
          <Alert variant="destructive" className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{fileError}</AlertDescription>
          </Alert>
        )}
        
        <Button 
          onClick={onButtonClick} 
          disabled={isLoading}
          className="relative"
        >
          {isLoading ? "Processing..." : "Select File"}
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-5 w-5 rounded-full border-2 border-t-transparent border-primary animate-spin"></div>
            </div>
          )}
        </Button>
      </div>
    </div>
  );
};
