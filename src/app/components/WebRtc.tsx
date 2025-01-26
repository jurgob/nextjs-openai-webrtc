"use client"
import { useRef,ComponentRef,useState } from "react";
import {ResponseData} from "../../pages/api/sessions"
import { initAudio,AudioController } from "../openaiRealtimeClient/openaiRealtimeClient";
import { Visualizer } from 'react-sound-visualizer';

type MediaElement = ComponentRef<"audio">


export function WebRtc(){
    const ref = useRef<MediaElement>(null)
    const defaultHistory:object[] = []
    const [history, setHistory] = useState(defaultHistory)
    const [audioStarting, setAudioStarting] = useState(false)
    const [audioController, setaudioController] = useState<null |AudioController>(null)
    const [audioRemoteStream, setAudioRemoteStream] = useState<null |MediaStream>(null)
   
    async function startAudio(){
        const localAudio = ref.current
        if (!localAudio) 
                return
        console.log("startAudio()")
        setAudioStarting(true)
        const tokenResponse = await fetch("/api/sessions");
        const data: ResponseData = await tokenResponse.json();
        const EPHEMERAL_KEY = data.client_secret.value;
        const stopObj = await initAudio({
            audioEl: localAudio,
            EPHEMERAL_KEY, 
            onEvent: (event) => {
                setHistory(prevHistory => {
                    return [...prevHistory, event]
                });
            },
            onRemoteStream: (remoteStream) => {
                setAudioRemoteStream(remoteStream)
                console.log("remoteStream", remoteStream)
            }

        })
        console.log("startAudio() 2", stopObj)
        setAudioStarting(false)
        setaudioController(stopObj)
    }
    console.log("audioController", audioController)
    return (
      <div>
        {
            audioController ? (
                <button className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded" onClick={() => {
                    audioController.stop()
                    setaudioController(null)
                }}>Stop</button>
            ) : (
                <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" onClick={startAudio}>{audioStarting ? "Starting...": "Start" }</button>
            )
        }
        <audio id="localVideo" ref={ref}></audio>
        <h2>Local Audio: </h2>
        {audioController &&
            <Visualizer audio={audioController.localVoiceStream} autoStart={true} mode="current" >
                {({ canvasRef, stop, start, reset }) => (
                <>
                    <canvas ref={canvasRef} width={500} height={100} color="black" />

                    <div>
                    <button onClick={start}>Start</button>
                    <button onClick={stop}>Stop</button>
                    <button onClick={reset}>Reset</button>
                    </div>
                </>
            )}
            </Visualizer>
        }
        <h2>Remote Audio: </h2>
        {audioRemoteStream && (
            <Visualizer audio={audioRemoteStream} autoStart={true} mode="current" >
            {({ canvasRef, stop, start, reset }) => (
            <>
                <canvas ref={canvasRef} width={500} height={100} color="black" />

                <div>
                <button onClick={start}>Start</button>
                <button onClick={stop}>Stop</button>
                <button onClick={reset}>Reset</button>
                </div>
            </>
        )}
        </Visualizer>
        )}

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