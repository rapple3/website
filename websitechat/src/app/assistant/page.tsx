'use client';

import React, { useState, useRef } from 'react';
import ReactMarkdown from 'react-markdown';

type Message = {
  role: 'user' | 'assistant';
  content: string;
  id: string;
  mode?: 'quick' | 'detailed';
};

export default function AssistantChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<'quick' | 'detailed'>('quick');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Add user message
    const userMessage: Message = {
      role: 'user',
      content: input,
      id: Date.now().toString(),
      mode
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Determine if we need detailed response
      const needsDetailedResponse = mode === 'detailed' || input.match(
        /(specific|details|project|experience at|when|dates|timeline)/i
      );

      const endpoint = needsDetailedResponse ? '/api/assistant-wip' : '/api/assistant-wip';
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: input,
          mode: needsDetailedResponse ? 'detailed' : 'quick'
        }),
      });

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }
      
      // Add assistant message
      const assistantMessage: Message = {
        role: 'assistant',
        content: data.message || 'Sorry, I encountered an error.',
        id: Date.now().toString(),
        mode: needsDetailedResponse ? 'detailed' : 'quick'
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error:', error);
      // Add error message to chat
      const errorMessage: Message = {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        id: Date.now().toString(),
        mode: mode
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid min-h-screen place-items-center bg-gray-50">
      <div className="w-full max-w-2xl h-[600px] bg-white rounded-xl shadow-lg flex flex-col m-4">
        <div className="p-4 border-b">
          <div className="flex justify-between items-center mb-2">
            <h1 className="text-xl font-semibold">Assistant Chat Test</h1>
            <div className="flex gap-2 text-sm">
              <button 
                onClick={() => setMode('quick')}
                className={`px-3 py-1 rounded-full transition-colors ${
                  mode === 'quick' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Quick
              </button>
              <button 
                onClick={() => setMode('detailed')}
                className={`px-3 py-1 rounded-full transition-colors ${
                  mode === 'detailed' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Detailed
              </button>
            </div>
          </div>
          <p className="text-sm text-gray-500">
            {mode === 'quick' ? 
              'Quick responses for general questions' : 
              'Detailed responses with document search'
            }
          </p>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map(m => (
            <MessageComponent key={m.id} message={m} />
          ))}
          {isLoading && (
            <div className="text-left">
              <div className="inline-block max-w-[85%] rounded-lg px-4 py-2 bg-gray-200">
                <div className="flex space-x-2">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100" />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200" />
                </div>
              </div>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="p-4 border-t">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="w-full rounded-lg border border-gray-300 p-4 focus:outline-none focus:border-blue-500"
            placeholder={`Type your message... (${mode} mode)`}
          />
        </form>
      </div>
    </div>
  );
}

function MessageComponent({ message }: { message: Message }) {
  return (
    <div className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} mb-4`}>
      <div 
        className={`${
          message.role === 'user' 
            ? 'bg-blue-500' 
            : 'bg-gray-200 dark:bg-gray-700'
        } rounded-lg px-4 py-2 max-w-[80%]`}
      >
        <ReactMarkdown 
          className={`prose dark:prose-invert max-w-none text-base ${
            message.role === 'user' ? 'text-white prose-headings:text-white prose-p:text-white prose-strong:text-white' : ''
          }`}
          components={{
            p: ({node, ...props}: any) => <p className="m-0 font-normal" {...props} />,
            ul: ({node, ...props}: any) => <ul className="list-disc ml-4 mb-2" {...props} />,
            ol: ({node, ...props}: any) => <ol className="list-decimal ml-4 mb-2" {...props} />,
            code: ({node, className, children, ...props}: any) => {
              const match = /language-(\w+)/.exec(className || '');
              return (
                <code 
                  className={`${
                    match ? 'block' : 'inline'
                  } bg-gray-100 dark:bg-gray-800 rounded ${
                    match ? 'p-2 my-2' : 'px-1'
                  }`} 
                  {...props}
                >
                  {children}
                </code>
              );
            }
          }}
        >
          {message.content}
        </ReactMarkdown>
      </div>
    </div>
  );
}
