import {ComponentRef } from "react";

type MediaElement = ComponentRef<"audio">

import { RealtimeEvent } from "./realtimeEvents";
export async function initAudio(audioEl: MediaElement, EPHEMERAL_KEY:string, onEvent: (event: RealtimeEvent) => void) {
    console.log("initAudio")

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false })
    audioEl.srcObject = stream  
    audioEl.autoplay = true;
    
    const pc = new RTCPeerConnection();
    pc.ontrack = e => audioEl.srcObject = e.streams[0];
    // Add local audio track for microphone input in the browser
    const ms = await navigator.mediaDevices.getUserMedia({
        audio: true
    });
    pc.addTrack(ms.getTracks()[0]);

    // Set up data channel for sending and receiving events
    const dc = pc.createDataChannel("oai-events");
    dc.addEventListener("message", (e) => {
        const event = JSON.parse(e.data) as RealtimeEvent;
        onEvent(event);
       
    });

    // Start the session using the Session Description Protocol (SDP)
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);

    const baseUrl = "https://api.openai.com/v1/realtime";
    const model = "gpt-4o-realtime-preview-2024-12-17";
    const sdpResponse = await fetch(`${baseUrl}?model=${model}`, {
        method: "POST",
        body: offer.sdp,
        headers: {
        Authorization: `Bearer ${EPHEMERAL_KEY}`,
        "Content-Type": "application/sdp"
        },
    });

    const sdp = await sdpResponse.text()
    await pc.setRemoteDescription({type: "answer", sdp});
    console.log("Session started!");
     const stop = () => {
        if (dc.readyState === "open") { dc.close(); }
        pc.close();
        ms.getTracks().forEach(track => track.stop());
        stream.getTracks().forEach(track => track.stop());
        audioEl.pause();
        audioEl.autoplay = false;
        audioEl.srcObject = null;   
    }
    return {stop}

}