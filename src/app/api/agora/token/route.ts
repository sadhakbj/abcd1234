import { RtcRole, RtcTokenBuilder } from 'agora-token';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const channelName = searchParams.get('channelName');
  const uid = searchParams.get('uid');

  if (!channelName) {
    return NextResponse.json({ error: 'channel name is required' }, { status: 400 });
  }

  // Note: For a production app, the App ID and App Certificate should be in .env.local
  // This is a placeholder since the user only provided the App ID so far.
  // The error "dynamic use static key" means the Agora project is configured 
  // to require an App Certificate to generate tokens, it cannot use just App ID (static).
  const appId = process.env.NEXT_PUBLIC_AGORA_APP_ID || "2247f11d00e744869a06fae8c40130f9";
  
  // Using the provided App Certificate to enable dynamic tokens
  const appCertificate = process.env.AGORA_APP_CERTIFICATE || "e873b998140b48ac943b230b7f38ed9f";

  if (!appCertificate) {
     return NextResponse.json({ 
       error: 'App Certificate is missing. Please provide it in the environment variables.' 
     }, { status: 500 });
  }

  const role = RtcRole.PUBLISHER;
  const expirationTimeInSeconds = 3600;
  const currentTimestamp = Math.floor(Date.now() / 1000);
  const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;

  try {
    const token = RtcTokenBuilder.buildTokenWithUid(
      appId,
      appCertificate,
      channelName,
      uid ? parseInt(uid, 10) : 0,
      role,
      expirationTimeInSeconds,
      privilegeExpiredTs
    );

    return NextResponse.json({ token });
  } catch (error) {
    console.error("Error generating token:", error);
    return NextResponse.json({ error: 'Failed to generate token' }, { status: 500 });
  }
}
