"use client";

import { useChat } from "ai/react";
import React, { useState, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { Message as AIMessage } from 'ai';

const suggestedQuestions = [
  "What are you building right now?",
  "What does a derivatives analyst actually do?",
  "Why are you so into bikes?",
  "How's Georgia Tech football going?",
];

function MessageComponent({ message }: { message: AIMessage }) {
  const isUser = message.role === 'user';
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`${
          isUser ? 'bg-ink text-paper' : 'bg-paper border-2 border-ink'
        } rounded-xl px-4 py-2 max-w-[85%]`}
      >
        <ReactMarkdown
          className={`prose max-w-none text-base ${
            isUser ? 'text-paper prose-headings:text-paper prose-p:text-paper prose-strong:text-paper' : 'text-ink'
          }`}
          components={{
            p: ({node, ...props}: any) => <p className="m-0 font-normal" {...props} />,
            ul: ({node, ...props}: any) => <ul className="list-disc ml-4 mb-2" {...props} />,
            ol: ({node, ...props}: any) => <ol className="list-decimal ml-4 mb-2" {...props} />,
          }}
        >
          {message.content}
        </ReactMarkdown>
      </div>
    </div>
  );
}

export default function Chat() {
  const formRef = useRef<HTMLFormElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { messages, input, handleInputChange, handleSubmit, setInput, isLoading } = useChat();
  const [clickedQuestion, setClickedQuestion] = useState<string | null>(null);

  // Keep the newest message in view by scrolling the chat box itself
  // (not the whole page, which would make it jump around)
  React.useEffect(() => {
    const el = scrollRef.current;
    if (el && messages.length > 0) {
      el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
    }
  }, [messages, isLoading]);

  const handleQuestionClick = (question: string) => {
    setClickedQuestion(question);
    setInput(question);

    setTimeout(() => {
      formRef.current?.requestSubmit();
      setClickedQuestion(null);
    }, 300);
  };

  // Show the typing indicator until the reply actually starts arriving
  const lastMessage = messages[messages.length - 1];
  const replyStarted = lastMessage && lastMessage.role === 'assistant' && lastMessage.content.length > 0;
  const showTypingIndicator = isLoading && !replyStarted;

  return (
    <section className="flex flex-col h-[34rem] max-h-[78dvh] md:h-[min(40rem,calc(100dvh-9rem))] md:max-h-none bg-white rounded-xl border-2 border-ink shadow-hard overflow-hidden">
      <div className="flex items-center gap-3 px-4 py-3 border-b-2 border-ink bg-paper">
        <img
          src="/Headshot_small.jpg"
          alt=""
          className="w-10 h-10 rounded-full object-cover object-top border-2 border-ink"
        />
        <div className="min-w-0">
          <h2 className="font-display font-bold text-lg leading-tight">Ask Me Anything</h2>
          <p className="text-sm text-ink/70 leading-snug">
            An AI version of me. Mostly accurate, occasionally sarcastic.
          </p>
        </div>
      </div>

      <div ref={scrollRef} className="no-scrollbar flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 ? (
          <div className="grid grid-cols-1 gap-2">
            <p className="label text-ink/60 mb-1">Try asking</p>
            {suggestedQuestions.map((question, index) => (
              <button
                key={index}
                onClick={() => handleQuestionClick(question)}
                className={`
                  text-left px-4 py-3 rounded-lg border-2 border-ink/15 hover:border-ink hover:bg-paper
                  transition-all duration-300 ease-in-out
                  ${clickedQuestion === question ? 'bg-ink text-paper translate-x-[30%]' : ''}
                  ${clickedQuestion && clickedQuestion !== question ? 'opacity-0' : 'opacity-100'}
                `}
                disabled={clickedQuestion !== null}
              >
                {question}
              </button>
            ))}
          </div>
        ) : (
          messages.map(m => <MessageComponent key={m.id} message={m} />)
        )}
        {showTypingIndicator && (
          <div className="flex justify-start">
            <div className="bg-paper border-2 border-ink rounded-xl px-4 py-2 max-w-[85%]">
              <span className="text-ink/70 italic">Thinking of something clever...</span>
            </div>
          </div>
        )}
      </div>

      <form ref={formRef} onSubmit={handleSubmit} className="p-3 border-t-2 border-ink bg-paper flex gap-2">
        <input
          value={input}
          onChange={handleInputChange}
          className="flex-1 min-w-0 rounded-lg border-2 border-ink bg-white px-4 py-3 placeholder:text-ink/40 focus:outline-none focus:ring-2 focus:ring-gold disabled:bg-ink/5"
          placeholder={isLoading ? "Hang on..." : "Ask me something..."}
          aria-label="Your message"
          style={{ color: clickedQuestion ? 'transparent' : 'inherit' }}
          disabled={isLoading}
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="shrink-0 rounded-lg border-2 border-ink bg-gold px-4 font-display font-bold shadow-hard-sm transition-all hover:brightness-105 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none disabled:opacity-40 disabled:shadow-none"
        >
          Send
        </button>
      </form>
    </section>
  );
}
