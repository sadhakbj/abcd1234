import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { text } = await request.json();

    if (!text) {
      return NextResponse.json({ error: 'No text provided' }, { status: 400 });
    }

    const apiKey = process.env.MINIMAX_API_KEY || "sk-api-7cIyvjVxYu64ft6b01Wg7xhebOm_glTDy5dUIfBFC1rwu70pUMS8Zs_8-jum3M0TC1Ul2fgbLH2hu7LDCjpG2Jsflrj6jPw_-lAxPw1nxT5DDZUAR3bvtBc";

    if (!apiKey) {
      return NextResponse.json({ error: 'Missing MINIMAX_API_KEY' }, { status: 400 });
    }

    const MINIMAX_TTS_URL = "https://api.minimaxi.chat/v1/t2a_v2";

    const response = await fetch(MINIMAX_TTS_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "speech-01-turbo",
        text: text,
        stream: false,
        voice_setting: {
            voice_id: "male-qn-qingse",
            speed: 1,
            vol: 1,
            pitch: 0
        },
        pronunciation_dict: {
            tone: ["Hello"]
        },
        audio_setting: {
            sample_rate: 32000,
            bitrate: 128000,
            format: "mp3",
            channel: 1
        }
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("Minimax TTS API Error:", errorData);
      return NextResponse.json({ error: `Minimax API HTTP ${response.status}`, details: errorData }, { status: 500 });
    }

    const data = await response.json();
    
    // Minimax returns base_resp and data { audio: 'hex_string' }
    if (data.data && data.data.audio) {
      // Decode the hex string back into binary MP3 buffer
      const audioBuffer = Buffer.from(data.data.audio, 'hex');
      
      return new NextResponse(audioBuffer, {
        headers: {
          'Content-Type': 'audio/mpeg',
          'Content-Length': audioBuffer.length.toString(),
        },
      });
    } else {
      console.error("Minimax empty audio data:", data);
      return NextResponse.json({ error: 'Minimax API did not return audio data', details: data }, { status: 500 });
    }

  } catch (error: any) {
    console.error("TTS Route Error:", error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
