"use client"
import { useRef,ComponentRef,useState } from "react";
import {ResponseData} from "../../pages/api/sessions"
import { initAudio } from "../openaiRealtimeClient/openaiRealtimeClient";
type MediaElement = ComponentRef<"audio">


export function WebRtc(){
    const ref = useRef<MediaElement>(null)
    const defaultHistory:object[] = []
    const [history, setHistory] = useState(defaultHistory)
    const [audioStarting, setAudioStarting] = useState(false)
    const [stopFn, setStopFn] = useState<null | {stop: () => void}>(null)

   
    async function startAudio(){
        const localAudio = ref.current
        if (!localAudio) 
                return
        console.log("startAudio()")
        setAudioStarting(true)
        const tokenResponse = await fetch("/api/sessions");
        const data: ResponseData = await tokenResponse.json();
        const EPHEMERAL_KEY = data.client_secret.value;
        const stopObj = await initAudio(localAudio,EPHEMERAL_KEY, (event) => {
            setHistory(prevHistory => {
                return [...prevHistory, event]
            });
        })
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