import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { channelName, userUid } = await request.json();
    const appId =
      process.env.AGORA_APP_ID ||
      process.env.NEXT_PUBLIC_AGORA_APP_ID ||
      "2247f11d00e744869a06fae8c40130f9";
    const customerId = process.env.AGORA_CUSTOMER_ID;
    const customerSecret =
      process.env.AGORA_CUSTOMER_SECRET ||
      process.env.AGORA_CUSTOMER_CERTIFICATE;

    if (!appId || !customerId || !customerSecret) {
      return NextResponse.json(
        {
          error:
            "Missing Agora credentials. Set AGORA_APP_ID or NEXT_PUBLIC_AGORA_APP_ID, AGORA_CUSTOMER_ID, AGORA_CUSTOMER_SECRET in .env.local",
        },
        { status: 500 },
      );
    }

    const authHeader = `Basic ${Buffer.from(
      `${customerId}:${customerSecret}`,
    ).toString("base64")}`;

    const agentName = `stt-${channelName}-${Date.now()}`;
    const botToken =
      process.env.AGORA_BOT_TOKEN || process.env.NEXT_PUBLIC_AGORA_TOKEN || "";

    const rtcConfig: Record<string, unknown> = {
      channelName,
      subBotUid: "10001",
      pubBotUid: "10002",
      subscribeAudioUids: [String(userUid)],
    };
    if (botToken) {
      (rtcConfig as any).pubBotToken = botToken;
    }

    const url = `https://api.agora.io/api/speech-to-text/v1/projects/${appId}/join`;
    const startRes = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: agentName,
        languages: ["en-US", "ja-JP"],
        maxIdleTime: 60,
        rtcConfig,
      }),
    });

    const responseText = await startRes.text();
    if (!startRes.ok) {
      return NextResponse.json(
        { error: "Failed to start STT task", details: responseText },
        { status: startRes.status },
      );
    }

    const startData = JSON.parse(responseText) as {
      agent_id?: string;
      taskId?: string;
      task_id?: string;
    };
    const taskId =
      startData.agent_id || startData.taskId || startData.task_id || null;
    if (!taskId) {
      return NextResponse.json(
        {
          error: "STT started but no taskId returned",
          details: JSON.stringify(startData),
        },
        { status: 500 },
      );
    }

    return NextResponse.json({ taskId });
  } catch (error) {
    const message = (error as Error)?.message || "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
