import type { NextApiRequest, NextApiResponse } from 'next'
 
type AudioFormat = "pcm16" | "g711_ulaw" | "g711_alaw"
type Tool = {
  type: string
  name: string
  description: string
  parameters: object
}
type RealtimeSession = {
  id: string; // Strictly matches a string
  object: "realtime.session"; // Literal string type
  model: string; // Generic string for model identifier
  expires_at: number; // Unix timestamp (number)
  modalities: Array<"text" | "audio">; // Array of literal string types
  instructions: string; // Detailed instructions as a string
  voice: "verse"; // Literal string type
  custom_voice_id: string | null; // Nullable string
  turn_detection: {
    type: "server_vad"; // Literal string type
    threshold: number; // Number for threshold value
    prefix_padding_ms: number; // Milliseconds as a number
    silence_duration_ms: number; // Milliseconds as a number
    create_response: boolean; // Boolean flag
  };
  input_audio_format:AudioFormat ; // Literal string type
  output_audio_format: AudioFormat; // Literal string type
  input_audio_transcription: {
      model: string;
      turn_detection: object| null;
      tools: Tool[]
  }
  tool_choice: "auto"; // Literal string type
  temperature: number; // Number for temperature value
  max_response_output_tokens: string | number; // String or number
  client_secret: {
    value: string; // Secret key as a string
    expires_at: number; // Unix timestamp (number)
  };
  tools: Array<never>; // Empty array (strictly no elements)
};

export type ResponseData = RealtimeSession
 
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {

  const r = await fetch("https://api.openai.com/v1/realtime/sessions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-realtime-preview-2024-12-17",
      voice: "verse",
    }),
  });
  const data = await r.json() as RealtimeSession
  res.status(200).json(data)
}