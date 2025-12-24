import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get('audio') as File;
    
    if (!audioFile) {
      return NextResponse.json({ error: 'No audio file provided' }, { status: 400 });
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
    }

    // Convert File to proper format for Groq Whisper API
    const arrayBuffer = await audioFile.arrayBuffer();
    const blob = new Blob([arrayBuffer], { type: audioFile.type || 'audio/webm' });
    
    const whisperFormData = new FormData();
    whisperFormData.append('file', blob, 'audio.webm');
    whisperFormData.append('model', 'whisper-large-v3');
    whisperFormData.append('response_format', 'json');
    whisperFormData.append('language', 'en');

    const response = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      },
      body: whisperFormData
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Whisper API error:', errorText);
      return NextResponse.json({ error: 'Transcription failed' }, { status: 500 });
    }

    const data = await response.json();
    return NextResponse.json({ text: data.text || '' });
  } catch (error) {
    console.error('Transcription error:', error);
    return NextResponse.json({ error: 'Failed to transcribe audio' }, { status: 500 });
  }
}
