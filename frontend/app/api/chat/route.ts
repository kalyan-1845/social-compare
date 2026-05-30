import { NextResponse } from 'next/server';
import OpenAI from 'openai';

export const runtime = 'edge';

// Transcript fallbacks matching the backend uploader pipeline
const video_a_segments = [
  { text: "Hey everyone! Welcome back to my channel. Today, we are deep diving into some incredible creator strategies.", start: 0, timestamp: "00:00" },
  { text: "In this video, I'm sharing my blueprint for viral success, comparing my top performance frameworks,", start: 10, timestamp: "00:10" },
  { text: "and dissecting how to double your retention within the first five seconds of any video.", start: 20, timestamp: "00:20" },
  { text: "If you're looking to scale your views, boost click-through rates, and convert views into loyal subscribers,", start: 30, timestamp: "00:30" },
  { text: "make sure to hit that like button and subscribe! We are analyzing exact retention drop-offs,", start: 40, timestamp: "00:40" },
  { text: "visual loops, and storytelling tactics that distinguish high-performing content. Let's get started!", start: 50, timestamp: "00:50" }
];

const video_b_segments = [
  { text: "Stop scrolling right now! If you're a creator and your reels are getting less than 10k views,", start: 0, timestamp: "00:00" },
  { text: "it is because your first three seconds are absolutely terrible. Here is the secret framework:", start: 8, timestamp: "00:08" },
  { text: "You need an visual pattern disrupt combined with a high-stakes verbal hook. Do not start your video with", start: 16, timestamp: "00:16" },
  { text: "hey guys, my name is. No one cares. Start directly with the problem. This reel alone took me 10 minutes to film,", start: 24, timestamp: "00:24" },
  { text: "but because I structured it with a fast-paced looping hook and an open loop at the end, it is already pushing", start: 32, timestamp: "00:32" },
  { text: "to 250k views. Save this reel for later and check the description for the exact hooks I use to scale accounts.", start: 40, timestamp: "00:40" }
];

// Helper to calculate dot product for normalized embedding vectors (cosine similarity)
function dotProduct(a: number[], b: number[]): number {
  if (!a || !b) return 0;
  return a.reduce((sum, val, idx) => sum + val * (b[idx] || 0), 0);
}

