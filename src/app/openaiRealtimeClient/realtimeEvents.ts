import { Update } from "next/dist/build/swc/types";

/**
 * Represents the format of audio data.
 * Can be one of the following values: "pcm16", "g711_ulaw", "g711_alaw".
 */
export type AudioFormat = "pcm16" | "g711_ulaw" | "g711_alaw";

/**
 * Represents a tool with specific properties.
 * 
 * @property type - The type of the tool.
 * @property name - The name of the tool.
 * @property description - A brief description of the tool.
 * @property parameters - An object containing parameters for the tool.
 */
export type Tool = {
    type: string;
    name: string;
    description: string;
    parameters: object;
};

/**
 * Represents a session identifier.
 * The session ID is a string prefixed with "sess_".
 */
type SessionId = string;

/**
 * Event id
 */
type EventId = string;

/**
 * Specifies how the model chooses tools.
 * Options are auto, none, required, or specify a function.
 */
type ToolChoice = string | object;

type Modalities = "audio" | "text";

type StatusDetails = {
    "type": string;
    "reason"?: string
    error? :object
} | null;
/**
 * Configuration for input audio transcription, defaults to off and can be set to null to turn off once on. Input audio transcription is not native to the model, since the model consumes audio directly. Transcription runs asynchronously through OpenAI Whisper transcription and should be treated as rough guidance rather than the representation understood by the model. The client can optionally set the language and prompt for transcription, these fields will be passed to the Whisper API
 */
type InputAudioTranscription = {
    model?: string;
    language?:string;
    prompt?:string
} | null

type MaxResponseOutputTokens = "inf" | number;

/**
 * Represents the event when a session is created.
 * 
 * @property type - The type of the event, which is "session.created".
 * @property event_id - The unique identifier for the event.
 * @property session - An object containing details about the session.
 * @property session.id - The unique identifier for the session.
 * @property session.object - The object type of the session.
 * @property session.model - The model used in the session.
 * @property session.expires_at - The expiration time of the session in epoch milliseconds.
 * @property session.modalities - An array of modalities used in the session.
 * @property session.instructions - Instructions for the session.
 * @property session.voice - The voice used in the session.
 * @property session.custom_voice_id - The custom voice ID, if any.
 * @property session.turn_detection - An object containing turn detection settings.
 * @property session.turn_detection.type - The type of turn detection.
 * @property session.turn_detection.threshold - The threshold for turn detection.
 * @property session.turn_detection.prefix_padding_ms - The prefix padding in milliseconds.
 * @property session.turn_detection.silence_duration_ms - The silence duration in milliseconds.
 * @property session.turn_detection.create_response - Whether to create a response.
 * @property session.input_audio_format - The format of the input audio.
 * @property session.output_audio_format - The format of the output audio.
 * @property session.input_audio_transcription - The transcription of the input audio, if any.
 * @property session.tool_choice - The tool choice for the session.
 * @property session.temperature - The temperature setting for the session.
 * @property session.max_response_output_tokens - The maximum number of tokens for the response output.
 * @property session.client_secret - The client secret, if any.
 * @property session.tools - An array of tools used in the session.
 */
export type SessionCreated = {
    type: "session.created";
    event_id: EventId;
    session: {
        id: SessionId;
        object: string;
        model: string;
        expires_at: number;
        modalities: Modalities[];
        instructions: string;
        voice: string;
        custom_voice_id: string | null;
        turn_detection: {
            type: string;
            threshold: number;
            prefix_padding_ms: number;
            silence_duration_ms: number;
            create_response: boolean;
        };
        input_audio_format: AudioFormat;
        output_audio_format: AudioFormat;
        input_audio_transcription: InputAudioTranscription;
        tool_choice: ToolChoice;
        temperature: number;
        max_response_output_tokens: MaxResponseOutputTokens;
        client_secret: string | null;
        tools: Tool[];
    };
};

