"use client";

import { useChat } from "ai/react";
import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';

const suggestedQuestions = [
  "What's the story behind his transition from engineering to business?",
  "What makes his combination of skills unique?",
  "What kind of projects has he worked on?",
  "What is he currently working on?",
];

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

export default function Chat() {
  const formRef = React.useRef<HTMLFormElement>(null);
  const { messages, input, handleInputChange, handleSubmit, setInput } = useChat()
  const [clickedQuestion, setClickedQuestion] = useState<string | null>(null);

  const handleQuestionClick = (question: string) => {
    setClickedQuestion(question);
    setInput(question);
    
    setTimeout(() => {
      formRef.current?.requestSubmit();
      setClickedQuestion(null);
    }, 300);
  };

  return (
    <div className="
      min-h-[100dvh]    // Dynamic viewport height
      h-[100dvh]        // Dynamic viewport height
      bg-white 
      sm:bg-gray-50 
      sm:grid 
      sm:place-items-center
    ">
      <div className="
        flex flex-col
        w-full
        h-[100dvh]      // Dynamic viewport height on mobile
        sm:h-[600px]    // Fixed height on desktop
        bg-white
        sm:max-w-2xl
        sm:rounded-xl
        sm:shadow-lg
        sm:m-4
      ">
        <div className="p-4 border-b flex justify-between items-start sm:block">
          <div>
            <h1 className="text-xl font-semibold">Ask About Russell Apple</h1>
            <p className="text-sm text-gray-500">AI-powered assistant with info about my background & experience</p>
          </div>
          <a 
            href="https://www.linkedin.com/in/russellapple/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="sm:hidden text-blue-600 hover:text-blue-800"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
            </svg>
          </a>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-2">
                {suggestedQuestions.map((question, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuestionClick(question)}
                    className={`
                      text-left p-3 rounded-lg 
                      transition-all duration-300 ease-in-out
                      ${clickedQuestion === question 
                        ? 'bg-blue-500 text-white transform translate-x-[40%]' 
                        : 'bg-gray-50 hover:bg-gray-100'
                      }
                      ${clickedQuestion && clickedQuestion !== question ? 'opacity-0' : 'opacity-100'}
                    `}
                    disabled={clickedQuestion !== null}
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map(m => (
              <MessageComponent key={m.id} message={m} />
            ))
          )}
        </div>

        <form ref={formRef} onSubmit={handleSubmit} className="p-4 border-t">
          <input
            value={input}
            onChange={handleInputChange}
            className="w-full rounded-lg border border-gray-300 p-4 focus:outline-none focus:border-blue-500"
            placeholder="Type your message..."
            style={{ color: clickedQuestion ? 'transparent' : 'inherit' }}
          />
        </form>
      </div>

      {/* LinkedIn Icon */}
      <a 
        href="https://www.linkedin.com/in/russellapple/" 
        target="_blank" 
        rel="noopener noreferrer"
        className="hidden sm:fixed sm:bottom-4 sm:right-4 sm:block text-blue-600 hover:text-blue-800"
      >
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
        </svg>
      </a>
    </div>
  )
}
