"use client"
import { useRef,ComponentRef,useState } from "react";
import {ResponseData} from "../../pages/api/sessions"
type MediaElement = ComponentRef<"audio">


export function WebRtc(){
    const ref = useRef<MediaElement>(null)
    const defaultHistory:object[] = []
    const [history, setHistory] = useState(defaultHistory)
    const [audioStarting, setAudioStarting] = useState(false)
    const [stopFn, setStopFn] = useState<null | {stop: () => void}>(null)

    async function initAudio(audioEl: MediaElement, EPHEMERAL_KEY:string){
        console.log("initAudio")

        const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false })
        audioEl.srcObject = stream  
    
        
        
        const pc = new RTCPeerConnection();
        audioEl.autoplay = true;
        
        pc.ontrack = e => audioEl.srcObject = e.streams[0];
        // Add local audio track for microphone input in the browser
        const ms = await navigator.mediaDevices.getUserMedia({
            audio: true
        });
        pc.addTrack(ms.getTracks()[0]);

        // Set up data channel for sending and receiving events
        const dc = pc.createDataChannel("oai-events");
        dc.addEventListener("message", (e) => {
            setHistory(prevHistory => {
                return [...prevHistory, JSON.parse(e.data)]
            });
            // Realtime server events appear here!
            console.log(e);
        });
        console.log("initAudio 2")

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
    async function startAudio(){
        const localAudio = ref.current
        if (!localAudio) 
                return
        console.log("startAudio()")
        setAudioStarting(true)
        const tokenResponse = await fetch("/api/sessions");
        const data: ResponseData = await tokenResponse.json();
        const EPHEMERAL_KEY = data.client_secret.value;
        const stopObj = await initAudio(localAudio,EPHEMERAL_KEY)
        console.log("startAudio() 2", stopObj)
        setAudioStarting(false)
        setStopFn(stopObj)
    }
    console.log("stopFn", stopFn)
    return (
      <div>
        {
            stopFn ? (
                <button className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded" onClick={() => {
                    stopFn.stop()
                    setStopFn(null)
                }}>Stop</button>
            ) : (
                <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" onClick={startAudio}>{audioStarting ? "Starting...": "Start" }</button>
            )
        }
        <audio id="localVideo" ref={ref}></audio>
        <div>
            <h2>History</h2>
            <div>
                {history.map((item, index) => (
                    <div key={index}>
                        <pre>{JSON.stringify(item, null, 2)}</pre>
                    </div>
                ))}
            </div>
        </div>
      </div>
    )
}