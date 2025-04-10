"use client";

import React from 'react';
import Link from 'next/link';
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
        <article className="prose max-w-none bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer">
          <h2 className="text-2xl font-semibold mb-2 not-prose">{post.title}</h2>
          <p className="text-gray-500 mb-4 not-prose">{post.date}</p>
          <p>{post.snippet}</p>
          {/* Add a standard link to the full page */}
          <Link 
            href={`/blog/${post.slug}`} 
            className="text-blue-600 hover:text-blue-800 mt-4 inline-block no-underline"
            onClick={(e) => e.stopPropagation()} // Prevent sheet opening when clicking link
          >
             Read more →
          </Link>
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
            <div className="h-2 w-full bg-gradient-to-r from-teal-400 to-blue-500"></div>
            
            {/* Existing Top Bar */}
            <div className="PageFromBottom-topBar">
              <Sheet.Trigger 
                className="PageFromBottom-dismissTrigger" 
                action="dismiss"
              >
                Close
              </Sheet.Trigger>
            </div>
            <div className="prose max-w-none p-4 overflow-y-auto">
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
                    src="/airline chatbot.png" // Assumes PNG in /public folder. Adjust extension if needed.
                    alt="Screenshot of AI Airline Chatbot" 
                    width={800} // Provide appropriate width
                    height={450} // Provide appropriate height (adjust aspect ratio as needed)
                    layout="responsive"
                    objectFit="cover"
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

              {/* Placeholder Link (Will also be handled by the custom renderer) */}
              {post.fullContent && (
                <></> // Render nothing here, link is in the Markdown above
              )}
            </div>
          </Sheet.Content>
        </Sheet.View>
      </Sheet.Portal>
    </Sheet.Root>
  );
} 