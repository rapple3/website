"use client";

import { useChat } from "ai/react";
import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Message as AIMessage } from 'ai';

type Message = {
  role: 'user' | 'assistant' | 'system' | 'function';
  content: string;
  id: string;
};

const suggestedQuestions = [
  "What's the story behind his transition from engineering to business?",
  "What makes his combination of skills unique?",
  "What kind of projects has he worked on?",
  "What is he currently working on?",
];

function MessageComponent({ message }: { message: AIMessage }) {
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
  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const { messages, input, handleInputChange, handleSubmit, setInput } = useChat();
  const [clickedQuestion, setClickedQuestion] = useState<string | null>(null);
  const [darkMode, setDarkMode] = useState(false);

  // Simple scroll to bottom function
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Scroll when messages change
  React.useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [messages]);

  const handleQuestionClick = (question: string) => {
    setClickedQuestion(question);
    setInput(question);
    
    setTimeout(() => {
      formRef.current?.requestSubmit();
      setClickedQuestion(null);
    }, 300);
  };

  // Get theme classes based on dark mode state
  const themeClasses = {
    container: darkMode ? "bg-gray-900 text-white" : "bg-white sm:bg-gray-50",
    header: darkMode ? "border-gray-700" : "border-gray-200",
    messageContainer: darkMode ? "bg-gray-900" : "bg-white",
    userMessage: darkMode ? "bg-blue-600 text-white" : "bg-blue-500 text-white",
    assistantMessage: darkMode ? "bg-gray-800 text-white" : "bg-gray-200",
    input: darkMode 
      ? "bg-gray-800 border-gray-700 text-white placeholder-gray-400 focus:border-blue-500" 
      : "border-gray-300 focus:border-blue-500",
    suggestedQuestion: darkMode 
      ? "bg-gray-800 hover:bg-gray-700 text-white" 
      : "bg-gray-50 hover:bg-gray-100"
  };

  return (
    <div className={`
      min-h-[100dvh]
      h-[100dvh]
      ${themeClasses.container}
      sm:grid 
      sm:place-items-center
      transition-colors duration-300
    `}>
      {/* Dark mode toggle - positioned in top right */}
      <div className="fixed top-4 right-4 z-10">
        <button 
          onClick={() => setDarkMode(!darkMode)}
          className={`p-2 rounded-full ${darkMode ? 'bg-gray-700' : 'bg-gray-200'}`}
          aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
        >
          {darkMode ? (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
            </svg>
          )}
        </button>
      </div>

      <div className={`
        flex flex-col
        w-full
        h-[100dvh]
        sm:h-[600px]
        ${themeClasses.messageContainer}
        sm:max-w-2xl
        sm:rounded-xl
        sm:shadow-lg
        sm:m-4
        transition-colors duration-300
      `}>
        <div className={`p-4 border-b ${themeClasses.header} transition-colors duration-300`}>
          <h1 className="text-xl font-semibold">Ask About Russell Apple</h1>
          <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-500"}`}>
            AI-powered assistant with info about my background & experience
          </p>
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
                        : themeClasses.suggestedQuestion
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
              <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} mb-4`}>
                <div 
                  className={`${
                    m.role === 'user' 
                      ? themeClasses.userMessage
                      : themeClasses.assistantMessage
                  } rounded-lg px-4 py-2 max-w-[80%] transition-colors duration-300`}
                >
                  <ReactMarkdown 
                    className={`prose max-w-none text-base ${
                      m.role === 'user' ? 'text-white prose-headings:text-white prose-p:text-white prose-strong:text-white' : 
                      darkMode ? 'prose-invert' : ''
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
                            } ${darkMode ? 'bg-gray-800' : 'bg-gray-100'} rounded ${
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
                    {m.content}
                  </ReactMarkdown>
                </div>
              </div>
            ))
          )}
          {/* Invisible element to scroll to */}
          <div ref={messagesEndRef} />
        </div>

        <form ref={formRef} onSubmit={handleSubmit} className={`p-4 border-t ${themeClasses.header} transition-colors duration-300`}>
          <input
            value={input}
            onChange={handleInputChange}
            className={`w-full rounded-lg border p-4 focus:outline-none ${themeClasses.input} transition-colors duration-300`}
            placeholder="Type your message..."
            style={{ color: clickedQuestion ? 'transparent' : 'inherit' }}
          />
        </form>
      </div>

      {/* LinkedIn Icon - desktop only */}
      <a 
        href="https://www.linkedin.com/in/russellapple/" 
        target="_blank" 
        rel="noopener noreferrer"
        className={`hidden sm:fixed sm:bottom-4 sm:right-4 sm:block ${darkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-800'}`}
      >
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
        </svg>
      </a>
    </div>
  )
}