/**
 * Represents the event when a session is updated.
 * 
 * @property type - The type of the event, which is "session.updated".
 * @property event_id - The unique identifier for the event.
 * @property session - An object containing details about the session.
 * @property session.id - The unique identifier for the session.
 * @property session.object - The object type of the session.
 * @property session.model - The model used in the session.
 * @property session.expires_at - The expiration time of the session in epoch milliseconds.
 * @property session.modalities - An array of modalities used in the session.
 * @property session.instructions - Instructions for the session.
 * @property session.voice - The voice used in the session.
 * @property session.custom_voice_id - The custom voice ID, if any.
 * @property session.turn_detection - An object containing turn detection settings.
 * @property session.turn_detection.type - The type of turn detection.
 * @property session.turn_detection.threshold - The threshold for turn detection.
 * @property session.turn_detection.prefix_padding_ms - The prefix padding in milliseconds.
 * @property session.turn_detection.silence_duration_ms - The silence duration in milliseconds.
 * @property session.turn_detection.create_response - Whether to create a response.
 * @property session.input_audio_format - The format of the input audio.
 * @property session.output_audio_format - The format of the output audio.
 * @property session.input_audio_transcription - The transcription of the input audio, if any.
 * @property session.tool_choice - The tool choice for the session.
 * @property session.temperature - The temperature setting for the session.
 * @property session.max_response_output_tokens - The maximum number of tokens for the response output.
 * @property session.client_secret - The client secret, if any.
 * @property session.tools - An array of tools used in the session.
 */
export type SessionUpdated = {
    type: "session.updated";
    event_id: EventId;
    session: {
        id: SessionId;
        object: string;
        model: string;
        expires_at: number;
        modalities: Modalities[];
        instructions: string;
        voice: string;
        custom_voice_id: string | null;
        turn_detection: {
            type: string;
            threshold: number;
            prefix_padding_ms: number;
            silence_duration_ms: number;
            create_response: boolean;
        };
        input_audio_format: AudioFormat;
        output_audio_format: AudioFormat;
        input_audio_transcription: InputAudioTranscription;
        tool_choice: ToolChoice;
        temperature: number;
        max_response_output_tokens: MaxResponseOutputTokens;
        client_secret: string | null;
        tools: Tool[];
    };
};

/**
 * Represents an event indicating that speech has started in the input audio buffer.
 * 
 * @property type - The type of the event, which is always "input_audio_buffer.speech_started".
 * @property event_id - The unique ID of the server event.
 * @property audio_start_ms - Milliseconds from the start of all audio written to the buffer during the session when speech was first detected. This will correspond to the beginning of audio sent to the model, and thus includes the prefix_padding_ms configured in the Session.
 * @property item_id - The ID of the user message item that will be created when speech stops.
 */
export type InputAudioBufferSpeechStarted = {
    type: "input_audio_buffer.speech_started";
    event_id: EventId;
    audio_start_ms: number;
    item_id: string;
};


/**
 * Represents the event when speech has stopped in the input audio buffer.
 * 
 * @property type - The type of the event, which is always "input_audio_buffer.speech_stopped".
 * @property event_id - The unique ID of the server event.
 * @property audio_end_ms - Milliseconds from the start of all audio written to the buffer during the session when speech was last detected.
 * @property item_id - The ID of the user message item that was created when speech started.
 */
export type InputAudioBufferSpeechStopped = {
    type: "input_audio_buffer.speech_stopped";
    event_id: EventId;
    audio_end_ms: number;
    item_id: string;
};

/**
 * Represents the event when the input audio buffer is committed.
 * 
 * @property type - The type of the event, which is always "input_audio_buffer.committed".
 * @property event_id - The unique ID of the server event.
 * @property previous_item_id - The ID of the previous user message item, if any.
 * @property item_id - The ID of the user message item that was created.
 */
export type InputAudioBufferCommitted = {
    type: "input_audio_buffer.committed";
    event_id: EventId;
    previous_item_id: string | null;
    item_id: string;
};

