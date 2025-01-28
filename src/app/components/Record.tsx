"use client"
import React from "react";
import { useEffect, useState} from "react";
export type ResponseData = {
    sdp: string
}
import { StopIcon, PlayIcon } from '@radix-ui/react-icons';


export const Record = () => {
    
    const [audioController, setaudioController] = useState<null |RTCPeerConnection>(null)
    const recordStatus = audioController ? true : false
    async function startRecording(){
        console.log(`"startRecording"`)
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });

        const pc = new RTCPeerConnection({
            iceServers: [
                {
                urls: 'stun:stun.l.google.com:19302'
                }
            ]
        
        })
        setaudioController(pc)
        stream.getTracks().forEach(track => pc.addTrack(track, stream))
        const offer = await pc.createOffer();
        pc.oniceconnectionstatechange = () => console.log(`pc.iceConnectionState: `,pc.iceConnectionState)
        pc.onconnectionstatechange = () => console.log(`pc.connectionState: `,pc.connectionState)
        pc.setLocalDescription(offer)
        const encodedOffer = btoa(JSON.stringify(offer))
        console.log(`encodedOffer`, encodedOffer)
        const tokenResponse = await fetch("http://127.0.0.1:3001/records",{
            method: "POST",
            body: JSON.stringify({
                sdp: encodedOffer
            }),
            headers: {
                "Content-Type": "application/json"
            }
        })
        const data: ResponseData = await tokenResponse.json();
        pc.setRemoteDescription(new RTCSessionDescription(JSON.parse(atob(data.sdp))))
        // stream.getTracks().forEach(track =>track.stop())
    }//end startRecording

    function stopRecording(){
            audioController?.getSenders().forEach(sender => {
                sender.track?.stop()
            }) 
            audioController?.close()
            setaudioController(null)
            return
    }//end stopRecording


    return (
        <div>
            <h1>Record</h1>
            <div className="">
                <button
                    className={`${recordStatus ? "bg-red-500 hover:bg-red-700" : "bg-green-500 hover:bg-green-700"} text-white font-bold py-2 px-4 rounded flex flex-row items-center gap-4 p-1`} 
                    onClick={() => {
                        if(recordStatus){
                            stopRecording()
                        }else{
                            startRecording()
                            
                        }
                    }}>
                    {recordStatus ? <StopIcon /> : <PlayIcon />}
                    <span>{recordStatus ? "Stop" : "Start"} Recording</span>
                </button>
            </div>
             <div> --- </div>
        </div>
    )
}


