"use client";
import { useRTCClient } from "agora-rtc-react";
import AgoraRTC, { IMicrophoneAudioTrack } from "agora-rtc-sdk-ng";
import { useEffect, useRef, useState } from "react";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let AgoraRTM: any = null;

if (typeof window !== "undefined") {
  import("agora-rtm-sdk").then((mod) => {
    AgoraRTM = mod.default || mod;
  });
}
interface AgoraSTTProps {
  appId: string;
  channel: string;
  token: string | null;
  uid?: number;
  onTranscript: (text: string, isFinal: boolean) => void;
  onStateChange?: (state: string) => void;
  onVolumeLevel?: (level: number) => void;
}

export default function AgoraSTT({
  appId,
  channel,
  token,
  uid,
  onTranscript,
  onStateChange,
  onVolumeLevel,
}: AgoraSTTProps) {
  const client = useRTCClient();
  const [isJoined, setIsJoined] = useState(false);
  const audioTrackRef = useRef<IMicrophoneAudioTrack | null>(null);
  const isRunningRef = useRef(false);

  useEffect(() => {
    if (!client || !appId || !channel || !token || !uid) return;
    if (isRunningRef.current) return;

    isRunningRef.current = true;
    let mounted = true;

    const startSession = async () => {
      try {
        console.log("[AgoraSTT] Starting session...", { channel, uid });

        // 1. Join Channel
        // Use hardcoded token provided by user if channel is BPK
        // Note: The provided token might be for a specific UID or wildcards.
        // If it fails with "invalid token", check UID.
        // The user provided token: 007eJx... which usually includes AppID/Channel.
        // We assume it's valid for this channel.
        const safeUid = Number(uid);
        await client.join(appId, channel, token, safeUid);

        if (!mounted) return;
        setIsJoined(true);
        console.log("[AgoraSTT] Joined channel");

        // --- RTM Initialization ---
        // Agora STT results are sometimes sent via RTM (Real-time Messaging)
        // especially if using certain cloud transcription modes.
        // Let's try to connect RTM as well using the same AppID and a generated UID (or same UID).
        // RTM requires string UID.
        if (AgoraRTM) {
          const rtmClient = AgoraRTM.createInstance(appId);
          const rtmUid = String(uid);

          // Note: RTM requires its own token if App Certificate is enabled.
          // Re-using the RTC token *might* work if it's a wildcard token, but usually RTM has separate tokens.
          // For testing "BPK" channel with the provided temp token, let's see if we can login.
          // If this fails, we might need to skip RTM or generate a specific RTM token.
          try {
            await rtmClient.login({ uid: rtmUid, token: token || undefined });
            console.log("[AgoraSTT] RTM Login success");

            const rtmChannel = rtmClient.createChannel(channel);
            await rtmChannel.join();
            console.log("[AgoraSTT] RTM Channel joined");

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            rtmChannel.on(
              "ChannelMessage",
              (message: any, memberId: string) => {
                console.log(
                  "[AgoraSTT] RTM Message from " + memberId + ":",
                  message,
                );
                if (message.text) {
                  try {
                    const json = JSON.parse(message.text);
                    // RTM message format might differ
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const transcript =
                      json.text ||
                      json.words?.map((w: any) => w.text).join(" ") ||
                      message.text;
                    const isFinal = json.isFinal || json.is_final || false;
                    onTranscript(transcript, isFinal);
                  } catch {
                    onTranscript(message.text, false);
                  }
                }
              },
            );
          } catch (rtmErr) {
            console.warn(
              "[AgoraSTT] RTM Init Failed (might need separate token):",
              rtmErr,
            );
          }
        } else {
          console.warn("[AgoraSTT] AgoraRTM SDK not loaded yet.");
        }
        // --- End RTM ---

        // 2. Create Microphone Track
        const track = await AgoraRTC.createMicrophoneAudioTrack();
        if (!mounted) {
          track.close();
          return;
        }
        audioTrackRef.current = track;

        // Ensure volume is enabled
        // Some browsers might mute it by default or require user interaction
        track.play();

        // 3. Publish Track
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await client.publish(track as any);
        console.log("[AgoraSTT] Published microphone");

        // 4. Start Cloud STT Task (Backend Trigger)
        // We trigger this *after* joining and publishing
        startCloudTranscription(channel, safeUid);
      } catch (err) {
        console.error("[AgoraSTT] Error in session:", err);
      }
    };

    const startCloudTranscription = async (
      channelName: string,
      userUid: number,
    ) => {
      try {
        console.log("[AgoraSTT] Triggering Cloud STT...");
        const res = await fetch("/api/agora/stt/start", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ channelName, userUid }),
        });
        const data = await res.json();
        console.log("[AgoraSTT] Cloud STT Response:", data);
      } catch (e) {
        console.error("[AgoraSTT] Failed to trigger Cloud STT:", e);
      }
    };

    startSession();

    // Event Listeners
    const handleConnectionStateChange = (
      curState: string,
      revState: string,
    ) => {
      console.log(`[AgoraSTT] Connection: ${revState} -> ${curState}`);
      onStateChange?.(curState);
    };

    const handleStreamMessage = (senderUid: number, payload: Uint8Array) => {
      try {
        // Agora STT often sends Protobuf-encoded data, not simple JSON/Text.
        // However, if we configured "destinations": ["AgoraRTCDataStream"] in v1,
        // it might be JSON. But in v7 (Real-time STT), it is often a specific format.
        // Let's first try to decode as UTF-8 text/JSON.
        const decoder = new TextDecoder("utf-8");
        const text = decoder.decode(payload);
        console.log(`[AgoraSTT] Stream Message from ${senderUid}:`, text);

        // Check if it looks like the standard Agora STT Protobuf wrapper or raw JSON
        // Common Agora STT JSON format:
        // { "text": "...", "isFinal": boolean, "confidence": ... }

        try {
          const json = JSON.parse(text);
          // If it has 'words', it might be partial.
          // If it has 'text', it is the transcript.
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const words = json.words as any[] | undefined;
          const transcript =
            json.text || words?.map((w) => w.text).join(" ") || "";
          const isFinal = json.isFinal || json.is_final || false;

          if (transcript) {
            console.log("Converted STT text:", transcript, "final:", isFinal);
            onTranscript(transcript, isFinal);
          }
        } catch {
          // If not JSON, it might be raw text or Protobuf binary we failed to parse as text.
          // For now, treat as raw text if it's readable.
          // If the text is garbled (binary), we might need a Protobuf decoder (TextHelper/SttMessage).
          // But usually, standard web STT integration sends JSON if configured correctly.
          if (text && text.length > 0) {
            console.log("Converted STT text (raw):", text);
            onTranscript(text, false);
          }
        }
      } catch (e) {
        console.error("[AgoraSTT] Error decoding message:", e);
      }
    };

    const handleUserPublished = async (
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      user: any,
      mediaType: "audio" | "video",
    ) => {
      // Subscribe to remote users (e.g. the STT bot audio if it speaks)
      try {
        await client.subscribe(user, mediaType);
        if (mediaType === "audio") {
          user.audioTrack?.play();
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (e: any) {
        // Ignore abort errors
        if (e.code !== "OPERATION_ABORTED") {
          console.error("[AgoraSTT] Subscribe error:", e);
        }
      }
    };

    client.on("connection-state-change", handleConnectionStateChange);
    client.on("stream-message", handleStreamMessage);
    client.on("user-published", handleUserPublished);

    // Audio Volume Monitoring
    const volumeInterval = setInterval(() => {
      if (audioTrackRef.current) {
        // getVolumeLevel returns 0 to 1
        const level = audioTrackRef.current.getVolumeLevel();
        // console.log("[AgoraSTT] Mic Level:", level); // Debugging
        onVolumeLevel?.(level);
      }
    }, 100);

    return () => {
      mounted = false;
      isRunningRef.current = false;
      clearInterval(volumeInterval);

      // Cleanup
      const cleanup = async () => {
        // Stop listeners
        client.off("connection-state-change", handleConnectionStateChange);
        client.off("stream-message", handleStreamMessage);
        client.off("user-published", handleUserPublished);

        // Close track
        if (audioTrackRef.current) {
          audioTrackRef.current.close();
          audioTrackRef.current = null;
        }

        // Leave channel
        try {
          await client.leave();
          console.log("[AgoraSTT] Left channel");
        } catch (e) {
          console.error("[AgoraSTT] Error leaving:", e);
        }
        setIsJoined(false);
      };

      cleanup();
    };
  }, [client, appId, channel, token, uid]); // Re-run only if these change

  return null;
}
