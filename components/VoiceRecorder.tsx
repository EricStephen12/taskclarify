'use client';

import { useState, useRef, useEffect } from 'react';
import { Spinner } from '@/components/Spinner';

interface VoiceRecorderProps {
  onTranscriptionComplete: (text: string) => void;
}

export function VoiceRecorder({ onTranscriptionComplete }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [permissionGranted, setPermissionGranted] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Request microphone permission on mount
  useEffect(() => {
    checkMicrophonePermission();
  }, []);

  const checkMicrophonePermission = async () => {
    try {
      const permissionStatus = await navigator.permissions.query({ name: 'microphone' as PermissionName });
      if (permissionStatus.state === 'granted') {
        setPermissionGranted(true);
      }
    } catch (err) {
      // Permission API not supported in some browsers
      setPermissionGranted(true);
    }
  };

  const startRecording = async () => {
    setError(null);
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setPermissionGranted(true);
      
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        setIsProcessing(true);
        try {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          await transcribeAudio(audioBlob);
        } catch (err) {
          setError('Failed to process audio');
          setIsProcessing(false);
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      setError('Microphone access denied. Please enable microphone permissions.');
      setPermissionGranted(false);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      // Stop all tracks to release microphone
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
  };

  const transcribeAudio = async (audioBlob: Blob) => {
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.webm');

      const response = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Transcription failed');
      }

      const { text } = await response.json();
      onTranscriptionComplete(text);
    } catch (err) {
      setError('Failed to transcribe audio');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      {error && (
        <div className="text-red-500 text-sm bg-red-500/10 px-3 py-2 rounded-lg">
          {error}
        </div>
      )}
      
      <div className="flex items-center gap-4">
        {!isRecording ? (
          <button
            onClick={startRecording}
            disabled={!permissionGranted || isProcessing}
            className={`flex items-center justify-center w-12 h-12 rounded-full ${
              permissionGranted 
                ? 'bg-red-500 hover:bg-red-600' 
                : 'bg-gray-300 cursor-not-allowed'
            } transition-colors`}
          >
            <span className="text-white">
              {permissionGranted ? '🎤' : '🔒'}
            </span>
          </button>
        ) : (
          <button
            onClick={stopRecording}
            className="flex items-center justify-center w-12 h-12 rounded-full bg-red-600 hover:bg-red-700 transition-colors animate-pulse"
          >
            <span className="w-4 h-4 bg-white rounded-sm"></span>
          </button>
        )}
        
        {isProcessing && (
          <div className="flex items-center gap-2 text-gray-600">
            <Spinner className="h-5 w-5" />
            <span>Transcribing...</span>
          </div>
        )}
      </div>
      
      {!permissionGranted && (
        <p className="text-sm text-gray-600 text-center">
          Microphone permission required for voice recording
        </p>
      )}
      
      {isRecording && (
        <div className="flex items-center gap-2 text-red-500">
          <span className="flex h-2 w-2 rounded-full bg-red-500 animate-pulse"></span>
          <span className="text-sm font-medium">Recording...</span>
        </div>
      )}
    </div>
  );
}