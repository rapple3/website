"use client";

import { useChat } from 'ai/react';
import React from 'react';

export default function Chat() {
  const { messages, input, handleInputChange, handleSubmit } = useChat()

  React.useEffect(() => {
    const messageContainer = document.getElementById('message-container');
    if (messageContainer) {
      messageContainer.scrollTop = messageContainer.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="grid min-h-screen place-items-center bg-gray-50">
      <div className="w-full max-w-2xl h-[600px] bg-white rounded-xl shadow-lg flex flex-col m-4">
        <div className="p-4 border-b">
          <h1 className="text-xl font-semibold">Chat with Russell</h1>
        </div>
        
        <div id="message-container" className="flex-1 overflow-y-auto flex flex-col p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="text-center text-gray-500">
              Hi! I'm an AI assistant who can tell you about Russell's background and experience. What would you like to know?
            </div>
          ) : (
            messages.map(m => (
              <div key={m.id} 
                className={`${m.role === 'user' ? 'text-right' : 'text-left'} transition-all duration-300`}>
                <div className={`inline-block max-w-[85%] rounded-lg px-4 py-2 ${
                  m.role === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-200'
                }`}>
                  {m.content}
                </div>
              </div>
            ))
          )}
        </div>

        <form onSubmit={handleSubmit} className="p-4 border-t" suppressHydrationWarning>
          <input
            value={input}
            onChange={handleInputChange}
            className="w-full rounded-lg border border-gray-300 p-4 focus:outline-none focus:border-blue-500"
            placeholder="Type your message..."
            suppressHydrationWarning
          />
        </form>
      </div>
    </div>
  )
}
