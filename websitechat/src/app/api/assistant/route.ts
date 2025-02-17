import OpenAI from 'openai';
import { OpenAIStream, StreamingTextResponse } from 'ai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Store these IDs in environment variables in production
let ASSISTANT_ID: string | null = null;
let THREAD_ID: string | null = null;

export async function POST(req: Request) {
  const { message, mode } = await req.json();

  // If quick mode, use regular chat completion
  if (mode === 'quick') {
    const completion = await openai.chat.completions.create({
      messages: [{ role: "user", content: message }],
      model: "gpt-4-turbo-preview",
    });

    return Response.json({ 
      message: completion.choices[0].message.content 
    });
  }

  // Otherwise use Assistants API for detailed responses
  try {
    // Create assistant if it doesn't exist
    if (!ASSISTANT_ID) {
      const assistant = await openai.beta.assistants.create({
        name: "Russell Info Assistant",
        instructions: "You are an AI that helps answer questions about Russell's background and experience.",
        model: "gpt-4-turbo-preview",
        tools: [{ type: "retrieval" }],
      });
      ASSISTANT_ID = assistant.id;
    }

    // Create thread if it doesn't exist
    if (!THREAD_ID) {
      const thread = await openai.beta.threads.create();
      THREAD_ID = thread.id;
    }

    // Add message to thread
    await openai.beta.threads.messages.create(THREAD_ID, {
      role: "user",
      content: message,
    });

    // Run the assistant
    const run = await openai.beta.threads.runs.create(THREAD_ID, {
      assistant_id: ASSISTANT_ID,
    });

    // Poll for completion
    let runStatus = await openai.beta.threads.runs.retrieve(THREAD_ID, run.id);
    while (runStatus.status !== 'completed') {
      await new Promise(resolve => setTimeout(resolve, 1000));
      runStatus = await openai.beta.threads.runs.retrieve(THREAD_ID, run.id);
      if (runStatus.status === 'failed') {
        throw new Error('Run failed');
      }
    }

    // Get messages
    const messages = await openai.beta.threads.messages.list(THREAD_ID);
    const lastMessage = messages.data[0];

    return Response.json({ message: lastMessage.content[0].text.value });
  } catch (error) {
    console.error('Error:', error);
    return Response.json({ error: 'Failed to get response' }, { status: 500 });
  }
} 