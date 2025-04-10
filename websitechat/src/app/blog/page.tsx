import BlogArticleSheet, { BlogPost } from '@/components/BlogArticleSheet';

// Sample blog post data
const blogPosts: BlogPost[] = [
  {
    slug: 'ai-airline-chatbot-mba',
    title: 'From Buzz to Bots: Building an AI-Powered Airline Chatbot for my Georgia Tech MBA',
    date: 'April 10, 2025',
    snippet: 'As part of my MBA journey here at Georgia Tech, I recently tackled a fascinating class project that blended business insights with hands-on tech development...',
    fullContent: `## Hey everyone,\n\nAs part of my MBA journey here at Georgia Tech, I recently tackled a fascinating class project that blended business insights with hands-on tech development. The challenge? To explore how Artificial Intelligence could enhance customer service in the airline industry. My answer: building a simulated Delta Airlines customer service chatbot. [Check it out here!](https://bolt-airline.vercel.app/)\n\n## What Does It Do?\n\nImagine a smarter way to manage your travel plans. This web application provides a chat interface where users can interact with an AI assistant, just like they might with a real customer service agent. Need to find flights between cities? Done. Want to book a new trip, view existing bookings, or even cancel one? The chatbot handles it. It can also manage flight changes, seat selections, and upgrades.\n\n### Key AI features baked in include:\n\n*   **Natural Language Understanding:** Thanks to OpenAI's API, you can type requests naturally, like "I need to fly from Atlanta to New York tomorrow."
*   **Context Awareness:** The bot remembers the conversation history for smoother, more relevant interactions.
*   **Intent Recognition:** It figures out whether you're trying to book, cancel, or just get information.
*   **Smart Handoff:** Crucially, it simulates detecting when an issue gets too complex for AI and needs escalating to a human agent – a vital feature for real-world applications.\n\nFor demonstration purposes, the app also allows simulating different user profiles and resetting the data.\n\n## How Was It Built?\n\nThe front end – what you see and interact with – was built using React and TypeScript, embracing modern development patterns like hooks and functional components. We used Tailwind CSS to ensure the design is responsive and looks good on different screen sizes.\n\nThe core AI logic leverages the OpenAI API for processing the natural language queries. The application architecture is component-based, making it modular and maintainable.\n\n## Why Does This Matter?\n\nThis project wasn't just an academic exercise; it was a dive into the practical application of AI in a major industry. It demonstrates how AI can handle routine travel inquiries efficiently, freeing up human agents for more complex issues. By intelligently managing interactions and knowing when to escalate, AI can significantly enhance operational efficiency and customer satisfaction in the airline world.\n\nBuilding this chatbot was a fantastic learning experience within the Georgia Tech MBA program, perfectly illustrating the intersection of business strategy, customer experience, and cutting-edge technology.`
  },
  {
    slug: 'future-of-cad',
    title: 'The Future of Automated CAD in Product Development',
    date: 'March 5, 2024',
    snippet: 'As we advance in the era of AI and automation, the role of CAD systems in product development is evolving rapidly...'
  },
  {
    slug: 'lean-digital-age',
    title: 'Lean Manufacturing in the Digital Age',
    date: 'February 20, 2024',
    snippet: 'Reflecting on my time at Herman Miller, I discuss how traditional lean manufacturing principles are being enhanced by digital technologies...'
  },
  {
    slug: 'mba-tech-strategy',
    title: 'MBA Insights: Technology Strategy in Manufacturing',
    date: 'February 1, 2024',
    snippet: 'Currently pursuing my MBA at Georgia Tech, I share insights on how business strategy and technological innovation intersect...'
  }
];

export default function Blog() {
  return (
    <div className="min-h-screen pt-24 pb-8 px-4 md:px-8 flex flex-col items-center bg-gray-50">
      <h1 className="text-3xl font-bold mb-8">Blog</h1>

      {/* Image Banner Removed */}

      <div className="space-y-8 max-w-2xl w-full">
        {blogPosts.map((post) => (
          <BlogArticleSheet key={post.slug} post={post} />
        ))}
      </div>
    </div>
  );
}
