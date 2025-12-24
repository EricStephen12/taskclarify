import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Get the audio file from the request
    const formData = await request.formData();
    const audioFile = formData.get('audio') as File;
    
    if (!audioFile) {
      return NextResponse.json(
        { error: 'No audio file provided' },
        { status: 400 }
      );
    }
    
    // Mock transcription for testing
    // In a real implementation, you would use OpenAI Whisper or another transcription service
    const mockTranscription = "This is a mock transcription of the recorded audio. In a real implementation, this would be the actual transcribed text from the audio file.";
    
    return NextResponse.json({ text: mockTranscription });
  } catch (error) {
    console.error('Transcription error:', error);
    return NextResponse.json(
      { error: 'Failed to transcribe audio' },
      { status: 500 }
    );
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
};