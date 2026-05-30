export interface VideoMetadata {
  title: string;
  creator: string;
  views: number;
  likes: number;
  comments: number;
  upload_date: string;
  duration: number;
  hashtags: string[];
  engagement_rate: number;
  source_platform: string;
  follower_count?: number;
}

export interface Citation {
  video_id: string;
  source_platform: string;
  creator: string;
  timestamp: string;
  content: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  citations?: Citation[];
}

// Point directly to internal Next.js serverless API routes on Vercel
const API_BASE_URL = '';

export async function analyzeCreatorVideos(youtubeUrl: string, instagramUrl: string): Promise<{
  success: boolean;
  video_a: VideoMetadata;
  video_b: VideoMetadata;
}> {
  const response = await fetch(`${API_BASE_URL}/api/analyze`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      youtube_url: youtubeUrl,
      instagram_url: instagramUrl,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Extraction failed. Make sure URLs are valid and the backend is running.');
  }

  return response.json();
}

export async function streamRAGResponse(
  question: string,
  chatHistory: ChatMessage[],
  onCitations: (citations: Citation[]) => void,
  onToken: (token: string) => void,
  onComplete: () => void,
  onError: (error: string) => void
): Promise<void> {
  try {
    // Map roles correctly for backend compatibility
    const formattedHistory = chatHistory.map(msg => ({
      role: msg.role,
      content: msg.content
    }));

    const response = await fetch(`${API_BASE_URL}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        question,
        chat_history: formattedHistory,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      onError(errorText || 'Server failed to start response stream.');
      return;
    }

    if (!response.body) {
      onError('Streaming not supported by this browser.');
      return;
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      
      // Retain trailing slice for next block
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;

        if (trimmed === 'data: [DONE]') {
          onComplete();
          return;
        }

        if (trimmed.startsWith('data: ')) {
          const rawPayload = trimmed.slice(6);
          try {
            const parsed = JSON.parse(rawPayload);
            if (parsed.type === 'citations') {
              onCitations(parsed.data);
            } else if (parsed.type === 'token') {
              onToken(parsed.data);
            } else if (parsed.type === 'error') {
              onError(parsed.parsed || parsed.data);
            }
          } catch (jsonErr) {
            console.error('Failed to parse SSE payload:', rawPayload, jsonErr);
          }
        }
      }
    }
    
    onComplete();
  } catch (err: any) {
    onError(err.message || 'Connection lost during streaming.');
  }
}