/**
 * Represents the event when a conversation item is created.
 * 
 * @property type - The type of the event, which is always "conversation.item.created".
 * @property event_id - The unique ID of the server event.
 * @property previous_item_id - The ID of the previous user message item, if any.
 * @property item - An object containing details about the created item.
 * @property item.id - The unique identifier for the item.
 * @property item.object - The object type of the item.
 * @property item.type - The type of the item.
 * @property item.status - The status of the item.
 * @property item.role - The role of the item.
 * @property item.content - An array of content objects.
 */
export type ConversationItemCreated = {
    type: "conversation.item.created";
    event_id: EventId;
    previous_item_id: string | null;
    item: {
        id: string;
        object: string;
        type: string;
        status: string;
        role: string;
        content: {
            type: string;
            transcript: string | null;
        }[];
    };
};

type ContentItem =object
type OutputItem = {
    id: string;
    type: string;
    object: string;
    status: "completed"| "incomplete";
    role: "user" | "assistant" | "system";
    content: ContentItem[];
}
type Usage = {
    total_tokens: number;
    input_tokens: number;
    output_tokens: number;
    input_token_details:{
        cached_tokens: number;
        text_tokens: number;
        audio_tokens: number;
        cached_tokens_details?: {
            text_tokens:number;
            audio_tokens:number;
        }
    }
    output_token_details:{
        text_tokens:number;
        audio_tokens:number;
    }
} | null
type Metadata = Record<string, unknown> | null
/**
 * Represents the event when a response is created.
 * 
 * @property type - The type of the event, which is always "response.created".
 * @property event_id - The unique ID of the server event.
 * @property response - An object containing details about the created response.
 * @property response.object - The object type of the response.
 * @property response.id - The unique identifier for the response.
 * @property response.status - The status of the response.
 * @property response.status_details - Additional details about the status, if any.
 * @property response.output - An array of output objects.
 * @property response.conversation_id - The ID of the conversation.
 * @property response.modalities - An array of modalities used in the response.
 * @property response.voice - The voice used in the response.
 * @property response.custom_voice_id - The custom voice ID, if any.
 * @property response.output_audio_format - The format of the output audio.
 * @property response.temperature - The temperature setting for the response.
 * @property response.max_output_tokens - The maximum number of tokens for the response output.
 * @property response.usage - The usage details, if any.
 * @property response.metadata - The metadata, if any.
 */
export type ResponseCreated = {
    type: "response.created";
    event_id: EventId;
    response: {
        object: string;
        id: string;
        status: string;
        status_details: StatusDetails;
        output: OutputItem[];
        conversation_id: string;
        modalities: Modalities[];
        voice: string;
        custom_voice_id: string | null;
        output_audio_format: AudioFormat;
        temperature: number;
        max_output_tokens: MaxResponseOutputTokens;
        usage: Usage;
        metadata: Metadata;
    };
};

/**
 * Represents the event when rate limits are updated.
 * 
 * @property type - The type of the event, which is always "rate_limits.updated".
 * @property event_id - The unique ID of the server event.
 * @property rate_limits - An array of rate limit objects.
 * @property rate_limits.name - The name of the rate limit.
 * @property rate_limits.limit - The limit value.
 * @property rate_limits.remaining - The remaining value.
 * @property rate_limits.reset_seconds - The reset time in seconds.
 */
export type RateLimitsUpdated = {
    type: "rate_limits.updated";
    event_id: EventId;
    rate_limits: {
        name: string;
        limit: number;
        remaining: number;
        reset_seconds: number;
    }[];
};

/**
 * Represents the event when a response output item is added.
 * 
 * @property type - The type of the event, which is always "response.output_item.added".
 * @property event_id - The unique ID of the server event.
 * @property response_id - The ID of the response.
 * @property output_index - The index of the output.
 * @property item - An object containing details about the added item.
 * @property item.id - The unique identifier for the item.
 * @property item.object - The object type of the item.
 * @property item.type - The type of the item.
 * @property item.status - The status of the item.
 * @property item.role - The role of the item.
 * @property item.content - An array of content objects.
 */
