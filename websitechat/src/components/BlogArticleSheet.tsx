"use client";

import React from 'react';
import { Sheet } from '@silk-hq/components';
import Image from 'next/image';
import ReactMarkdown from 'react-markdown';

// Define the structure for blog post data
export interface BlogPost {
  slug: string; // For the URL
  title: string;
  date: string;
  snippet: string;
  fullContent?: string; // Optional full content
}

interface Props {
  post: BlogPost;
}

export default function BlogArticleSheet({ post }: Props) {
  return (
    <Sheet.Root license="commercial"> {/* Add license prop if required by the library */}
      <Sheet.Trigger asChild>
        {/* This is the preview card that triggers the sheet */}
        <article className="bg-white p-6 rounded-xl border-2 border-ink shadow-hard cursor-pointer transition-transform hover:-translate-y-1">
          <p className="label text-ink/60 mb-2">{post.date}</p>
          <h2 className="font-display font-bold text-2xl leading-tight mb-3">{post.title}</h2>
          <p className="text-ink/80">{post.snippet}</p>
          <span className="mt-4 inline-block font-semibold underline decoration-gold decoration-2 underline-offset-4">Read more →</span>
        </article>
      </Sheet.Trigger>
      <Sheet.Portal>
        <Sheet.View
          className="PageFromBottom-view"
          contentPlacement="bottom"
          swipe={false}
          nativeEdgeSwipePrevention={true}
        >
          <Sheet.Backdrop 
            className="PageFromBottom-backdrop"
            travelAnimation={{ opacity: [0, 0.1] }}
          />
          <Sheet.Content className="PageFromBottom-content">
            {/* Added Color Bar */}
            <div className="h-2 w-full bg-gold border-b-2 border-ink"></div>
            
            {/* Existing Top Bar */}
            <div className="PageFromBottom-topBar">
              <Sheet.Trigger 
                className="PageFromBottom-dismissTrigger" 
                action="dismiss"
              >
                Close
              </Sheet.Trigger>
            </div>
            <div className="overflow-y-auto"><div className="prose prose-headings:font-display max-w-2xl mx-auto p-4 sm:p-6">
              {/* Title and Date */}
              <ReactMarkdown components={{
                // Custom renderer for links
                a: ({node, ...props}) => { 
                  // Check if it's an external link
                  if (props.href?.startsWith('http')) {
                    return <a {...props} target="_blank" rel="noopener noreferrer" />;
                  }
                  // Otherwise, render as a normal link (or potentially use Next Link later)
                  return <a {...props} />;
                }
              }}>{`# ${post.title}`}</ReactMarkdown>
              <p className="text-gray-500 !-mt-4 !mb-4">{post.date}</p>

              {/* Conditionally add Image for the specific blog post */}
              {post.slug === 'ai-airline-chatbot-mba' && (
                <div className="my-6 overflow-hidden rounded-lg shadow-md">
                  <Image 
                    src="/Airline Chatbot.png" // Corrected casing
                    alt="Screenshot of AI Airline Chatbot" 
                    width={800} // Provide appropriate width
                    height={450} // Provide appropriate height (adjust aspect ratio as needed)
                    className="w-full h-auto object-cover"
                  />
                </div>
              )}
              
              {/* Conditionally render full content using ReactMarkdown or snippet */}
              {post.fullContent ? (
                <ReactMarkdown components={{
                  a: ({node, ...props}) => { 
                    if (props.href?.startsWith('http')) {
                      return <a {...props} target="_blank" rel="noopener noreferrer" />;
                    }
                    return <a {...props} />;
                  }
                }}>{post.fullContent}</ReactMarkdown>
              ) : (
                <p>{post.snippet}</p>
              )}
            </div></div>
          </Sheet.Content>
        </Sheet.View>
      </Sheet.Portal>
    </Sheet.Root>
  );
} 