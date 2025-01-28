use axum::{routing::post, Json, Router};
use serde::{Deserialize, Serialize};
use tower_http::cors::CorsLayer;

use std::fs::File;
use std::sync::Arc;

use anyhow::Result;
use tokio::sync::{Mutex, Notify};
use tokio::time::Duration;
use webrtc::api::interceptor_registry::register_default_interceptors;
use webrtc::api::media_engine::{MediaEngine, MIME_TYPE_H264, MIME_TYPE_OPUS};
use webrtc::api::APIBuilder;
use webrtc::ice_transport::ice_connection_state::RTCIceConnectionState;
use webrtc::ice_transport::ice_server::RTCIceServer;
use webrtc::interceptor::registry::Registry;
use webrtc::media::io::h264_writer::H264Writer;
use webrtc::media::io::ogg_writer::OggWriter;
use webrtc::peer_connection::configuration::RTCConfiguration;
use webrtc::peer_connection::sdp::session_description::RTCSessionDescription;
use webrtc::rtcp::payload_feedbacks::picture_loss_indication::PictureLossIndication;
use webrtc::rtp_transceiver::rtp_codec::{
    RTCRtpCodecCapability, RTCRtpCodecParameters, RTPCodecType,
};
use webrtc::track::track_remote::TrackRemote;

#[derive(Deserialize)]
struct SdpRequest {
    sdp: String,
}

#[derive(Serialize)]
struct SdpResponse {
    sdp: String,
}

