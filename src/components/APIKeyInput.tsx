
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface APIKeyInputProps {
  onApiKeySubmit: (apiKey: string) => void;
}

export const APIKeyInput: React.FC<APIKeyInputProps> = ({ onApiKeySubmit }) => {
  const [apiKey, setApiKey] = useState('');
  const [savedKey, setSavedKey] = useState(() => {
    const savedValue = localStorage.getItem('openai_api_key');
    return savedValue || '';
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (apiKey.trim()) {
      localStorage.setItem('openai_api_key', apiKey);
      setSavedKey(apiKey);
      onApiKeySubmit(apiKey);
    }
  };

  const handleUseSaved = () => {
    if (savedKey) {
      onApiKeySubmit(savedKey);
    }
  };

  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader>
        <CardTitle>OpenAI API Key</CardTitle>
        <CardDescription>
          Enter your OpenAI API key to analyze PDF documents
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid w-full gap-1.5">
            <Label htmlFor="apiKey">API Key</Label>
            <Input
              id="apiKey"
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk-..."
              className="font-mono"
            />
            <p className="text-xs text-gray-500">
              Your key is stored locally in your browser and never sent to our servers
            </p>
          </div>
          
          <div className="flex gap-2">
            <Button type="submit" disabled={!apiKey.trim()}>
              Save & Use Key
            </Button>
            
            {savedKey && (
              <Button type="button" variant="outline" onClick={handleUseSaved}>
                Use Saved Key
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