export type ResponseOutputItemAdded = {
    type: "response.output_item.added";
    event_id: EventId;
    response_id: string;
    output_index: number;
    item: {
        id: string;
        object: string;
        type: string;
        status: string;
        role: string;
        content: ContentItem[];
    };
};

/**
 * Represents the event when a response content part is added.
 * 
 * @property type - The type of the event, which is always "response.content_part.added".
 * @property event_id - The unique ID of the server event.
 * @property response_id - The ID of the response.
 * @property item_id - The ID of the item.
 * @property output_index - The index of the output.
 * @property content_index - The index of the content.
 * @property part - An object containing details about the added part.
 * @property part.type - The type of the part.
 * @property part.transcript - The transcript of the part, if any.
 */
export type ResponseContentPartAdded = {
    type: "response.content_part.added";
    event_id: EventId;
    response_id: string;
    item_id: string;
    output_index: number;
    content_index: number;
    part: {
        type: string;
        transcript: string | null;
    };
};

/**
 * Represents the event when a response audio transcript delta is received.
 * 
 * @property type - The type of the event, which is always "response.audio_transcript.delta".
 * @property event_id - The unique ID of the server event.
 * @property response_id - The ID of the response.
 * @property item_id - The ID of the item.
 * @property output_index - The index of the output.
 * @property content_index - The index of the content.
 * @property delta - The delta of the transcript.
 */
export type ResponseAudioTranscriptDelta = {
    type: "response.audio_transcript.delta";
    event_id: EventId;
    response_id: string;
    item_id: string;
    output_index: number;
    content_index: number;
    delta: string;
};


/**
 * Represents the event when the response audio is done.
 * 
 * @property type - The type of the event, which is always "response.audio.done".
 * @property event_id - The unique ID of the server event.
 * @property response_id - The ID of the response.
 * @property item_id - The ID of the item.
 * @property output_index - The index of the output.
 * @property content_index - The index of the content.
 */
export type ResponseAudioDone = {
    type: "response.audio.done";
    event_id: EventId;
    response_id: string;
    item_id: string;
    output_index: number;
    content_index: number;
};

/**
 * Represents the event when the response audio transcript is done.
 * 
 * @property type - The type of the event, which is always "response.audio_transcript.done".
 * @property event_id - The unique ID of the server event.
 * @property response_id - The ID of the response.
 * @property item_id - The ID of the item.
 * @property output_index - The index of the output.
 * @property content_index - The index of the content.
 * @property transcript - The transcript of the response.
 */
export type ResponseAudioTranscriptDone = {
    type: "response.audio_transcript.done";
    event_id: EventId;
    response_id: string;
    item_id: string;
    output_index: number;
    content_index: number;
    transcript: string;
};

/**
 * Represents the event when a response content part is done.
 * 
 * @property type - The type of the event, which is always "response.content_part.done".
 * @property event_id - The unique ID of the server event.
 * @property response_id - The ID of the response.
 * @property item_id - The ID of the item.
 * @property output_index - The index of the output.
 * @property content_index - The index of the content.
 * @property part - An object containing details about the part.
 * @property part.type - The type of the part.
 * @property part.transcript - The transcript of the part, if any.
 */
export type ResponseContentPartDone = {
    type: "response.content_part.done";
    event_id: EventId;
    response_id: string;
    item_id: string;
    output_index: number;
    content_index: number;
    part: {
        type: string;
        transcript: string | null;
    };
};

/**
 * Represents the event when a response output item is done.
 * 
 * @property type - The type of the event, which is always "response.output_item.done".
 * @property event_id - The unique ID of the server event.
 * @property response_id - The ID of the response.
 * @property output_index - The index of the output.
 * @property item - An object containing details about the done item.
 * @property item.id - The unique identifier for the item.
 * @property item.object - The object type of the item.
 * @property item.type - The type of the item.
 * @property item.status - The status of the item.
 * @property item.role - The role of the item.
 * @property item.content - An array of content objects.
 */
