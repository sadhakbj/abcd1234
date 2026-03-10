import type { SupportedLang } from "@/lib/knowledgeBase";

export async function transcribeAudio(
  blob: Blob,
  lang: SupportedLang,
): Promise<string> {
  const formData = new FormData();
  formData.append("file", blob, "recording.webm");
  formData.append("language", lang);

  const res = await fetch("/api/openai/stt", {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `STT failed (${res.status})`);
  }

  const data = await res.json();
  return data.text || "";
}

export async function classifyIntent(transcript: string): Promise<string> {
  const res = await fetch("/api/openai/classify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ transcript }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Classification failed (${res.status})`);
  }

  const data = await res.json();
  return data.intent || "unsupported";
}

export async function generateSpeech(text: string): Promise<ArrayBuffer> {
  const res = await fetch("/api/openai/tts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });

  if (!res.ok) throw new Error("TTS failed");

  return res.arrayBuffer();
}
