'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { FormattedNote, SavedNote } from '@/types';
import { saveNote, loadNotes, deleteNote } from '@/lib/storage';

export default function Dashboard() {
  const [notes, setNotes] = useState('');
  const [result, setResult] = useState<FormattedNote | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedNotes, setSavedNotes] = useState<SavedNote[]>([]);
  const [toast, setToast] = useState<string | null>(null);
  const [selectedNote, setSelectedNote] = useState<SavedNote | null>(null);
  const [activeTab, setActiveTab] = useState<'format' | 'saved'>('format');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const notes = loadNotes();
    setSavedNotes(Array.isArray(notes) ? notes : []);
  }, []);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach(track => track.stop());
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        await transcribeAudio(audioBlob);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      timerRef.current = setInterval(() => setRecordingTime(t => t + 1), 1000);
      setToast('Recording... Speak now');
    } catch {
      setToast('Microphone access denied');
    }
  }

  function stopRecording() {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
      setToast('Transcribing...');
    }
  }

  async function transcribeAudio(audioBlob: Blob) {
    const formData = new FormData();
    formData.append('audio', audioBlob);
    try {
      const res = await fetch('/api/transcribe', { method: 'POST', body: formData });
      const data = await res.json();
      if (data.text) {
        setNotes(prev => prev ? `${prev} ${data.text}` : data.text);
        setToast('Transcription complete!');
      } else {
        setToast('Transcription failed');
      }
    } catch {
      setToast('Transcription error');
    }
  }

  function formatTime(seconds: number) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  }

  async function handleFormat() {
    if (!notes.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch('/api/format', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes })
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Something went wrong'); return; }
      setResult(data);
    } catch { setError('Network error. Please try again.'); }
    finally { setLoading(false); }
  }

  function handleSave() {
    if (!result) return;
    const saved = saveNote(result, notes);
    setSavedNotes([saved, ...savedNotes]);
    setResult(null);
    setNotes('');
    setToast('Requirements document saved!');
  }

  function handleDelete(id: string) {
    deleteNote(id);
    setSavedNotes(savedNotes.filter(n => n.id !== id));
    if (selectedNote?.id === id) setSelectedNote(null);
    setToast('Document deleted');
  }

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
    setToast('Copied to clipboard!');
  }

  function exportAsMarkdown() {
    if (!result) return;
    const md = generateMarkdown(result);
    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${result.taskName.replace(/\s+/g, '-').toLowerCase()}-requirements.md`;
    a.click();
    setToast('Exported as Markdown!');
  }

  function generateMarkdown(doc: FormattedNote): string {
    let md = `# ${doc.taskName}\n\n`;
    md += `**Priority:** ${doc.priority} | **Complexity:** ${doc.estimatedComplexity}\n\n`;
    md += `## Executive Summary\n${doc.summary}\n\n`;
    
    if (doc.functionalRequirements.length) {
      md += `## Functional Requirements\n\n`;
      doc.functionalRequirements.forEach(r => {
        md += `### ${r.id}: ${r.title}\n${r.description}\n\n**Acceptance Criteria:**\n`;
        r.acceptanceCriteria.forEach(c => md += `- ${c}\n`);
        md += '\n';
      });
    }
    
    if (doc.technicalRequirements.length) {
      md += `## Technical Requirements\n\n`;
      doc.technicalRequirements.forEach(r => {
        md += `### ${r.id}: ${r.title}\n${r.description}\n\n`;
      });
    }
    
    if (doc.userStories.length) {
      md += `## User Stories\n\n`;
      doc.userStories.forEach(s => {
        md += `- **${s.id}:** As a ${s.persona}, I want to ${s.action}, so that ${s.benefit}\n`;
      });
      md += '\n';
    }
    
    if (doc.unclearPoints.length) {
      md += `## Unclear Points\n\n`;
      doc.unclearPoints.forEach(u => {
        md += `### ${u.id}: ${u.issue}\n**Impact:** ${u.impact}\n**Resolution:** ${u.suggestedResolution}\n\n`;
      });
    }
    
    if (doc.questionsForStakeholder.length) {
      md += `## Questions for Stakeholder\n\n`;
      doc.questionsForStakeholder.forEach(q => {
        md += `### ${q.id}: ${q.question}\n**Context:** ${q.context}\n**Options:** ${q.options.join(', ')}\n\n`;
      });
    }
    
    if (doc.assumptions.length) {
      md += `## Assumptions\n`;
      doc.assumptions.forEach(a => md += `- ${a}\n`);
      md += '\n';
    }
    
    if (doc.outOfScope.length) {
      md += `## Out of Scope\n`;
      doc.outOfScope.forEach(o => md += `- ${o}\n`);
      md += '\n';
    }
    
    if (doc.risks.length) {
      md += `## Risks\n\n`;
      doc.risks.forEach(r => {
        md += `- **Risk:** ${r.risk}\n  **Mitigation:** ${r.mitigation}\n`;
      });
    }
    
    return md;
  }

  return (
    <div className="min-h-screen bg-[#f6f6f8]">
      <header className="fixed top-0 z-50 w-full border-b border-gray-100 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#185adc]/10 text-[#185adc]">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z"/>
              </svg>
            </div>
            <span className="text-lg font-bold tracking-tight text-[#111318]">TaskClarify</span>
          </Link>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-green-50 text-green-700 rounded-full text-xs font-medium">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              Free Plan • 5 left
            </div>
            <Link href="/pricing" className="text-sm font-medium text-[#185adc] hover:text-[#1244a8] transition">Upgrade</Link>
            <button className="text-sm text-[#636f88] hover:text-[#111318] transition">Logout</button>
          </div>
        </div>
      </header>

      <main className="pt-24 pb-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-[#111318] tracking-tight">Requirements Studio</h1>
            <p className="text-[#636f88] mt-1">Transform messy notes into professional requirements documents</p>
          </div>

          <div className="flex gap-1 p-1 bg-gray-100 rounded-xl w-fit mb-8">
            <button onClick={() => setActiveTab('format')} className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === 'format' ? 'bg-white text-[#111318] shadow-sm' : 'text-[#636f88] hover:text-[#111318]'}`}>
              New Document
            </button>
            <button onClick={() => setActiveTab('saved')} className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${activeTab === 'saved' ? 'bg-white text-[#111318] shadow-sm' : 'text-[#636f88] hover:text-[#111318]'}`}>
              Saved Documents
              {savedNotes.length > 0 && <span className="px-2 py-0.5 bg-[#185adc]/10 text-[#185adc] rounded-full text-xs">{savedNotes.length}</span>}
            </button>
          </div>

          {activeTab === 'format' ? (
            <div className="grid lg:grid-cols-5 gap-8">
              {/* Input Panel */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  <div className="p-5 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-[#185adc]/10 text-[#185adc] flex items-center justify-center">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <div>
                        <h2 className="font-semibold text-[#111318]">Input Source</h2>
                        <p className="text-sm text-[#636f88]">Meeting notes, Slack, emails, or voice</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-5">
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Paste your messy meeting notes, Slack messages, or emails here..."
                      className="w-full h-48 p-4 bg-[#f6f6f8] border-0 rounded-xl resize-none focus:ring-2 focus:ring-[#185adc]/20 focus:bg-white transition-all text-[#111318] placeholder:text-[#636f88]/60 text-sm"
                    />
                    
                    {/* Recording Controls */}
                    <div className="flex items-center gap-3 mt-4 p-3 bg-[#f6f6f8] rounded-xl">
                      <button
                        onClick={isRecording ? stopRecording : startRecording}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                          isRecording ? 'bg-red-500 text-white animate-pulse' : 'bg-white text-[#636f88] hover:text-[#185adc] border border-gray-200'
                        }`}
                      >
                        {isRecording ? (
                          <><span className="w-2 h-2 bg-white rounded-full"></span>Stop • {formatTime(recordingTime)}</>
                        ) : (
                          <><svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd"/></svg>Voice Input</>
                        )}
                      </button>
                      <span className="text-xs text-[#636f88]">{notes.length} characters</span>
                    </div>

                    <button
                      onClick={handleFormat}
                      disabled={loading || !notes.trim()}
                      className="w-full mt-4 flex items-center justify-center gap-2 px-6 py-3.5 bg-[#185adc] text-white rounded-xl font-medium hover:bg-[#1244a8] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-[#185adc]/25"
                    >
                      {loading ? (
                        <><svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Analyzing...</>
                      ) : (
                        <><svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z"/></svg>Generate Requirements Document</>
                      )}
                    </button>
                  </div>
                </div>
                {error && (
                  <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-red-700 text-sm flex items-center gap-2">
                    <svg className="w-5 h-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/></svg>
                    {error}
                  </div>
                )}
              </div>

              {/* Results Panel */}
              <div className="lg:col-span-3">
                {result ? (
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-[#185adc]/5 to-transparent">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`px-2.5 py-1 text-xs font-bold rounded-full uppercase tracking-wider ${
                              result.priority === 'HIGH' ? 'bg-red-100 text-red-700' :
                              result.priority === 'MEDIUM' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'
                            }`}>{result.priority} Priority</span>
                            <span className="px-2.5 py-1 bg-[#185adc]/10 text-[#185adc] text-xs font-bold rounded-full uppercase tracking-wider">{result.estimatedComplexity}</span>
                          </div>
                          <h2 className="text-xl font-bold text-[#111318]">{result.taskName}</h2>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={exportAsMarkdown} className="flex items-center gap-1.5 px-3 py-2 bg-white border border-gray-200 text-[#636f88] rounded-lg text-sm font-medium hover:bg-gray-50 transition">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>Export
                          </button>
                          <button onClick={handleSave} className="flex items-center gap-1.5 px-4 py-2 bg-[#111318] text-white rounded-lg text-sm font-medium hover:bg-[#111318]/90 transition">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"/></svg>Save
                          </button>
                        </div>
                      </div>
                      <p className="text-[#636f88] text-sm leading-relaxed">{result.summary}</p>
                    </div>

                    <div className="p-6 space-y-6 max-h-[65vh] overflow-y-auto">
                      {/* Functional Requirements */}
                      {result.functionalRequirements.length > 0 && (
                        <section>
                          <h3 className="text-sm font-bold text-[#111318] uppercase tracking-wider mb-4 flex items-center gap-2">
                            <span className="w-6 h-6 bg-[#185adc]/10 text-[#185adc] rounded flex items-center justify-center text-xs">📋</span>
                            Functional Requirements
                          </h3>
                          <div className="space-y-3">
                            {result.functionalRequirements.map((req) => (
                              <div key={req.id} className="p-4 bg-[#f6f6f8] rounded-xl border border-gray-100">
                                <div className="flex items-start gap-3">
                                  <span className="px-2 py-0.5 bg-[#185adc] text-white text-xs font-mono rounded">{req.id}</span>
                                  <div className="flex-1">
                                    <h4 className="font-semibold text-[#111318] mb-1">{req.title}</h4>
                                    <p className="text-sm text-[#636f88] mb-3">{req.description}</p>
                                    <div className="space-y-1">
                                      <span className="text-xs font-semibold text-[#636f88] uppercase tracking-wider">Acceptance Criteria</span>
                                      {req.acceptanceCriteria.map((c, i) => (
                                        <div key={i} className="flex items-start gap-2 text-sm text-[#111318]">
                                          <svg className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>
                                          {c}
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </section>
                      )}

                      {/* Technical Requirements */}
                      {result.technicalRequirements.length > 0 && (
                        <section>
                          <h3 className="text-sm font-bold text-[#111318] uppercase tracking-wider mb-4 flex items-center gap-2">
                            <span className="w-6 h-6 bg-purple-100 text-purple-600 rounded flex items-center justify-center text-xs">⚙️</span>
                            Technical Requirements
                          </h3>
                          <div className="space-y-2">
                            {result.technicalRequirements.map((req) => (
                              <div key={req.id} className="p-3 bg-purple-50 rounded-lg border border-purple-100">
                                <div className="flex items-start gap-2">
                                  <span className="px-2 py-0.5 bg-purple-600 text-white text-xs font-mono rounded">{req.id}</span>
                                  <div>
                                    <span className="font-medium text-purple-900">{req.title}</span>
                                    <p className="text-sm text-purple-700 mt-0.5">{req.description}</p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </section>
                      )}

                      {/* User Stories */}
                      {result.userStories.length > 0 && (
                        <section>
                          <h3 className="text-sm font-bold text-[#111318] uppercase tracking-wider mb-4 flex items-center gap-2">
                            <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded flex items-center justify-center text-xs">👤</span>
                            User Stories
                          </h3>
                          <div className="space-y-2">
                            {result.userStories.map((story) => (
                              <div key={story.id} className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                                <span className="text-xs font-mono text-blue-600 mb-1 block">{story.id}</span>
                                <p className="text-sm text-blue-900">
                                  As a <span className="font-semibold">{story.persona}</span>, I want to <span className="font-semibold">{story.action}</span>, so that <span className="font-semibold">{story.benefit}</span>
                                </p>
                              </div>
                            ))}
                          </div>
                        </section>
                      )}

                      {/* Unclear Points */}
                      {result.unclearPoints.length > 0 && (
                        <section>
                          <h3 className="text-sm font-bold text-[#111318] uppercase tracking-wider mb-4 flex items-center gap-2">
                            <span className="w-6 h-6 bg-amber-100 text-amber-600 rounded flex items-center justify-center text-xs">⚠️</span>
                            Unclear Points
                          </h3>
                          <div className="space-y-2">
                            {result.unclearPoints.map((point) => (
                              <div key={point.id} className="p-4 bg-amber-50 rounded-xl border border-amber-200">
                                <div className="flex items-start gap-2 mb-2">
                                  <span className="px-2 py-0.5 bg-amber-500 text-white text-xs font-mono rounded">{point.id}</span>
                                  <span className="font-semibold text-amber-900">{point.issue}</span>
                                </div>
                                <div className="grid grid-cols-2 gap-3 text-sm">
                                  <div><span className="text-xs font-semibold text-amber-700 uppercase">Impact</span><p className="text-amber-800">{point.impact}</p></div>
                                  <div><span className="text-xs font-semibold text-amber-700 uppercase">Resolution</span><p className="text-amber-800">{point.suggestedResolution}</p></div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </section>
                      )}

                      {/* Questions */}
                      {result.questionsForStakeholder.length > 0 && (
                        <section>
                          <h3 className="text-sm font-bold text-[#111318] uppercase tracking-wider mb-4 flex items-center gap-2">
                            <span className="w-6 h-6 bg-[#185adc]/10 text-[#185adc] rounded flex items-center justify-center text-xs">❓</span>
                            Questions for Stakeholder
                          </h3>
                          <div className="space-y-3">
                            {result.questionsForStakeholder.map((q) => (
                              <div key={q.id} className="p-4 bg-[#185adc]/5 rounded-xl border border-[#185adc]/10">
                                <div className="flex items-start gap-2 mb-2">
                                  <span className="px-2 py-0.5 bg-[#185adc] text-white text-xs font-mono rounded">{q.id}</span>
                                  <span className="font-semibold text-[#185adc]">{q.question}</span>
                                </div>
                                <p className="text-sm text-[#636f88] mb-2">{q.context}</p>
                                {q.options.length > 0 && (
                                  <div className="flex flex-wrap gap-2">
                                    {q.options.map((opt, i) => (
                                      <span key={i} className="px-2 py-1 bg-white text-[#185adc] text-xs rounded border border-[#185adc]/20">{opt}</span>
                                    ))}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </section>
                      )}

                      {/* Bottom sections */}
                      <div className="grid md:grid-cols-3 gap-4">
                        {result.assumptions.length > 0 && (
                          <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                            <h4 className="text-xs font-bold text-[#636f88] uppercase tracking-wider mb-3">Assumptions</h4>
                            <ul className="space-y-1.5">{result.assumptions.map((a, i) => <li key={i} className="text-sm text-[#111318] flex items-start gap-2"><span className="text-gray-400 mt-1">•</span>{a}</li>)}</ul>
                          </div>
                        )}
                        {result.outOfScope.length > 0 && (
                          <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                            <h4 className="text-xs font-bold text-[#636f88] uppercase tracking-wider mb-3">Out of Scope</h4>
                            <ul className="space-y-1.5">{result.outOfScope.map((o, i) => <li key={i} className="text-sm text-[#111318] flex items-start gap-2"><span className="text-red-400 mt-1">✕</span>{o}</li>)}</ul>
                          </div>
                        )}
                        {result.dependencies.length > 0 && (
                          <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                            <h4 className="text-xs font-bold text-[#636f88] uppercase tracking-wider mb-3">Dependencies</h4>
                            <ul className="space-y-1.5">{result.dependencies.map((d, i) => <li key={i} className="text-sm text-[#111318] flex items-start gap-2"><span className="text-[#185adc] mt-1">→</span>{d}</li>)}</ul>
                          </div>
                        )}
                      </div>

                      {/* Risks */}
                      {result.risks.length > 0 && (
                        <section>
                          <h3 className="text-sm font-bold text-[#111318] uppercase tracking-wider mb-4 flex items-center gap-2">
                            <span className="w-6 h-6 bg-red-100 text-red-600 rounded flex items-center justify-center text-xs">🚨</span>
                            Risks & Mitigations
                          </h3>
                          <div className="space-y-2">
                            {result.risks.map((r, i) => (
                              <div key={i} className="p-3 bg-red-50 rounded-lg border border-red-100">
                                <span className="font-medium text-red-900">{r.risk}</span>
                                <p className="text-sm text-red-700 mt-1"><span className="font-semibold">Mitigation:</span> {r.mitigation}</p>
                              </div>
                            ))}
                          </div>
                        </section>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-16 text-center">
                    <div className="w-20 h-20 bg-[#f6f6f8] rounded-2xl flex items-center justify-center mx-auto mb-6">
                      <svg className="w-10 h-10 text-[#636f88]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                      </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-[#111318] mb-2">No Document Generated</h3>
                    <p className="text-[#636f88] max-w-md mx-auto">Paste your meeting notes or use voice input, then click "Generate Requirements Document"</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <SavedDocumentsGrid notes={savedNotes} onSelect={setSelectedNote} onDelete={handleDelete} />
          )}
        </div>
      </main>

      {/* Modal */}
      {selectedNote && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={() => setSelectedNote(null)}>
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-[#185adc]/5 to-transparent flex-shrink-0">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${selectedNote.priority === 'HIGH' ? 'bg-red-100 text-red-700' : selectedNote.priority === 'MEDIUM' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>{selectedNote.priority}</span>
                    <span className="text-xs text-[#636f88]">{new Date(selectedNote.createdAt).toLocaleDateString()}</span>
                  </div>
                  <h2 className="text-xl font-bold text-[#111318]">{selectedNote.taskName}</h2>
                </div>
                <button onClick={() => setSelectedNote(null)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-[#636f88]">✕</button>
              </div>
              <p className="text-sm text-[#636f88] mt-2">{selectedNote.summary}</p>
            </div>
            <div className="p-6 overflow-y-auto flex-1 space-y-4">
              {selectedNote.functionalRequirements.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-[#636f88] uppercase mb-2">Functional Requirements</h4>
                  {selectedNote.functionalRequirements.map(r => (
                    <div key={r.id} className="p-3 bg-[#f6f6f8] rounded-lg mb-2">
                      <span className="text-xs font-mono text-[#185adc]">{r.id}</span>
                      <p className="font-medium text-[#111318]">{r.title}</p>
                      <p className="text-sm text-[#636f88]">{r.description}</p>
                      {r.acceptanceCriteria.length > 0 && (
                        <div className="mt-2 space-y-1">
                          <span className="text-xs text-[#636f88]">Acceptance Criteria:</span>
                          {r.acceptanceCriteria.map((c, i) => (
                            <p key={i} className="text-xs text-[#111318] flex items-start gap-1"><span className="text-green-500">✓</span>{c}</p>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
              {selectedNote.technicalRequirements.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-[#636f88] uppercase mb-2">Technical Requirements</h4>
                  {selectedNote.technicalRequirements.map(r => (
                    <div key={r.id} className="p-3 bg-purple-50 rounded-lg mb-2">
                      <span className="text-xs font-mono text-purple-600">{r.id}</span>
                      <p className="font-medium text-purple-900">{r.title}</p>
                      <p className="text-sm text-purple-700">{r.description}</p>
                    </div>
                  ))}
                </div>
              )}
              {selectedNote.userStories.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-[#636f88] uppercase mb-2">User Stories</h4>
                  {selectedNote.userStories.map(s => (
                    <div key={s.id} className="p-3 bg-blue-50 rounded-lg mb-2">
                      <span className="text-xs font-mono text-blue-600">{s.id}</span>
                      <p className="text-sm text-blue-900">As a <strong>{s.persona}</strong>, I want to <strong>{s.action}</strong>, so that <strong>{s.benefit}</strong></p>
                    </div>
                  ))}
                </div>
              )}
              {selectedNote.unclearPoints.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-[#636f88] uppercase mb-2">Unclear Points</h4>
                  {selectedNote.unclearPoints.map(u => (
                    <div key={u.id} className="p-3 bg-amber-50 rounded-lg mb-2">
                      <span className="text-xs font-mono text-amber-600">{u.id}</span>
                      <p className="font-medium text-amber-900">{u.issue}</p>
                      <p className="text-sm text-amber-700"><strong>Impact:</strong> {u.impact}</p>
                      <p className="text-sm text-amber-700"><strong>Resolution:</strong> {u.suggestedResolution}</p>
                    </div>
                  ))}
                </div>
              )}
              {selectedNote.questionsForStakeholder.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-[#636f88] uppercase mb-2">Questions for Stakeholder</h4>
                  {selectedNote.questionsForStakeholder.map(q => (
                    <div key={q.id} className="p-3 bg-[#185adc]/5 rounded-lg mb-2">
                      <span className="text-xs font-mono text-[#185adc]">{q.id}</span>
                      <p className="font-medium text-[#185adc]">{q.question}</p>
                      <p className="text-sm text-[#636f88]">{q.context}</p>
                    </div>
                  ))}
                </div>
              )}
              {selectedNote.risks.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-[#636f88] uppercase mb-2">Risks</h4>
                  {selectedNote.risks.map((r, i) => (
                    <div key={i} className="p-3 bg-red-50 rounded-lg mb-2">
                      <p className="font-medium text-red-900">{r.risk}</p>
                      <p className="text-sm text-red-700"><strong>Mitigation:</strong> {r.mitigation}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 px-4 py-3 bg-[#111318] text-white rounded-xl shadow-lg flex items-center gap-2 z-50">
          <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/></svg>
          {toast}
        </div>
      )}
    </div>
  );
}

function SavedDocumentsGrid({ notes, onSelect, onDelete }: { notes: SavedNote[]; onSelect: (note: SavedNote) => void; onDelete: (id: string) => void; }) {
  if (notes.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-16 text-center">
        <div className="w-20 h-20 bg-[#f6f6f8] rounded-2xl flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-[#636f88]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"/></svg>
        </div>
        <h3 className="text-xl font-semibold text-[#111318] mb-2">No Saved Documents</h3>
        <p className="text-[#636f88] max-w-md mx-auto">Generate and save requirements documents to build your library.</p>
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
      {notes.map(note => (
        <div key={note.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md hover:border-gray-200 transition-all cursor-pointer group" onClick={() => onSelect(note)}>
          <div className="flex justify-between items-start mb-3">
            <div className="flex items-center gap-2">
              <span className={`px-2 py-0.5 text-xs font-bold rounded ${note.priority === 'HIGH' ? 'bg-red-100 text-red-700' : note.priority === 'MEDIUM' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>{note.priority}</span>
              <span className="text-xs text-[#636f88]">{new Date(note.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
            </div>
            <button onClick={(e) => { e.stopPropagation(); onDelete(note.id); }} className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all">✕</button>
          </div>
          <h3 className="font-semibold text-[#111318] mb-2 line-clamp-1">{note.taskName}</h3>
          <p className="text-sm text-[#636f88] line-clamp-2 mb-3">{note.summary}</p>
          <div className="flex gap-2 flex-wrap">
            <span className="px-2 py-1 bg-[#185adc]/10 text-[#185adc] text-xs rounded">{note.functionalRequirements.length} reqs</span>
            {note.unclearPoints.length > 0 && <span className="px-2 py-1 bg-amber-50 text-amber-700 text-xs rounded">{note.unclearPoints.length} unclear</span>}
            {note.questionsForStakeholder.length > 0 && <span className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded">{note.questionsForStakeholder.length} questions</span>}
          </div>
        </div>
      ))}
    </div>
  );
}