export type ResponseOutputItemDone = {
    type: "response.output_item.done";
    event_id: EventId;
    response_id: string;
    output_index: number;
    item: {
        id: string;
        object: string;
        type: string;
        status: string;
        role: string;
        content: ContentItem[];
    };
};

/**
 * Represents the event when a response is done.
 * 
 * @property type - The type of the event, which is always "response.done".
 * @property event_id - The unique ID of the server event.
 * @property response - An object containing details about the completed response.
 * @property response.object - The object type of the response.
 * @property response.id - The unique identifier for the response.
 * @property response.status - The status of the response.
 * @property response.status_details - Additional details about the status, if any.
 * @property response.output - An array of output objects.
 * @property response.conversation_id - The ID of the conversation.
 * @property response.modalities - An array of modalities used in the response.
 * @property response.voice - The voice used in the response.
 * @property response.custom_voice_id - The custom voice ID, if any.
 * @property response.output_audio_format - The format of the output audio.
 * @property response.temperature - The temperature setting for the response.
 * @property response.max_output_tokens - The maximum number of tokens for the response output.
 * @property response.usage - The usage details, if any.
 * @property response.metadata - The metadata, if any.
 */
export type ResponseDone = {
    type: "response.done";
    event_id: EventId;
    response: {
        object: string;
        id: string;
        status: string;
        status_details: StatusDetails;
        output: OutputItem[];
        conversation_id: string;
        modalities: Modalities[];
        voice: string;
        custom_voice_id: string | null;
        output_audio_format: AudioFormat;
        temperature: number;
        max_output_tokens: MaxResponseOutputTokens;
        usage: Usage;
        metadata: Metadata;
    };
};

/**
 * Represents the event when the output audio buffer starts.
 * 
 * @property type - The type of the event, which is always "output_audio_buffer.audio_started".
 * @property event_id - The unique ID of the server event.
 * @property response_id - The ID of the response.
 */
export type OutputAudioBufferAudioStarted = {
    type: "output_audio_buffer.audio_started";
    event_id: EventId;
    response_id: string;
};

/**
 * Represents the event when the output audio buffer stops.
 * 
 * @property type - The type of the event, which is always "output_audio_buffer.audio_stopped".
 * @property event_id - The unique ID of the server event.
 * @property response_id - The ID of the response.
 */
export type OutputAudioBufferAudioStopped = {
    type: "output_audio_buffer.audio_stopped";
    event_id: EventId;
    response_id: string;
};

/**
 * Represents the event when the output audio buffer is cleared.
 * 
 * @property type - The type of the event, which is always "output_audio_buffer.audio_cleared".
 * @property event_id - The unique ID of the server event.
 * @property response_id - The ID of the response.
 */
export type OutputAudioBufferAudioCleared = {
    type: "output_audio_buffer.audio_cleared";
    event_id: EventId;
    response_id: string;
};

/**
 * Represents a real-time event, which can be one of several types.
 */
export type RealtimeEvent = 
    | SessionCreated
    | SessionUpdated
    | InputAudioBufferSpeechStarted
    | InputAudioBufferSpeechStopped
    | InputAudioBufferCommitted
    | ConversationItemCreated
    | ResponseCreated
    | RateLimitsUpdated
    | ResponseOutputItemAdded
    | ResponseContentPartAdded
    | ResponseAudioTranscriptDelta
    | ResponseAudioDone
    | ResponseAudioTranscriptDone
    | ResponseContentPartDone
    | ResponseOutputItemDone
    | ResponseDone
    | OutputAudioBufferAudioStarted
    | OutputAudioBufferAudioStopped
    | OutputAudioBufferAudioCleared;