async fn record_handler(Json(payload): Json<SdpRequest>) -> Json<SdpResponse> {
    let sdp = payload.sdp.clone();
    println!("encoded sdp:");
    // Spawn the record function in the background
    let sdp_response = match tokio::spawn(async move {
        println!("start spawn record sdp: {sdp}");
        record(sdp).await
    })
    .await
    {
        Ok(Ok(sdp_response)) => sdp_response,
        Ok(Err(err)) => {
            println!("record error: {err}");
            err.to_string()
        }
        Err(err) => {
            println!("record spawn error: {err}");
            err.to_string()
        }
    };
    Json(SdpResponse { sdp: sdp_response })
}
async fn record(sdp: String) -> Result<String> {
    let video_file = "video_file.h264";
    let audio_file = "audio_file.ogg";
    println!("----------- record sdp 0");

    let h264_writer: Arc<Mutex<dyn webrtc::media::io::Writer + Send + Sync>> =
        Arc::new(Mutex::new(H264Writer::new(File::create(video_file)?)));
    let ogg_writer: Arc<Mutex<dyn webrtc::media::io::Writer + Send + Sync>> = Arc::new(Mutex::new(
        OggWriter::new(File::create(audio_file)?, 48000, 2)?,
    ));
    // Everything below is the WebRTC-rs API! Thanks for using it ❤️.

    // Create a MediaEngine object to configure the supported codec
    let mut m = MediaEngine::default();
    println!("record 1");
    // Setup the codecs you want to use.
    // We'll use a H264 and Opus but you can also define your own
    m.register_codec(
        RTCRtpCodecParameters {
            capability: RTCRtpCodecCapability {
                mime_type: MIME_TYPE_H264.to_owned(),
                clock_rate: 90000,
                channels: 0,
                sdp_fmtp_line: "".to_owned(),
                rtcp_feedback: vec![],
            },
            payload_type: 102,
            ..Default::default()
        },
        RTPCodecType::Video,
    )?;

    m.register_codec(
        RTCRtpCodecParameters {
            capability: RTCRtpCodecCapability {
                mime_type: MIME_TYPE_OPUS.to_owned(),
                clock_rate: 48000,
                channels: 2,
                sdp_fmtp_line: "".to_owned(),
                rtcp_feedback: vec![],
            },
            payload_type: 111,
            ..Default::default()
        },
        RTPCodecType::Audio,
    )?;
    println!("record 2");
    // Create a InterceptorRegistry. This is the user configurable RTP/RTCP Pipeline.
    // This provides NACKs, RTCP Reports and other features. If you use `webrtc.NewPeerConnection`
    // this is enabled by default. If you are manually managing You MUST create a InterceptorRegistry
    // for each PeerConnection.
    let mut registry = Registry::new();

    // Use the default set of Interceptors
    registry = register_default_interceptors(registry, &mut m)?;
    println!("record 3");
    // Create the API object with the MediaEngine
    let api = APIBuilder::new()
        .with_media_engine(m)
        .with_interceptor_registry(registry)
        .build();
    println!("record 4");
    // Prepare the configuration
    let config = RTCConfiguration {
        ice_servers: vec![RTCIceServer {
            urls: vec!["stun:stun.l.google.com:19302".to_owned()],
            ..Default::default()
        }],
        ..Default::default()
    };
    println!("record 5");
    // Create a new RTCPeerConnection
    let peer_connection = Arc::new(api.new_peer_connection(config).await?);
    println!("record 6");
    // Allow us to receive 1 audio track, and 1 video track
    peer_connection
        .add_transceiver_from_kind(RTPCodecType::Audio, None)
        .await?;
    peer_connection
        .add_transceiver_from_kind(RTPCodecType::Video, None)
        .await?;

    let notify_tx = Arc::new(Notify::new());
    let notify_rx = notify_tx.clone();

    // Set a handler for when a new remote track starts, this handler saves buffers to disk as
    // an ivf file, since we could have multiple video tracks we provide a counter.
    // In your application this is where you would handle/process video
    let pc = Arc::downgrade(&peer_connection);
    println!("record 7");
    peer_connection.on_track(Box::new(move |track, _, _| {
        // Send a PLI on an interval so that the publisher is pushing a keyframe every rtcpPLIInterval
        let media_ssrc = track.ssrc();
        let pc2 = pc.clone();
        tokio::spawn(async move {
            let mut result = Result::<usize>::Ok(0);
            while result.is_ok() {
                let timeout = tokio::time::sleep(Duration::from_secs(3));
                tokio::pin!(timeout);

                tokio::select! {
                    _ = timeout.as_mut() =>{
                        if let Some(pc) = pc2.upgrade(){
                            result = pc.write_rtcp(&[Box::new(PictureLossIndication{
                                sender_ssrc: 0,
                                media_ssrc,
                            })]).await.map_err(Into::into);
                        }else {
                            break;
                        }
                    }
                };
            }
        });

        let notify_rx2 = Arc::clone(&notify_rx);
        let h264_writer2 = Arc::clone(&h264_writer);
        let ogg_writer2 = Arc::clone(&ogg_writer);
        Box::pin(async move {
            let codec = track.codec();
            let mime_type = codec.capability.mime_type.to_lowercase();
            if mime_type == MIME_TYPE_OPUS.to_lowercase() {
                println!("Got Opus track, saving to disk as output.opus (48 kHz, 2 channels)");
                tokio::spawn(async move {
                    let _ = save_to_disk(ogg_writer2, track, notify_rx2).await;
                });
            } else if mime_type == MIME_TYPE_H264.to_lowercase() {
                println!("Got h264 track, saving to disk as output.h264");
                tokio::spawn(async move {
                    let _ = save_to_disk(h264_writer2, track, notify_rx2).await;
                });
            }
        })
    }));
    println!("record 8");
    // let (done_tx, mut done_rx) = tokio::sync::mpsc::channel::<()>(1);

    // Set the handler for ICE connection state
    // This will notify you when the peer has connected/disconnected
    peer_connection.on_ice_connection_state_change(Box::new(
        move |connection_state: RTCIceConnectionState| {
            println!("Connection State has changed {connection_state}");

            if connection_state == RTCIceConnectionState::Connected {
                println!("Ctrl+C the remote client to stop the demo");
            } else if connection_state == RTCIceConnectionState::Failed {
                notify_tx.notify_waiters();

                println!("Done writing media files");
                // let _ = done_tx.try_send(());
            }
            Box::pin(async {})
        },
    ));
    println!("record 9");
    let desc_data = signal::decode(&sdp)?;
    println!("desc_data sdp:");
    println!("{desc_data}");
    println!("end desc_data sdp");
    let offer = serde_json::from_str::<RTCSessionDescription>(&desc_data)?;

    peer_connection.set_remote_description(offer).await?;
    println!("record 11");
    
    // Create an answer
    let answer = peer_connection.create_answer(None).await?;

    // Create channel that is blocked until ICE Gathering is complete
    let mut gather_complete = peer_connection.gathering_complete_promise().await;

    // Sets the LocalDescription, and starts our UDP listeners
    peer_connection.set_local_description(answer).await?;

    // Block until ICE Gathering is complete, disabling trickle ICE
    // we do this because we only can exchange one signaling message
    // in a production application you should exchange ICE Candidates via OnICECandidate
    let _ = gather_complete.recv().await;

    // Output the answer in base64 so we can paste it in browser
    let b64 = if let Some(local_desc) = peer_connection.local_description().await {
        let json_str = serde_json::to_string(&local_desc)?;
        let b64 = signal::encode(&json_str);
        println!("local_description setted!");
        // println!("{b64}");
        b64
    } else {
        println!("generate local_description failed!");
        String::new()
    };
    println!("record 12");

    // println!("Press ctrl-c to stop");
    // tokio::select! {
    //     _ = done_rx.recv() => {
    //         println!("received done signal!");
    //     }
    //     _ = tokio::signal::ctrl_c() => {
    //         println!();
    //     }
    // };
    println!("record 13");
    // peer_connection.close().await?;
    println!("record 14 - local_description returned");
    Ok(b64)

}

#[tokio::main]
async fn main() {
    let app = Router::new()
        .route("/records", post(record_handler))
        .layer(CorsLayer::permissive());

    let listener = tokio::net::TcpListener::bind("0.0.0.0:3001").await.unwrap();
    axum::serve(listener, app).await.unwrap();
}

async fn save_to_disk(
    writer: Arc<Mutex<dyn webrtc::media::io::Writer + Send + Sync>>,
    track: Arc<TrackRemote>,
    notify: Arc<Notify>,
) -> Result<()> {
    println!("initialize save_to_disk");
    loop {
        tokio::select! {
            result = track.read_rtp() => {
                println!("track.read_rtp()");
                if let Ok((rtp_packet, _)) = result {
                    println!("track.read_rtp() Ok()");
                    let mut w = writer.lock().await;
                    w.write_rtp(&rtp_packet)?;
                }else{
                    println!("file closing begin after read_rtp error");
                    let mut w = writer.lock().await;
                    if let Err(err) = w.close() {
                        println!("file close err: {err}");
                    }
                    println!("file closing end after read_rtp error");
                    return Ok(());
                }
            }
            _ = notify.notified() => {
                println!("file closing begin after notified");
                let mut w = writer.lock().await;
                if let Err(err) = w.close() {
                    println!("file close err: {err}");
                }
                println!("file closing end after notified");
                return Ok(());
            }
        }
    }
}