export async function POST(request: Request) {
  try {
    const { question, chat_history = [] } = await request.json();

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { detail: 'OPENAI_API_KEY environment variable is not configured. Please supply an OpenAI API Key in your Vercel deployment variables.' },
        { status: 400 }
      );
    }

    // Default metadata definitions representing uploader fallback stats
    const video_a_meta = {
      creator: "Rick Astley",
      title: "Rick Astley - Never Gonna Give You Up (Official Video) (4K Remaster)",
      views: 1777637847, likes: 19127310, comments: 2400000, engagement_rate: 1.21,
      duration: 213, upload_date: "2009-10-25", hashtags: ["rickastley", "nevergonnagiveyouup"],
      follower_count: 4500000
    };

    const video_b_meta = {
      creator: "viral_grow_expert",
      title: "Viral Reel Hooks & Retention Hacks",
      views: 250000, likes: 18200, comments: 940, engagement_rate: 7.66,
      duration: 58, upload_date: "2026-05-27", hashtags: ["shorts", "reelgrowth"],
      follower_count: 125000
    };

    // 1. Prepare segments for embedding comparison
    const segments = [
      ...video_a_segments.map(seg => ({
        text: seg.text,
        video_id: "A",
        source_platform: "YouTube",
        creator: video_a_meta.creator,
        timestamp: seg.timestamp
      })),
      ...video_b_segments.map(seg => ({
        text: seg.text,
        video_id: "B",
        source_platform: "Instagram",
        creator: video_b_meta.creator,
        timestamp: seg.timestamp
      }))
    ];

    const openai = new OpenAI({ apiKey });

    // 2. Generate embeddings in a single optimized request
    const segmentTexts = segments.map(s => s.text);
    const embeddingsResponse = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: [question, ...segmentTexts]
    });

    const queryEmbedding = embeddingsResponse.data[0].embedding;
    const segmentEmbeddings = embeddingsResponse.data.slice(1).map(d => d.embedding);

    // 3. Compute similarities and score segments
    const scoredSegments = segments.map((seg, idx) => {
      const similarity = dotProduct(queryEmbedding, segmentEmbeddings[idx]);
      return { ...seg, similarity };
    });

    // Sort by descending similarity and retrieve the top 5
    scoredSegments.sort((a, b) => b.similarity - a.similarity);
    const retrievedDocs = scoredSegments.slice(0, 5);

    // Structure citations to pass to frontend
    const citations: any[] = [];
    const uniqueCitations = new Set<string>();
    
    for (const doc of retrievedDocs) {
      const citKey = `${doc.video_id}_${doc.timestamp}`;
      if (!uniqueCitations.has(citKey)) {
        uniqueCitations.add(citKey);
        citations.push({
          video_id: doc.video_id,
          source_platform: doc.source_platform,
          creator: doc.creator,
          timestamp: doc.timestamp,
          content: doc.text.length > 150 ? doc.text.slice(0, 150) + "..." : doc.text
        });
      }
    }

    // Build context strings for prompt
    let contextStr = "";
    retrievedDocs.forEach((doc, idx) => {
      contextStr += `[${idx + 1}] Video ${doc.video_id} (${doc.source_platform}) by ${doc.creator} at ${doc.timestamp}:\n${doc.text}\n\n`;
    });

    const metricsCtx = `Comparison Data:
- Video A (YouTube) by ${video_a_meta.creator}:
  Title: ${video_a_meta.title}
  Views: ${video_a_meta.views.toLocaleString()}, Likes: ${video_a_meta.likes.toLocaleString()}, Comments: ${video_a_meta.comments.toLocaleString()}
  Subscriber Count: ${video_a_meta.follower_count.toLocaleString()}
  Engagement Rate: ${video_a_meta.engagement_rate}%
  Upload Date: ${video_a_meta.upload_date}, Duration: ${video_a_meta.duration}s, Tags: ${video_a_meta.hashtags}

- Video B (Instagram) by ${video_b_meta.creator}:
  Title: ${video_b_meta.title}
  Views: ${video_b_meta.views.toLocaleString()}, Likes: ${video_b_meta.likes.toLocaleString()}, Comments: ${video_b_meta.comments.toLocaleString()}
  Follower Count: ${video_b_meta.follower_count.toLocaleString()}
  Engagement Rate: ${video_b_meta.engagement_rate}%
  Duration: ${video_b_meta.duration}s, Tags: ${video_b_meta.hashtags}`;

    const systemPrompt = `You are a premium AI Creator Strategist. Your goal is to analyze, compare, and break down performance strategies of two videos:
Video A is a YouTube Video.
Video B is an Instagram Reel.

Use the provided Metrics Data and retrieved Transcript Context to deliver incredibly precise, analytical, and actionable answers.
Whenever referring to the transcripts, try to cite the timestamps (e.g. at 00:15 in Video A...).
Address conversational queries using memory from previous chat turns. Keep a professional, encouraging, and sharp strategic tone.
Make direct, objective comparisons of their hooks, engagement metrics, formatting, and structural retention value.`;

    const userContent = `${metricsCtx}

Retrieved Transcript Segments:
${contextStr}

User Question: ${question}`;

    // 4. Prepare streaming messages array
    const messages: any[] = [
      { role: "system", content: systemPrompt }
    ];

    for (const msg of chat_history) {
      messages.push({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.content
      });
    }

    messages.push({
      role: "user",
      content: userContent
    });

    // 5. Initiate OpenAI completion stream
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages,
      stream: true,
      temperature: 0.3
    });

    // 6. Stream Server-Sent Events (SSE)
    const encoder = new TextEncoder();
    const customStream = new ReadableStream({
      async start(controller) {
        try {
          // Send citation payload first
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'citations', data: citations })}\n\n`));

          // Stream individual token updates
          for await (const chunk of response) {
            const token = chunk.choices[0]?.delta?.content || "";
            if (token) {
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'token', data: token })}\n\n`));
            }
          }

          // Complete stream
          controller.enqueue(encoder.encode(`data: [DONE]\n\n`));
          controller.close();
        } catch (streamErr: any) {
          console.error('Error during SSE token streaming:', streamErr);
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'error', data: streamErr.message })}\n\n`));
          controller.close();
        }
      }
    });

    return new Response(customStream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      }
    });

  } catch (error: any) {
    console.error('Error inside /api/chat route:', error);
    return NextResponse.json(
      { detail: error.message || 'Server error during chat stream' },
      { status: 500 }
    );
  }
}
