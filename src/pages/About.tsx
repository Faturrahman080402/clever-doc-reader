
import React from 'react';
import { Header } from '@/components/layout/Header';

const About = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="container max-w-3xl mx-auto py-8 px-4 md:px-0 flex-1">
        <h1 className="text-3xl font-bold mb-6">About CleverDocReader</h1>
        
        <div className="space-y-6">
          <section>
            <h2 className="text-xl font-semibold mb-2">What is CleverDocReader?</h2>
            <p className="text-gray-700">
              CleverDocReader is a local PDF analysis tool that uses artificial intelligence 
              to help you extract insights from your documents. Upload your PDFs and get 
              instant summaries, key points, and the ability to ask questions about the content.
            </p>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold mb-2">Privacy First</h2>
            <p className="text-gray-700">
              We take your privacy seriously. Your documents are processed locally in your 
              browser whenever possible. When AI analysis is needed, only the necessary text 
              is sent to the OpenAI API using your own API key. We never store your documents 
              or your API key on our servers.
            </p>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold mb-2">Features</h2>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>Upload and analyze PDF documents</li>
              <li>Extract full text from PDFs</li>
              <li>Generate concise summaries with key points</li>
              <li>Ask questions about document content</li>
              <li>Search for specific information in documents</li>
              <li>Privacy-focused design</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
};

export default About;
