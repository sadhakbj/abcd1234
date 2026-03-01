"use client";

import { AgoraRTCProvider } from "agora-rtc-react";
import AgoraRTC, { IAgoraRTCClient } from "agora-rtc-sdk-ng";
import { ReactNode, useEffect, useState } from "react";

export default function AgoraWrapper({ children }: { children: ReactNode }) {
  const [client, setClient] = useState<IAgoraRTCClient | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      Promise.resolve().then(() => {
        const c = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
        setClient(c);
      });
    }
  }, []);

  if (!client) return null;

  return (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    <AgoraRTCProvider client={client as unknown as any}>
      {children}
    </AgoraRTCProvider>
  );
}
