import { NextResponse } from 'next/server';

// Minimax ASR / Speech-to-Text API Route
export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json({ error: 'No audio file provided' }, { status: 400 });
    }

    // Process the API key from environment or user input
    // The user provided this key: sk-api-7cIyvjVxYu64ft6b01Wg7xhebOm_glTDy5dUIfBFC1rwu70pUMS8Zs_8-jum3M0TC1Ul2fgbLH2hu7LDCjpG2Jsflrj6jPw_-lAxPw1nxT5DDZUAR3bvtBc
    const apiKey = process.env.MINIMAX_API_KEY || "sk-api-7cIyvjVxYu64ft6b01Wg7xhebOm_glTDy5dUIfBFC1rwu70pUMS8Zs_8-jum3M0TC1Ul2fgbLH2hu7LDCjpG2Jsflrj6jPw_-lAxPw1nxT5DDZUAR3bvtBc";

    if (!apiKey) {
      return NextResponse.json({ error: 'Missing MINIMAX_API_KEY' }, { status: 400 });
    }

    // Minimax Audio to Text API endpoint (Assuming OpenAI compatibility, as is common for MiniMax)
    // If MiniMax has a different specific ASR endpoint, it must be updated here.
    const MINIMAX_ASR_URL = "https://api.minimax.chat/v1/audio/transcriptions";

    const minimaxFormData = new FormData();
    minimaxFormData.append('file', file);
    minimaxFormData.append('model', 'speech-01'); // Standard speech model assuming openai-style params

    const response = await fetch(MINIMAX_ASR_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        // Note: do not set content-type for Formdata, let fetch set boundary automatically
      },
      body: minimaxFormData,
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error("Minimax API Error:", errorData);
      return NextResponse.json({ 
        error: `Minimax API HTTP ${response.status}`, 
        details: errorData 
      }, { status: 500 });
    }

    const data = await response.json();
    
    // Assuming OpenAI compatible response: { text: "..." }
    return NextResponse.json({ text: data.text });

  } catch (error: any) {
    console.error("STT Route Error:", error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
