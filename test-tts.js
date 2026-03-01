const fs = require('fs');
const https = require('https');

const API_KEY = "sk-api-7cIyvjVxYu64ft6b01Wg7xhebOm_glTDy5dUIfBFC1rwu70pUMS8Zs_8-jum3M0TC1Ul2fgbLH2hu7LDCjpG2Jsflrj6jPw_-lAxPw1nxT5DDZUAR3bvtBc";

async function testTTS(endpoint) {
    console.log("Testing endpoint:", endpoint);
    try {
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_KEY}`
            },
            body: JSON.stringify({
                model: "speech-01-turbo",
                text: "Hello, this is a test of the Minimax text to speech engine.",
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

        console.log("Status:", response.status);
        if (response.ok) {
            const data = await response.json();
            console.log("Success data keys:", Object.keys(data));
            if (data.data && data.data.audio) {
                console.log("Audio returned!");
            } else {
                 console.log("Response:", data);
            }
        } else {
            console.log("Error response:", await response.text());
        }
    } catch (e) {
        console.error("Fetch failed:", e.message);
    }
}

async function run() {
    await testTTS("https://api.minimaxi.chat/v1/t2a_v2");
    await testTTS("https://api.minimax.chat/v1/t2a_v2");
}

run();
