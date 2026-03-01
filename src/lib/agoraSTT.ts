"use client";

import type { IAgoraRTCClient, IMicrophoneAudioTrack } from "agora-rtc-sdk-ng";
import { useCallback, useEffect, useRef, useState } from "react";

export type AgoraConfig = {
  appId: string;
  channel: string;
  token: string | null;
  uid?: number;
};

export function useAgoraSTT() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [agoraError, setAgoraError] = useState<string | null>(null);
  
  const clientRef = useRef<IAgoraRTCClient | null>(null);
  const localAudioTrackRef = useRef<IMicrophoneAudioTrack | null>(null);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      stopAgoraSTT();
    };
  }, []);

  const startAgoraSTT = useCallback(async (config: AgoraConfig) => {
    if (!config.appId || !config.channel) {
      console.error("Agora App ID and Channel are required.");
      return;
    }

    try {
      // Dynamically import Agora to avoid "window is not defined" in SSR
      const AgoraRTC = (await import("agora-rtc-sdk-ng")).default;

      // 1. Create client
      const client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
      clientRef.current = client;

      // 2. Listen for stream messages (This is where STT results come in)
      client.on("stream-message", (uid: number, payload: Uint8Array) => {
        try {
          // Agora STT payloads are often protobuf or JSON encoded strings.
          const decoder = new TextDecoder("utf-8");
          const text = decoder.decode(payload);
          
          console.log(`[Agora STT] Message from ${uid}:`, text);
          
          // Assuming it's a simple text for now, but usually it's JSON with { text: "..." }
          // Let's try to parse it, and if it fails, just use the raw text.
          let parsedText = text;
          try {
            const json = JSON.parse(text);
            if (json.text) {
              parsedText = json.text;
            } else if (json.words) {
               // handle custom agora stt object structure if applicable
            }
          } catch (e) {
             // Not JSON, just use raw
          }
           
          // Important: We just log it as the user requested for the first step.
          console.log("[Agora STT] Extracted Transcript:", parsedText);
          setTranscript(parsedText);
        } catch (error) {
          console.error("[Agora STT] Failed to decode stream message:", error);
        }
      });

      // 3. Join the channel
      await client.join(config.appId, config.channel, config.token, config.uid || null);
      console.log("[Agora STT] Joined channel successfully.");

      // 4. Create and publish local audio track
      const localAudioTrack = await AgoraRTC.createMicrophoneAudioTrack();
      localAudioTrackRef.current = localAudioTrack;
      
      await client.publish([localAudioTrack]);
      console.log("[Agora STT] Published microphone track successfully.");

      setIsListening(true);
      setTranscript("");
      setAgoraError(null);
    } catch (error: any) {
      console.error("[Agora STT] Failed to start:", error);
      // Surface the error back to the hook state so UI can show it
      let errMessage = "Failed to connect to Agora.";
      if (error && error.message) {
         errMessage = error.message;
      } else if (typeof error === 'string') {
         errMessage = error;
      }
      setAgoraError(errMessage);
      stopAgoraSTT();
    }
  }, []);

  const stopAgoraSTT = useCallback(async () => {
    try {
      if (localAudioTrackRef.current) {
        localAudioTrackRef.current.stop();
        localAudioTrackRef.current.close();
        localAudioTrackRef.current = null;
      }
      if (clientRef.current) {
        await clientRef.current.leave();
        clientRef.current = null;
      }
      console.log("[Agora STT] Stopped and left channel.");
    } catch (error) {
      console.error("[Agora STT] Error while stopping:", error);
    } finally {
      setIsListening(false);
    }
  }, []);

  return {
    isListening,
    transcript,
    agoraError,
    startAgoraSTT,
    stopAgoraSTT,
  };
}
