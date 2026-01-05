'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { SavedNote, TaskType, FormattedResult, PersonalPlanResult, SoftwareRequirementResult, DashboardTab, SOP, SavedSOP, MeetingMinutes, BlameProofDocs, ActionPlanSection, TimelineEntry, MeetingAgendaSection } from '@/types';
import { saveNoteToCloud, loadNotesFromCloud, deleteNoteFromCloud, migrateLocalNotesToCloud } from '@/lib/storage';
import { saveSOP, loadSOPs, deleteSOP, markStepComplete, snoozeReminder, rescheduleSOP, getSOPProgress, archiveSOP, markReminderTriggered } from '@/lib/sopStorage';
import { requestNotificationPermission, startReminderChecker, stopReminderChecker, formatDuration, getNextReminderTime } from '@/lib/notifications';

export default function Dashboard() {
  const [notes, setNotes] = useState('');
  const [showOverrideMenu, setShowOverrideMenu] = useState(false);
  const [result, setResult] = useState<FormattedResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedNotes, setSavedNotes] = useState<SavedNote[]>([]);
  const [toast, setToast] = useState<string | null>(null);
  const [selectedNote, setSelectedNote] = useState<SavedNote | null>(null);
  const [activeTab, setActiveTab] = useState<DashboardTab>('format');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [currentNotes, setCurrentNotes] = useState('');
  
  // Usage tracking state
  const [usage, setUsage] = useState<{ isPro: boolean; used: number; limit: number; remaining: number } | null>(null);
  
  // Blame-Proof state
  const [blameProofInput, setBlameProofInput] = useState('');
  const [blameProofOutput, setBlameProofOutput] = useState<BlameProofDocs | null>(null);
  const [blameProofLoading, setBlameProofLoading] = useState(false);
  
  // Meeting Minutes state
  const [minutesInput, setMinutesInput] = useState('');
  const [minutesOutput, setMinutesOutput] = useState<MeetingMinutes | null>(null);
  const [minutesLoading, setMinutesLoading] = useState(false);
  
  // SOP Generator state
  const [sopInput, setSopInput] = useState('');
  const [sopOutput, setSopOutput] = useState<SOP | null>(null);
  const [sopLoading, setSopLoading] = useState(false);
  const [savedSOPs, setSavedSOPs] = useState<SavedSOP[]>([]);
  const [selectedSOP, setSelectedSOP] = useState<SavedSOP | null>(null);
  const [showSaveSOPDialog, setShowSaveSOPDialog] = useState(false);
  const [sopStartTime, setSopStartTime] = useState('');
  const [activeReminder, setActiveReminder] = useState<{ sop: SavedSOP; stepId: string } | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch usage on mount
  async function fetchUsage() {
    try {
      const res = await fetch('/api/usage');
      if (res.ok) {
        const data = await res.json();
        setUsage(data);
      }
    } catch (err) {
      console.error('Failed to fetch usage:', err);
    }
  }

  useEffect(() => {
    // Load notes from cloud
    async function loadData() {
      // First migrate any local notes to cloud
      await migrateLocalNotesToCloud();
      
      // Then load from cloud
      const cloudNotes = await loadNotesFromCloud();
      setSavedNotes(Array.isArray(cloudNotes) ? cloudNotes : []);
    }
    loadData();
    
    const sops = loadSOPs();
    setSavedSOPs(Array.isArray(sops) ? sops : []);
    
    // Fetch usage
    fetchUsage();
    
    // Request notification permission
    requestNotificationPermission();
    
    // Start reminder checker
    startReminderChecker(
      () => loadSOPs(),
      {
        onReminder: (sop, step) => {
          setActiveReminder({ sop, stepId: step.id });
          setToast(`Reminder: ${step.title}`);
        }
      },
      markReminderTriggered
    );
    
    return () => stopReminderChecker();
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
        // Process the transcription for meeting minutes
        const processedText = await processMeetingMinutes(data.text);
        setNotes(prev => prev ? `${prev} ${processedText}` : processedText);
        setToast('Meeting minutes processed!');
      } else {
        setToast('Transcription failed');
      }
    } catch {
      setToast('Transcription error');
    }
  }
  
  async function processMeetingMinutes(transcript: string) {
    // Send the transcript to our API for processing into meeting minutes
    try {
      const res = await fetch('/api/process-minutes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript })
      });
      
      const data = await res.json();
      
      if (res.ok) {
        return data.minutes || transcript; // Return processed minutes or original if processing failed
      } else {
        // If processing fails, return original transcript
        return transcript;
      }
    } catch (error) {
      console.error('Error processing meeting minutes:', error);
      return transcript; // Return original if API call fails
    }
  }

  function formatTime(seconds: number) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  }

  async function handleFormat(taskTypeOverride?: TaskType) {
    const notesToProcess = taskTypeOverride ? currentNotes : notes;
    if (!notesToProcess.trim()) return;
    setLoading(true);
    setError(null);
    if (!taskTypeOverride) {
      setResult(null);
      setCurrentNotes(notes); // Store for potential override
    }

    try {
      // Check usage limit first (only for new formats, not overrides)
      if (!taskTypeOverride) {
        const usageRes = await fetch('/api/usage', { method: 'POST' });
        const usageData = await usageRes.json();
        
        if (!usageRes.ok) {
          if (usageData.limitReached) {
            setError('You\'ve used all 5 free formats this month. Upgrade to Pro for unlimited access!');
            setLoading(false);
            return;
          }
          setError(usageData.error || 'Failed to check usage');
          setLoading(false);
          return;
        }
        
        // Update usage state
        if (usageData.used !== undefined) {
          setUsage(prev => prev ? { ...prev, used: usageData.used, remaining: usageData.remaining } : null);
        }
      }

      const res = await fetch('/api/format', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          notes: notesToProcess, 
          taskType: taskTypeOverride // Only send if override
        })
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Something went wrong'); return; }
      setResult(data);
      setShowOverrideMenu(false);
      
      // Refresh usage after successful format
      fetchUsage();
      
      if (taskTypeOverride) {
        const taskTypeLabel = taskTypeOverride === 'personal' ? 'Personal Plan' :
                           taskTypeOverride === 'software' ? 'Software Requirement' :
                           taskTypeOverride === 'business' ? 'Business Task' :
                           taskTypeOverride === 'marketing' ? 'Marketing Campaign' : 'Financial Planning';
        setToast(`Reprocessed as ${taskTypeLabel}`);
      }
    } catch { setError('Network error. Please try again.'); }
    finally { setLoading(false); }
  }

  async function handleSave() {
    if (!result) return;
    const saved = await saveNoteToCloud(result, notes);
    if (saved) {
      setSavedNotes([saved, ...savedNotes]);
      setResult(null);
      setNotes('');
      setToast('Requirements document saved!');
    } else {
      setToast('Failed to save document');
    }
  }

  async function handleDelete(id: string) {
    const success = await deleteNoteFromCloud(id);
    if (success) {
      setSavedNotes(savedNotes.filter(n => n.id !== id));
      if (selectedNote?.id === id) setSelectedNote(null);
      setToast('Document deleted');
    } else {
      setToast('Failed to delete document');
    }
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
  
  async function handleGenerateBlameProofDocs() {
    if (!blameProofInput.trim()) return;
    
    setBlameProofLoading(true);
    setError(null);
    
    try {
      // Call the API to generate blame-proof documents
      const res = await fetch('/api/generate-blameproof-docs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input: blameProofInput })
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        setError(data.error || 'Something went wrong');
        return;
      }
      
      setBlameProofOutput(data);
      setToast('Blame-proof documents generated!');
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setBlameProofLoading(false);
    }
  }
  
  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
    setToast('Copied to clipboard!');
  }
  
  function formatActionPlan(actionPlan: ActionPlanSection): string {
    let result = '';
    if (actionPlan.immediateActions?.length > 0) {
      result += '🚨 IMMEDIATE ACTIONS:\n' + actionPlan.immediateActions.map(a => `• ${a}`).join('\n') + '\n\n';
    }
    if (actionPlan.shortTermActions?.length > 0) {
      result += '📅 SHORT-TERM ACTIONS:\n' + actionPlan.shortTermActions.map(a => `• ${a}`).join('\n') + '\n\n';
    }
    if (actionPlan.longTermActions?.length > 0) {
      result += '🎯 LONG-TERM ACTIONS:\n' + actionPlan.longTermActions.map(a => `• ${a}`).join('\n') + '\n\n';
    }
    if (actionPlan.blockers?.length > 0) {
      result += '⚠️ BLOCKERS:\n' + actionPlan.blockers.map(b => `• ${b.blocker}${b.mitigation ? ` (Mitigation: ${b.mitigation})` : ''}`).join('\n');
    }
    return result.trim();
  }
  
  function formatTimeline(timeline: TimelineEntry[]): string {
    if (!timeline?.length) return 'No timeline entries';
    return timeline.map(entry => `[${entry.timestamp}] ${entry.actor}: ${entry.event}`).join('\n');
  }
  
  function formatMeetingAgenda(agenda: MeetingAgendaSection): string {
    let result = `📋 ${agenda.title} (${agenda.duration})\n\n`;
    if (agenda.items?.length > 0) {
      result += 'AGENDA ITEMS:\n';
      agenda.items.forEach((item, i) => {
        result += `${i + 1}. ${item.topic} (${item.duration} - ${item.owner})\n`;
      });
      result += '\n';
    }
    if (agenda.preparation?.length > 0) {
      result += 'PREPARATION:\n' + agenda.preparation.map(p => `• ${p}`).join('\n');
    }
    return result.trim();
  }
  
  function exportBlameProofAsMarkdown() {
    if (!blameProofOutput) return;
    
    let md = `# Blame-Proof Documents\n\n`;
    md += `## Paper Trail Email\n\n${blameProofOutput.paperTrailEmail}\n\n`;
    md += `## Action Plan\n\n${formatActionPlan(blameProofOutput.actionPlan)}\n\n`;
    md += `## Timeline Tracker\n\n${formatTimeline(blameProofOutput.timelineTracker)}\n\n`;
    md += `## Meeting Agenda\n\n${formatMeetingAgenda(blameProofOutput.meetingAgenda)}\n\n`;
    
    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'blame-proof-documents.md';
    a.click();
    setToast('Exported as Markdown!');
  }

  function generateMarkdown(doc: FormattedResult): string {
    let md = `# ${doc.taskName}\n\n`;
    
    if (doc.detectedType === 'personal') {
      const personalDoc = doc as PersonalPlanResult;
      md += `## Summary\n${personalDoc.summary}\n\n`;
      
      if (personalDoc.budget) {
        md += `## Budget Breakdown\n`;
        md += `**Total:** ${personalDoc.budget.currency} ${personalDoc.budget.total.toLocaleString()}\n\n`;
        personalDoc.budget.categories.forEach(cat => {
          md += `### ${cat.name} (${personalDoc.budget!.currency} ${cat.allocated.toLocaleString()})\n`;
          cat.items.forEach(item => {
            md += `- ${item.name}: ${personalDoc.budget!.currency} ${item.amount.toLocaleString()}`;
            if (item.quantity) md += ` x${item.quantity}`;
            if (item.notes) md += ` - ${item.notes}`;
            md += '\n';
          });
          md += '\n';
        });
        if (personalDoc.budget.remaining) {
          md += `**Remaining:** ${personalDoc.budget.currency} ${personalDoc.budget.remaining.toLocaleString()}\n\n`;
        }
      }
      
      if (personalDoc.executionSteps.length) {
        md += `## Execution Steps\n\n`;
        personalDoc.executionSteps.forEach(step => {
          md += `### Step ${step.id}: ${step.action}\n`;
          md += `${step.details}\n`;
          if (step.location) md += `**Location:** ${step.location}\n`;
          if (step.tips?.length) {
            md += `**Tips:**\n`;
            step.tips.forEach(tip => md += `- ${tip}\n`);
          }
          md += '\n';
        });
      }
      
      if (personalDoc.constraints.length) {
        md += `## Constraints\n`;
        personalDoc.constraints.forEach(c => md += `- ${c}\n`);
        md += '\n';
      }
      
      if (personalDoc.checkpoints.length) {
        md += `## Checkpoints\n`;
        personalDoc.checkpoints.forEach(c => md += `- ${c}\n`);
        md += '\n';
      }
      
      if (personalDoc.timeline) {
        md += `## Timeline\n${personalDoc.timeline}\n\n`;
      }
      
      if (personalDoc.risks.length) {
        md += `## Risks\n\n`;
        personalDoc.risks.forEach(r => {
          md += `- **Risk:** ${r.risk}\n  **Mitigation:** ${r.mitigation}\n`;
        });
      }
      
      return md;
    }
    
    // Software Requirement format
    const softwareDoc = doc as SoftwareRequirementResult;
    md += `**Priority:** ${softwareDoc.priority} | **Complexity:** ${softwareDoc.estimatedComplexity}\n\n`;
    md += `## Executive Summary\n${softwareDoc.summary}\n\n`;
    
    if (softwareDoc.functionalRequirements.length) {
      md += `## Functional Requirements\n\n`;
      softwareDoc.functionalRequirements.forEach(r => {
        md += `### ${r.id}: ${r.title}
${r.description}

**Acceptance Criteria:**
`;
        r.acceptanceCriteria.forEach(c => md += `- ${c}\n`);
        md += '\n';
      });
    }
    
    if (softwareDoc.technicalRequirements.length) {
      md += `## Technical Requirements\n\n`;
      softwareDoc.technicalRequirements.forEach(r => {
        md += `### ${r.id}: ${r.title}\n${r.description}\n\n`;
      });
    }
    
    if (softwareDoc.userStories.length) {
      md += `## User Stories\n\n`;
      softwareDoc.userStories.forEach(s => {
        md += `- **${s.id}:** As a ${s.persona}, I want to ${s.action}, so that ${s.benefit}\n`;
      });
      md += '\n';
    }
    
    if (softwareDoc.unclearPoints.length) {
      md += `## Unclear Points\n\n`;
      softwareDoc.unclearPoints.forEach(u => {
        md += `### ${u.id}: ${u.issue}
**Impact:** ${u.impact}
**Resolution:** ${u.suggestedResolution}

`;
      });
    }
    
    if (softwareDoc.questionsForStakeholder.length) {
      md += `## Questions for Stakeholder\n\n`;
      softwareDoc.questionsForStakeholder.forEach(q => {
        md += `### ${q.id}: ${q.question}
**Context:** ${q.context}
**Options:** ${q.options.join(', ')}

`;
      });
    }
    
    if (softwareDoc.assumptions.length) {
      md += `## Assumptions\n`;
      softwareDoc.assumptions.forEach(a => md += `- ${a}\n`);
      md += '\n';
    }
    
    if (softwareDoc.outOfScope.length) {
      md += `## Out of Scope\n`;
      softwareDoc.outOfScope.forEach(o => md += `- ${o}\n`);
      md += '\n';
    }
    
    if (softwareDoc.risks.length) {
      md += `## Risks\n\n`;
      softwareDoc.risks.forEach(r => {
        md += `- **Risk:** ${r.risk}\n  **Mitigation:** ${r.mitigation}\n`;
      });
    }
    
    return md;
  }

  return (
    <div className="min-h-screen bg-[#f6f6f8] overflow-x-hidden">
      <header className="fixed top-0 z-50 w-full border-b border-gray-100 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#185adc]/10 text-[#185adc]">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z"/>
              </svg>
            </div>
            <span className="text-lg font-bold tracking-tight text-[#111318]">TaskClarify</span>
          </Link>
          <div className="flex items-center gap-2 sm:gap-4">
            {usage && (
              <div className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${
                usage.isPro 
                  ? 'bg-purple-50 text-purple-700' 
                  : usage.remaining > 0 
                    ? 'bg-green-50 text-green-700' 
                    : 'bg-red-50 text-red-700'
              }`}>
                <span className={`w-2 h-2 rounded-full ${
                  usage.isPro 
                    ? 'bg-purple-500' 
                    : usage.remaining > 0 
                      ? 'bg-green-500 animate-pulse' 
                      : 'bg-red-500'
                }`}></span>
                {usage.isPro ? 'Pro Plan • Unlimited' : `Free Plan • ${usage.remaining} left`}
              </div>
            )}
            {!usage?.isPro && (
              <Link href="/pricing" className="text-sm font-medium text-[#185adc] hover:text-[#1244a8] transition">Upgrade</Link>
            )}
            <button 
              onClick={async () => {
                const { createClient } = await import('@/lib/supabase');
                const supabase = createClient();
                await supabase.auth.signOut();
                window.location.href = '/login';
              }}
              className="text-sm text-[#636f88] hover:text-[#111318] transition hidden sm:block"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="pt-20 sm:pt-24 pb-12 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-[#111318] tracking-tight">Requirements Studio</h1>
            <p className="text-[#636f88] mt-1 text-sm sm:text-base">Transform messy notes into professional requirements documents</p>
          </div>

          <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0 mb-6 sm:mb-8 scrollbar-hide">
            <div className="flex gap-2 p-1 bg-gray-100 rounded-full w-max sm:w-fit">
              <button onClick={() => setActiveTab('format')} className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-all min-h-[40px] ${activeTab === 'format' ? 'bg-white text-[#111318] shadow-sm' : 'text-[#636f88] hover:text-[#111318]'}`}>
                Clarify Tasks
              </button>
              <button onClick={() => setActiveTab('blameproof')} className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-all min-h-[40px] ${activeTab === 'blameproof' ? 'bg-white text-[#111318] shadow-sm' : 'text-[#636f88] hover:text-[#111318]'}`}>
                Blame-Proof
              </button>
              <button onClick={() => setActiveTab('minutes')} className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-all min-h-[40px] ${activeTab === 'minutes' ? 'bg-white text-[#111318] shadow-sm' : 'text-[#636f88] hover:text-[#111318]'}`}>
                Minutes
              </button>
              <button onClick={() => setActiveTab('sop')} className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-all min-h-[40px] ${activeTab === 'sop' ? 'bg-white text-[#111318] shadow-sm' : 'text-[#636f88] hover:text-[#111318]'}`}>
                SOP
              </button>
              <button onClick={() => setActiveTab('saved')} className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 min-h-[40px] ${activeTab === 'saved' ? 'bg-white text-[#111318] shadow-sm' : 'text-[#636f88] hover:text-[#111318]'}`}>
                Saved
                {(savedNotes.length + savedSOPs.length) > 0 && <span className="px-2 py-0.5 bg-[#185adc]/10 text-[#185adc] rounded-full text-xs">{savedNotes.length + savedSOPs.length}</span>}
              </button>
            </div>
          </div>

          {activeTab === 'format' ? (
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 sm:gap-8">
              {/* Input Panel */}
              <div className="lg:col-span-2 space-y-4 sm:space-y-6">
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  <div className="p-4 sm:p-5 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-[#185adc]/10 text-[#185adc] flex items-center justify-center flex-shrink-0">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <div>
                        <h2 className="font-semibold text-[#111318]">Input Source</h2>
                        <p className="text-sm text-[#636f88] hidden sm:block">Meeting notes, Slack, emails, or voice</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 sm:p-5">
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Paste your messy meeting notes, Slack messages, or emails here..."
                      className="w-full h-40 sm:h-48 p-3 sm:p-4 bg-[#f6f6f8] border-0 rounded-xl resize-none focus:ring-2 focus:ring-[#185adc]/20 focus:bg-white transition-all text-[#111318] placeholder:text-[#636f88]/60 text-sm"
                    />
                    
                    {/* Recording Controls */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mt-4 p-3 bg-[#f6f6f8] rounded-xl">
                      <button
                        onClick={isRecording ? stopRecording : startRecording}
                        className={`flex items-center justify-center gap-2 px-4 py-3 sm:py-2.5 rounded-lg text-sm font-medium transition-all min-h-[44px] ${
                          isRecording ? 'bg-red-500 text-white animate-pulse' : 'bg-white text-[#636f88] hover:text-[#185adc] border border-gray-200'
                        }`}
                      >
                        {isRecording ? (
                          <><span className="w-2 h-2 bg-white rounded-full"></span>Stop • {formatTime(recordingTime)}</>
                        ) : (
                          <><svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd"/></svg>Voice Input</>
                        )}
                      </button>
                      <span className="text-xs text-[#636f88] text-center sm:text-left">{notes.length} characters</span>
                    </div>

                    <button
                      onClick={() => handleFormat()}
                      disabled={loading || !notes.trim()}
                      className="w-full mt-4 flex items-center justify-center gap-2 px-6 py-4 sm:py-3.5 bg-[#185adc] text-white rounded-xl font-medium hover:bg-[#1244a8] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-[#185adc]/25 min-h-[44px]"
                    >
                      {loading ? (
                        <><svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Analyzing...</>
                      ) : (
                        <><svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z"/></svg>Generate Requirements Document</>
                      )}
                    </button>
                    
                    <p className="text-xs text-[#636f88] text-center mt-2">AI will automatically detect if this is a personal plan, software requirement, business task, marketing campaign, or financial planning document</p>
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
                    <div className="p-4 sm:p-6 border-b border-gray-100 bg-gradient-to-r from-[#185adc]/5 to-transparent">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
                        <div>
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            <span className={`px-2.5 py-1 text-xs font-bold rounded-full uppercase tracking-wider ${
                              result.detectedType === 'personal' ? 'bg-green-100 text-green-700' :
                              result.detectedType === 'software' ? 'bg-[#185adc]/10 text-[#185adc]' :
                              result.detectedType === 'business' ? 'bg-purple-100 text-purple-700' :
                              result.detectedType === 'marketing' ? 'bg-orange-100 text-orange-700' : 'bg-yellow-100 text-yellow-700'
                            }`}>{result.detectedType === 'personal' ? 'Personal Plan' : 
                               result.detectedType === 'software' ? 'Software Requirement' :
                               result.detectedType === 'business' ? 'Business Task' :
                               result.detectedType === 'marketing' ? 'Marketing Campaign' : 'Financial Planning'}</span>
                            
                            {/* Override Option */}
                            <div className="relative">
                              <button 
                                onClick={() => setShowOverrideMenu(!showOverrideMenu)}
                                className="text-xs text-[#636f88] hover:text-[#185adc] underline transition"
                                disabled={loading}
                              >
                                Wrong type?
                              </button>
                              {showOverrideMenu && (
                                <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[160px]">
                                  <button
                                    onClick={() => handleFormat('personal')}
                                    disabled={loading || result.detectedType === 'personal'}
                                    className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                  >
                                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                    Personal Plan
                                  </button>
                                  <button
                                    onClick={() => handleFormat('software')}
                                    disabled={loading || result.detectedType === 'software'}
                                    className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                  >
                                    <span className="w-2 h-2 bg-[#185adc] rounded-full"></span>
                                    Software Requirement
                                  </button>
                                  <button
                                    onClick={() => handleFormat('business')}
                                    disabled={loading || result.detectedType === 'business'}
                                    className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                  >
                                    <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                                    Business Task
                                  </button>
                                  <button
                                    onClick={() => handleFormat('marketing')}
                                    disabled={loading || result.detectedType === 'marketing'}
                                    className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                  >
                                    <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                                    Marketing Campaign
                                  </button>
                                  <button
                                    onClick={() => handleFormat('financial')}
                                    disabled={loading || result.detectedType === 'financial'}
                                    className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                  >
                                    <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                                    Financial Planning
                                  </button>
                                </div>
                              )}
                            </div>
                            
                            {result.detectedType === 'software' && (
                              <>
                                <span className={`px-2.5 py-1 text-xs font-bold rounded-full uppercase tracking-wider ${
                                  (result as SoftwareRequirementResult).priority === 'HIGH' ? 'bg-red-100 text-red-700' :
                                  (result as SoftwareRequirementResult).priority === 'MEDIUM' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'
                                }`}>{(result as SoftwareRequirementResult).priority} Priority</span>
                                <span className="px-2.5 py-1 bg-purple-100 text-purple-700 text-xs font-bold rounded-full uppercase tracking-wider">{(result as SoftwareRequirementResult).estimatedComplexity}</span>
                              </>
                            )}
                          </div>
                          <h2 className="text-lg sm:text-xl font-bold text-[#111318]">{result.taskName}</h2>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={exportAsMarkdown} className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2.5 sm:py-2 bg-white border border-gray-200 text-[#636f88] rounded-lg text-sm font-medium hover:bg-gray-50 transition min-h-[44px]">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>Export
                          </button>
                          <button onClick={handleSave} className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2.5 sm:py-2 bg-[#111318] text-white rounded-lg text-sm font-medium hover:bg-[#111318]/90 transition min-h-[44px]">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"/></svg>Save
                          </button>
                        </div>
                      </div>
                      <p className="text-[#636f88] text-sm leading-relaxed">{result.summary}</p>
                    </div>

                    <div className="p-4 sm:p-6 space-y-6 max-h-[60vh] sm:max-h-[65vh] overflow-y-auto">
                      {/* Personal Plan Result */}
                      {result.detectedType === 'personal' && (
                        <PersonalPlanRenderer result={result as PersonalPlanResult} />
                      )}
                      
                      {/* Software, Business, Marketing, or Financial Result */}
                      {(result.detectedType === 'software' || 
                        result.detectedType === 'business' || 
                        result.detectedType === 'marketing' || 
                        result.detectedType === 'financial') && (
                        <SoftwareRequirementRenderer result={result as any} />
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 sm:p-16 text-center">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-[#f6f6f8] rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6">
                      <svg className="w-8 h-8 sm:w-10 sm:h-10 text-[#636f88]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                      </svg>
                    </div>
                    <h3 className="text-lg sm:text-xl font-semibold text-[#111318] mb-2">No Document Generated</h3>
                    <p className="text-[#636f88] max-w-md mx-auto text-sm sm:text-base">Paste your meeting notes or use voice input, then click "Generate Requirements Document"</p>
                  </div>
                )}
              </div>
            </div>
          ) : activeTab === 'blameproof' ? (
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 sm:gap-8">
              {/* Input Panel */}
              <div className="lg:col-span-2 space-y-4 sm:space-y-6">
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  <div className="p-4 sm:p-5 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-[#e74c3c]/10 text-[#e74c3c] flex items-center justify-center flex-shrink-0">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.364 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                      </div>
                      <div>
                        <h2 className="font-semibold text-[#111318]">Blame-Proof Input</h2>
                        <p className="text-sm text-[#636f88] hidden sm:block">Paste blame/accusation/vague requests</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 sm:p-5">
                    <textarea
                      value={blameProofInput}
                      onChange={(e) => setBlameProofInput(e.target.value)}
                      placeholder={`Paste the messy blame/accusation/vague request here...

Example: "The login is broken again! We told you yesterday but you didn't fix it!"`}
                      className="w-full h-40 sm:h-48 p-3 sm:p-4 bg-[#f6f6f8] border-0 rounded-xl resize-none focus:ring-2 focus:ring-[#e74c3c]/20 focus:bg-white transition-all text-[#111318] placeholder:text-[#636f88]/60 text-sm"
                    />
                    
                    <button
                      onClick={handleGenerateBlameProofDocs}
                      disabled={blameProofLoading || !blameProofInput.trim()}
                      className="w-full mt-4 flex items-center justify-center gap-2 px-6 py-4 sm:py-3.5 bg-[#e74c3c] text-white rounded-xl font-medium hover:bg-[#c0392b] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-[#e74c3c]/25 min-h-[44px]"
                    >
                      {blameProofLoading ? (
                        <><svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Generating...</>
                      ) : (
                        <><svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z"/></svg>Generate Blame-Proof Docs</>
                      )}
                    </button>
                    
                    <p className="text-xs text-[#636f88] text-center mt-2">Creates 4 defensive documents to protect you from workplace politics</p>
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
                {blameProofOutput ? (
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="p-4 sm:p-6 border-b border-gray-100 bg-gradient-to-r from-[#e74c3c]/5 to-transparent">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <span className="px-2.5 py-1 text-xs font-bold rounded-full uppercase tracking-wider bg-red-100 text-red-700">Blame-Proof</span>
                          </div>
                          <h2 className="text-lg sm:text-xl font-bold text-[#111318]">Defensive Documents Generated</h2>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={exportBlameProofAsMarkdown} className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2.5 sm:py-2 bg-white border border-gray-200 text-[#636f88] rounded-lg text-sm font-medium hover:bg-gray-50 transition min-h-[44px]">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>Export
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 sm:p-6 space-y-6 max-h-[60vh] sm:max-h-[65vh] overflow-y-auto">
                      {/* Paper Trail Email */}
                      <section>
                        <h3 className="text-sm font-bold text-[#111318] uppercase tracking-wider mb-4 flex items-center gap-2">
                          <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded flex items-center justify-center text-xs">📧</span>
                          Paper Trail Email
                        </h3>
                        <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 whitespace-pre-wrap text-sm text-blue-900">
                          {blameProofOutput.paperTrailEmail}
                        </div>
                        <div className="mt-2 flex justify-end">
                          <button 
                            onClick={() => copyToClipboard(blameProofOutput.paperTrailEmail)}
                            className="text-xs text-blue-600 hover:text-blue-800 underline"
                          >
                            Copy to clipboard
                          </button>
                        </div>
                      </section>

                      {/* Action Plan */}
                      <section>
                        <h3 className="text-sm font-bold text-[#111318] uppercase tracking-wider mb-4 flex items-center gap-2">
                          <span className="w-6 h-6 bg-green-100 text-green-600 rounded flex items-center justify-center text-xs">📋</span>
                          Action Plan
                        </h3>
                        <div className="p-4 bg-green-50 rounded-xl border border-green-100 text-sm text-green-900 space-y-4">
                          {blameProofOutput.actionPlan.immediateActions?.length > 0 && (
                            <div>
                              <h4 className="font-semibold text-green-800 mb-2">🚨 Immediate Actions</h4>
                              <ul className="list-disc list-inside space-y-1">
                                {blameProofOutput.actionPlan.immediateActions.map((action, i) => (
                                  <li key={i}>{action}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {blameProofOutput.actionPlan.shortTermActions?.length > 0 && (
                            <div>
                              <h4 className="font-semibold text-green-800 mb-2">📅 Short-Term Actions</h4>
                              <ul className="list-disc list-inside space-y-1">
                                {blameProofOutput.actionPlan.shortTermActions.map((action, i) => (
                                  <li key={i}>{action}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {blameProofOutput.actionPlan.longTermActions?.length > 0 && (
                            <div>
                              <h4 className="font-semibold text-green-800 mb-2">🎯 Long-Term Actions</h4>
                              <ul className="list-disc list-inside space-y-1">
                                {blameProofOutput.actionPlan.longTermActions.map((action, i) => (
                                  <li key={i}>{action}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {blameProofOutput.actionPlan.blockers?.length > 0 && (
                            <div>
                              <h4 className="font-semibold text-red-700 mb-2">⚠️ Blockers</h4>
                              <ul className="list-disc list-inside space-y-2">
                                {blameProofOutput.actionPlan.blockers.map((item, i) => (
                                  <li key={i}>
                                    <span className="font-medium">{item.blocker}</span>
                                    {item.mitigation && (
                                      <div className="ml-5 text-sm text-gray-600 mt-1">
                                        💡 Mitigation: {item.mitigation}
                                      </div>
                                    )}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                        <div className="mt-2 flex justify-end">
                          <button 
                            onClick={() => copyToClipboard(formatActionPlan(blameProofOutput.actionPlan))}
                            className="text-xs text-green-600 hover:text-green-800 underline"
                          >
                            Copy to clipboard
                          </button>
                        </div>
                      </section>

                      {/* Timeline Tracker */}
                      <section>
                        <h3 className="text-sm font-bold text-[#111318] uppercase tracking-wider mb-4 flex items-center gap-2">
                          <span className="w-6 h-6 bg-purple-100 text-purple-600 rounded flex items-center justify-center text-xs">⏰</span>
                          Timeline Tracker
                        </h3>
                        <div className="p-4 bg-purple-50 rounded-xl border border-purple-100 text-sm text-purple-900">
                          {blameProofOutput.timelineTracker?.length > 0 ? (
                            <div className="space-y-2">
                              {blameProofOutput.timelineTracker.map((entry, i) => (
                                <div key={i} className="flex items-start gap-3 pb-2 border-b border-purple-100 last:border-0">
                                  <span className="text-xs font-mono text-purple-600 whitespace-nowrap">{entry.timestamp}</span>
                                  <span className="font-medium text-purple-800">{entry.actor}:</span>
                                  <span>{entry.event}</span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-purple-600 italic">No timeline entries</p>
                          )}
                        </div>
                        <div className="mt-2 flex justify-end">
                          <button 
                            onClick={() => copyToClipboard(formatTimeline(blameProofOutput.timelineTracker))}
                            className="text-xs text-purple-600 hover:text-purple-800 underline"
                          >
                            Copy to clipboard
                          </button>
                        </div>
                      </section>

                      {/* Meeting Agenda */}
                      <section>
                        <h3 className="text-sm font-bold text-[#111318] uppercase tracking-wider mb-4 flex items-center gap-2">
                          <span className="w-6 h-6 bg-amber-100 text-amber-600 rounded flex items-center justify-center text-xs">🎯</span>
                          Meeting Agenda
                        </h3>
                        <div className="p-4 bg-amber-50 rounded-xl border border-amber-100 text-sm text-amber-900 space-y-3">
                          <div className="flex justify-between items-center pb-2 border-b border-amber-200">
                            <h4 className="font-semibold text-amber-800">{blameProofOutput.meetingAgenda.title}</h4>
                            <span className="text-xs bg-amber-200 text-amber-800 px-2 py-1 rounded">{blameProofOutput.meetingAgenda.duration}</span>
                          </div>
                          {blameProofOutput.meetingAgenda.items?.length > 0 && (
                            <div>
                              <h5 className="font-medium text-amber-700 mb-2">Agenda Items:</h5>
                              <ul className="space-y-2">
                                {blameProofOutput.meetingAgenda.items.map((item, i) => (
                                  <li key={i} className="flex items-start gap-2">
                                    <span className="text-amber-500">{i + 1}.</span>
                                    <div>
                                      <span className="font-medium">{item.topic}</span>
                                      <span className="text-amber-600 text-xs ml-2">({item.duration} - {item.owner})</span>
                                    </div>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {blameProofOutput.meetingAgenda.preparation?.length > 0 && (
                            <div>
                              <h5 className="font-medium text-amber-700 mb-2">Preparation:</h5>
                              <ul className="list-disc list-inside space-y-1">
                                {blameProofOutput.meetingAgenda.preparation.map((prep, i) => (
                                  <li key={i}>{prep}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                        <div className="mt-2 flex justify-end">
                          <button 
                            onClick={() => copyToClipboard(formatMeetingAgenda(blameProofOutput.meetingAgenda))}
                            className="text-xs text-amber-600 hover:text-amber-800 underline"
                          >
                            Copy to clipboard
                          </button>
                        </div>
                      </section>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 sm:p-16 text-center">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-[#f6f6f8] rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6">
                      <svg className="w-8 h-8 sm:w-10 sm:h-10 text-[#636f88]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.364 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                    </div>
                    <h3 className="text-lg sm:text-xl font-semibold text-[#111318] mb-2">No Documents Generated</h3>
                    <p className="text-[#636f88] max-w-md mx-auto text-sm sm:text-base">Paste the messy blame/accusation/vague request, then click "Generate Blame-Proof Docs"</p>
                  </div>
                )}
              </div>
            </div>
          ) : activeTab === 'minutes' ? (
            <MeetingMinutesTab
              input={minutesInput}
              setInput={setMinutesInput}
              output={minutesOutput}
              setOutput={setMinutesOutput}
              loading={minutesLoading}
              setLoading={setMinutesLoading}
              error={error}
              setError={setError}
              setToast={setToast}
              isRecording={isRecording}
              recordingTime={recordingTime}
              startRecording={startRecording}
              stopRecording={stopRecording}
              formatTime={formatTime}
            />
          ) : activeTab === 'sop' ? (
            <SOPGeneratorTab
              input={sopInput}
              setInput={setSopInput}
              output={sopOutput}
              setOutput={setSopOutput}
              loading={sopLoading}
              setLoading={setSopLoading}
              error={error}
              setError={setError}
              setToast={setToast}
              savedSOPs={savedSOPs}
              setSavedSOPs={setSavedSOPs}
              showSaveDialog={showSaveSOPDialog}
              setShowSaveDialog={setShowSaveSOPDialog}
              startTime={sopStartTime}
              setStartTime={setSopStartTime}
              selectedSOP={selectedSOP}
              setSelectedSOP={setSelectedSOP}
            />
          ) : (
            <SavedDocumentsGrid 
              notes={savedNotes} 
              sops={savedSOPs}
              onSelectNote={setSelectedNote} 
              onDeleteNote={handleDelete}
              onSelectSOP={setSelectedSOP}
              onDeleteSOP={(id) => {
                deleteSOP(id);
                setSavedSOPs(savedSOPs.filter(s => s.id !== id));
                setToast('SOP deleted');
              }}
            />
          )}
        </div>
      </main>

      {/* Modal */}
      {selectedNote && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center sm:p-4 z-50" onClick={() => setSelectedNote(null)}>
          <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-4xl h-[90vh] sm:h-auto sm:max-h-[90vh] flex flex-col shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="p-4 sm:p-6 border-b border-gray-100 bg-gradient-to-r from-[#185adc]/5 to-transparent flex-shrink-0">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${selectedNote.priority === 'HIGH' ? 'bg-red-100 text-red-700' : selectedNote.priority === 'MEDIUM' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>{selectedNote.priority}</span>
                    <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${selectedNote.detectedType === 'personal' ? 'bg-green-100 text-green-700' :
                         selectedNote.detectedType === 'software' ? 'bg-[#185adc]/10 text-[#185adc]' :
                         selectedNote.detectedType === 'business' ? 'bg-purple-100 text-purple-700' :
                         selectedNote.detectedType === 'marketing' ? 'bg-orange-100 text-orange-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {selectedNote.detectedType === 'personal' ? 'Personal' :
                       selectedNote.detectedType === 'software' ? 'Software' :
                       selectedNote.detectedType === 'business' ? 'Business' :
                       selectedNote.detectedType === 'marketing' ? 'Marketing' : 'Financial'}</span>
                    <span className="text-xs text-[#636f88]">{new Date(selectedNote.createdAt).toLocaleDateString()}</span>
                  </div>
                  <h2 className="text-lg sm:text-xl font-bold text-[#111318]">{selectedNote.taskName}</h2>
                </div>
                <button onClick={() => setSelectedNote(null)} className="w-10 h-10 sm:w-8 sm:h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-[#636f88] min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0">✕</button>
              </div>
              <p className="text-sm text-[#636f88] mt-2">{selectedNote.summary}</p>
            </div>
            <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4">
              {/* Personal Plan specific fields */}
              {selectedNote.detectedType === 'personal' && (
                <>
                  {/* Budget */}
                  {selectedNote.budget && (
                    <div>
                      <h4 className="text-xs font-bold text-[#636f88] uppercase mb-2">Budget Breakdown</h4>
                      <div className="p-3 bg-green-50 rounded-lg mb-2">
                        <div className="flex justify-between">
                          <span className="font-medium text-green-900">Total: {selectedNote.budget.currency} {selectedNote.budget.total?.toLocaleString()}</span>
                          {selectedNote.budget.remaining !== undefined && (
                            <span className="font-medium text-green-700">Remaining: {selectedNote.budget.currency} {selectedNote.budget.remaining?.toLocaleString()}</span>
                          )}
                        </div>
                        {selectedNote.budget.categories?.map((cat, idx) => (
                          <div key={idx} className="mt-2">
                            <p className="text-sm font-medium text-green-800">{cat.name}: {selectedNote.budget!.currency} {cat.allocated?.toLocaleString()}</p>
                            {cat.items?.map((item, itemIdx) => (
                              <p key={itemIdx} className="text-xs text-green-700 ml-2">• {item.name}: {selectedNote.budget!.currency} {item.amount?.toLocaleString()} {item.quantity ? `x${item.quantity}` : ''} {item.notes ? `(${item.notes})` : ''}</p>
                            ))}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Execution Steps */}
                  {selectedNote.executionSteps && (
                    <div>
                      <h4 className="text-xs font-bold text-[#636f88] uppercase mb-2">Execution Steps</h4>
                      {selectedNote.executionSteps.map((step) => (
                        <div key={step.id} className="p-3 bg-blue-50 rounded-lg mb-2">
                          <div className="flex items-start gap-2">
                            <span className="text-xs font-bold text-blue-700">{step.id}</span>
                            <div>
                              <p className="font-medium text-blue-900">{step.action}</p>
                              <p className="text-sm text-blue-700">{step.details}</p>
                              {step.location && <p className="text-xs text-blue-600">Location: {step.location}</p>}
                              {step.tips && step.tips.length > 0 && (
                                <div>
                                  <span className="text-xs text-blue-600">Tips:</span>
                                  {step.tips.map((tip, tipIdx) => (
                                    <p key={tipIdx} className="text-xs text-blue-600 ml-2">• {tip}</p>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* Constraints */}
                  {selectedNote.constraints && (
                    <div>
                      <h4 className="text-xs font-bold text-[#636f88] uppercase mb-2">Constraints</h4>
                      {selectedNote.constraints.map((c, idx) => (
                        <p key={idx} className="p-3 bg-amber-50 rounded-lg mb-2 text-sm text-amber-800">• {c}</p>
                      ))}
                    </div>
                  )}
                  
                  {/* Checkpoints */}
                  {selectedNote.checkpoints && (
                    <div>
                      <h4 className="text-xs font-bold text-[#636f88] uppercase mb-2">Checkpoints</h4>
                      {selectedNote.checkpoints.map((c, idx) => (
                        <p key={idx} className="p-3 bg-purple-50 rounded-lg mb-2 text-sm text-purple-800">• {c}</p>
                      ))}
                    </div>
                  )}
                  
                  {/* Timeline */}
                  {selectedNote.timeline && (
                    <div>
                      <h4 className="text-xs font-bold text-[#636f88] uppercase mb-2">Timeline</h4>
                      <p className="p-3 bg-gray-50 rounded-lg text-sm text-gray-800">{selectedNote.timeline}</p>
                    </div>
                  )}
                  
                  {/* Unclear Points */}
                  {selectedNote.unclearPoints && selectedNote.unclearPoints.length > 0 && (
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
                  
                  {/* Risks */}
                  {selectedNote.risks && (
                    <div>
                      <h4 className="text-xs font-bold text-[#636f88] uppercase mb-2">Risks & Mitigations</h4>
                      {selectedNote.risks.map((r, idx) => (
                        <div key={idx} className="p-3 bg-red-50 rounded-lg mb-2">
                          <p className="font-medium text-red-900">{r.risk}</p>
                          <p className="text-sm text-red-700"><strong>Mitigation:</strong> {r.mitigation}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
              
              {/* Common fields for all types */}
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
              {selectedNote.unclearPoints && selectedNote.unclearPoints.length > 0 && (
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
                  <h4 className="text-xs font-bold text-[#636f88] uppercase mb-2">Questions</h4>
                  {selectedNote.questionsForStakeholder.map(q => (
                    <div key={q.id} className="p-3 bg-[#185adc]/5 rounded-lg mb-2">
                      <span className="text-xs font-mono text-[#185adc]">{q.id}</span>
                      <p className="font-medium text-[#185adc]">{q.question}</p>
                      <p className="text-sm text-[#636f88]">{q.context}</p>
                      {q.options.length > 0 && <p className="text-xs text-[#636f88] mt-1">Options: {q.options.join(', ')}</p>}
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
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-[#111318] text-white rounded-lg shadow-lg text-sm z-50">
          {toast}
        </div>
      )}
    </div>
  );
}

function SavedDocumentsGrid({ 
  notes, 
  sops, 
  onSelectNote, 
  onDeleteNote, 
  onSelectSOP, 
  onDeleteSOP 
}: { 
  notes: SavedNote[]; 
  sops: SavedSOP[];
  onSelectNote: (note: SavedNote) => void; 
  onDeleteNote: (id: string) => void;
  onSelectSOP: (sop: SavedSOP) => void;
  onDeleteSOP: (id: string) => void;
}) {
  if (notes.length === 0 && sops.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 sm:p-16 text-center">
        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-[#f6f6f8] rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6">
          <svg className="w-8 h-8 sm:w-10 sm:h-10 text-[#636f88]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"/>
          </svg>
        </div>
        <h3 className="text-lg sm:text-xl font-semibold text-[#111318] mb-2">No Saved Documents</h3>
        <p className="text-[#636f88] max-w-md mx-auto text-sm sm:text-base">Generate and save requirements documents to see them here</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Saved Notes */}
      {notes.length > 0 && (
        <div>
          <h3 className="text-sm font-bold text-[#636f88] uppercase tracking-wider mb-4">Saved Documents ({notes.length})</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {notes.map(note => (
              <div key={note.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 hover:shadow-md transition-shadow cursor-pointer" onClick={() => onSelectNote(note)}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex flex-wrap gap-1">
                    <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${note.priority === 'HIGH' ? 'bg-red-100 text-red-700' : note.priority === 'MEDIUM' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>{note.priority}</span>
                    <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${note.detectedType === 'personal' ? 'bg-green-100 text-green-700' :
                         note.detectedType === 'software' ? 'bg-[#185adc]/10 text-[#185adc]' :
                         note.detectedType === 'business' ? 'bg-purple-100 text-purple-700' :
                         note.detectedType === 'marketing' ? 'bg-orange-100 text-orange-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {note.detectedType === 'personal' ? 'Personal' :
                       note.detectedType === 'software' ? 'Software' :
                       note.detectedType === 'business' ? 'Business' :
                       note.detectedType === 'marketing' ? 'Marketing' : 'Financial'}
                    </span>
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); onDeleteNote(note.id); }} className="w-8 h-8 flex items-center justify-center rounded hover:bg-red-50 text-[#636f88] hover:text-red-500 transition min-h-[44px] min-w-[44px]">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                  </button>
                </div>
                <h3 className="font-semibold text-[#111318] mb-1 line-clamp-2">{note.taskName}</h3>
                <p className="text-sm text-[#636f88] line-clamp-2 mb-3">{note.summary}</p>
                <div className="flex items-center justify-between text-xs text-[#636f88]">
                  <span>{new Date(note.createdAt).toLocaleDateString()}</span>
                  <span>{note.functionalRequirements.length} requirements</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Saved SOPs */}
      {sops.length > 0 && (
        <div>
          <h3 className="text-sm font-bold text-[#636f88] uppercase tracking-wider mb-4">Saved SOPs ({sops.length})</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {sops.map(sop => (
              <div key={sop.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 hover:shadow-md transition-shadow cursor-pointer" onClick={() => onSelectSOP(sop)}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex flex-wrap gap-1">
                    <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${
                      sop.status === 'completed' ? 'bg-green-100 text-green-700' :
                      sop.status === 'in-progress' ? 'bg-blue-100 text-blue-700' :
                      sop.status === 'archived' ? 'bg-gray-100 text-gray-700' :
                      'bg-emerald-100 text-emerald-700'
                    }`}>{sop.status}</span>
                    <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-emerald-100 text-emerald-700">SOP</span>
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); onDeleteSOP(sop.id); }} className="w-8 h-8 flex items-center justify-center rounded hover:bg-red-50 text-[#636f88] hover:text-red-500 transition min-h-[44px] min-w-[44px]">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                  </button>
                </div>
                <h3 className="font-semibold text-[#111318] mb-1 line-clamp-2">{sop.name}</h3>
                <p className="text-sm text-[#636f88] line-clamp-2 mb-3">{sop.summary}</p>
                <div className="flex items-center justify-between text-xs text-[#636f88]">
                  <span>{new Date(sop.createdAt).toLocaleDateString()}</span>
                  <span>{sop.steps.length} steps • {formatDuration(sop.totalDuration)}</span>
                </div>
                {/* Progress bar */}
                <div className="mt-3">
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-emerald-500 rounded-full transition-all"
                      style={{ width: `${(sop.steps.filter(s => s.completed).length / sop.steps.length) * 100}%` }}
                    />
                  </div>
                  <p className="text-xs text-[#636f88] mt-1">{sop.steps.filter(s => s.completed).length}/{sop.steps.length} steps completed</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Personal Plan Renderer Component
function PersonalPlanRenderer({ result }: { result: PersonalPlanResult }) {
  return (
    <>
      {/* Budget Breakdown */}
      {result.budget && (
        <section>
          <h3 className="text-sm font-bold text-[#111318] uppercase tracking-wider mb-4 flex items-center gap-2">
            <span className="w-6 h-6 bg-green-100 text-green-600 rounded flex items-center justify-center text-xs">💰</span>
            Budget Breakdown
          </h3>
          <div className="p-4 bg-green-50 rounded-xl border border-green-100 mb-4">
            <div className="flex justify-between items-center mb-3">
              <span className="font-semibold text-green-900">Total Budget</span>
              <span className="text-lg font-bold text-green-700">{result.budget.currency} {result.budget.total.toLocaleString()}</span>
            </div>
            {result.budget.remaining !== undefined && (
              <div className="flex justify-between items-center text-sm">
                <span className="text-green-700">Remaining</span>
                <span className="font-medium text-green-600">{result.budget.currency} {result.budget.remaining.toLocaleString()}</span>
              </div>
            )}
          </div>
          <div className="space-y-3">
            {result.budget.categories.map((cat, idx) => (
              <div key={idx} className="p-4 bg-[#f6f6f8] rounded-xl border border-gray-100">
                <div className="flex justify-between items-center mb-3">
                  <span className="font-semibold text-[#111318]">{cat.name}</span>
                  <span className="text-sm font-medium text-[#185adc]">{result.budget!.currency} {cat.allocated.toLocaleString()}</span>
                </div>
                <div className="space-y-2">
                  {cat.items.map((item, itemIdx) => (
                    <div key={itemIdx} className="flex justify-between items-start text-sm">
                      <div className="flex-1">
                        <span className="text-[#111318]">{item.name}</span>
                        {item.quantity && <span className="text-[#636f88] ml-1">x{item.quantity}</span>}
                        {item.notes && <p className="text-xs text-[#636f88] mt-0.5">{item.notes}</p>}
                      </div>
                      <span className="text-[#636f88] ml-2">{result.budget!.currency} {item.amount.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Execution Steps */}
      {result.executionSteps.length > 0 && (
        <section>
          <h3 className="text-sm font-bold text-[#111318] uppercase tracking-wider mb-4 flex items-center gap-2">
            <span className="w-6 h-6 bg-[#185adc]/10 text-[#185adc] rounded flex items-center justify-center text-xs">📋</span>
            Execution Steps
          </h3>
          <div className="space-y-3">
            {result.executionSteps.map((step) => (
              <div key={step.id} className="p-4 bg-[#f6f6f8] rounded-xl border border-gray-100">
                <div className="flex items-start gap-3">
                  <span className="px-2.5 py-1 bg-[#185adc] text-white text-xs font-bold rounded-full">{step.id}</span>
                  <div className="flex-1">
                    <h4 className="font-semibold text-[#111318] mb-1">{step.action}</h4>
                    <p className="text-sm text-[#636f88] mb-2">{step.details}</p>
                    {step.location && (
                      <p className="text-xs text-[#185adc] flex items-center gap-1">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"/></svg>
                        {step.location}
                      </p>
                    )}
                    {step.tips && step.tips.length > 0 && (
                      <div className="mt-2 space-y-1">
                        {step.tips.map((tip, i) => (
                          <p key={i} className="text-xs text-green-700 flex items-start gap-1">
                            <span>💡</span>{tip}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Constraints */}
      {result.constraints.length > 0 && (
        <section>
          <h3 className="text-sm font-bold text-[#111318] uppercase tracking-wider mb-4 flex items-center gap-2">
            <span className="w-6 h-6 bg-amber-100 text-amber-600 rounded flex items-center justify-center text-xs">⚠️</span>
            Constraints
          </h3>
          <div className="p-4 bg-amber-50 rounded-xl border border-amber-100">
            <ul className="space-y-2">
              {result.constraints.map((c, i) => (
                <li key={i} className="text-sm text-amber-900 flex items-start gap-2">
                  <span className="text-amber-500 mt-0.5">•</span>{c}
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* Checkpoints */}
      {result.checkpoints.length > 0 && (
        <section>
          <h3 className="text-sm font-bold text-[#111318] uppercase tracking-wider mb-4 flex items-center gap-2">
            <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded flex items-center justify-center text-xs">✓</span>
            Checkpoints
          </h3>
          <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
            <ul className="space-y-2">
              {result.checkpoints.map((c, i) => (
                <li key={i} className="text-sm text-blue-900 flex items-start gap-2">
                  <svg className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>
                  {c}
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* Timeline */}
      {result.timeline && (
        <section>
          <h3 className="text-sm font-bold text-[#111318] uppercase tracking-wider mb-4 flex items-center gap-2">
            <span className="w-6 h-6 bg-purple-100 text-purple-600 rounded flex items-center justify-center text-xs">📅</span>
            Timeline
          </h3>
          <div className="p-4 bg-purple-50 rounded-xl border border-purple-100">
            <p className="text-sm text-purple-900">{result.timeline}</p>
          </div>
        </section>
      )}

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
    </>
  );
}

// Software Requirement Renderer Component
function SoftwareRequirementRenderer({ result }: { result: SoftwareRequirementResult }) {
  return (
    <>
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
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
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
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
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
    </>
  );
}

// Meeting Minutes Tab Component
function MeetingMinutesTab({
  input, setInput, output, setOutput, loading, setLoading, error, setError, setToast,
  isRecording, recordingTime, startRecording, stopRecording, formatTime
}: {
  input: string;
  setInput: (v: string) => void;
  output: MeetingMinutes | null;
  setOutput: (v: MeetingMinutes | null) => void;
  loading: boolean;
  setLoading: (v: boolean) => void;
  error: string | null;
  setError: (v: string | null) => void;
  setToast: (v: string | null) => void;
  isRecording: boolean;
  recordingTime: number;
  startRecording: () => void;
  stopRecording: () => void;
  formatTime: (s: number) => string;
}) {
  const [generatedMinutes, setGeneratedMinutes] = useState<string>('');
  
  async function handleGenerate() {
    if (!input.trim()) return;
    setLoading(true);
    setError(null);
    
    try {
      const res = await fetch('/api/process-minutes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript: input })
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Something went wrong'); return; }
      
      // Store the generated minutes text
      setGeneratedMinutes(data.minutes || '');
      
      // Use structured data from API if available, otherwise create basic object
      const minutes: MeetingMinutes = data.structured || {
        id: `minutes-${Date.now()}`,
        title: 'Meeting Minutes',
        date: new Date().toISOString(),
        attendees: [],
        agendaItems: [],
        discussionPoints: [],
        actionItems: [],
        decisions: [],
        nextSteps: [],
        rawTranscript: input,
        createdAt: new Date().toISOString()
      };
      
      setOutput(minutes);
      setToast('Meeting minutes generated!');
    } catch { setError('Network error. Please try again.'); }
    finally { setLoading(false); }
  }
  
  function copyMinutesToClipboard() {
    navigator.clipboard.writeText(generatedMinutes);
    setToast('Copied to clipboard!');
  }
  
  function exportMinutesAsMarkdown() {
    const blob = new Blob([generatedMinutes], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `meeting-minutes-${new Date().toISOString().split('T')[0]}.md`;
    a.click();
    setToast('Exported as Markdown!');
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 sm:gap-8">
      <div className="lg:col-span-2 space-y-4 sm:space-y-6">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              </div>
              <div>
                <h2 className="font-semibold text-[#111318]">Meeting Minutes</h2>
                <p className="text-sm text-[#636f88] hidden sm:block">Record or paste meeting transcript</p>
              </div>
            </div>
          </div>
          <div className="p-4 sm:p-5">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Paste your meeting transcript or use voice recording..."
              className="w-full h-40 sm:h-48 p-3 sm:p-4 bg-[#f6f6f8] border-0 rounded-xl resize-none focus:ring-2 focus:ring-indigo-500/20 focus:bg-white transition-all text-[#111318] placeholder:text-[#636f88]/60 text-sm"
            />
            
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mt-4 p-3 bg-[#f6f6f8] rounded-xl">
              <button
                onClick={isRecording ? stopRecording : startRecording}
                className={`flex items-center justify-center gap-2 px-4 py-3 sm:py-2.5 rounded-lg text-sm font-medium transition-all min-h-[44px] ${
                  isRecording ? 'bg-red-500 text-white animate-pulse' : 'bg-white text-[#636f88] hover:text-indigo-600 border border-gray-200'
                }`}
              >
                {isRecording ? (
                  <><span className="w-2 h-2 bg-white rounded-full"></span>Stop • {formatTime(recordingTime)}</>
                ) : (
                  <><svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd"/></svg>Voice Input</>
                )}
              </button>
              <span className="text-xs text-[#636f88] text-center sm:text-left">{input.length} characters</span>
            </div>

            <button
              onClick={handleGenerate}
              disabled={loading || !input.trim()}
              className="w-full mt-4 flex items-center justify-center gap-2 px-6 py-4 sm:py-3.5 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-indigo-600/25 min-h-[44px]"
            >
              {loading ? (
                <><svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Processing...</>
              ) : (
                <><svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z"/></svg>Generate Minutes</>
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

      <div className="lg:col-span-3">
        {output && generatedMinutes ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-4 sm:p-6 border-b border-gray-100 bg-gradient-to-r from-indigo-500/5 to-transparent">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div>
                  <span className="px-2.5 py-1 text-xs font-bold rounded-full uppercase tracking-wider bg-indigo-100 text-indigo-700 mb-2 inline-block">Meeting Minutes</span>
                  <h2 className="text-lg sm:text-xl font-bold text-[#111318]">Generated Minutes</h2>
                  <p className="text-sm text-[#636f88] mt-1">{new Date(output.date).toLocaleDateString()}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={copyMinutesToClipboard}
                    className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-[#636f88] hover:text-[#111318] bg-gray-100 hover:bg-gray-200 rounded-lg transition-all min-h-[44px]"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                    Copy
                  </button>
                  <button
                    onClick={exportMinutesAsMarkdown}
                    className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-all min-h-[44px]"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                    Export
                  </button>
                </div>
              </div>
            </div>
            <div className="p-4 sm:p-6">
              <div className="prose prose-sm max-w-none">
                <pre className="whitespace-pre-wrap text-sm text-[#111318] bg-[#f6f6f8] p-4 rounded-xl overflow-auto">{generatedMinutes}</pre>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 sm:p-16 text-center">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-[#f6f6f8] rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6">
              <svg className="w-8 h-8 sm:w-10 sm:h-10 text-[#636f88]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            </div>
            <h3 className="text-lg sm:text-xl font-semibold text-[#111318] mb-2">No Minutes Generated</h3>
            <p className="text-[#636f88] max-w-md mx-auto text-sm sm:text-base">Record a meeting or paste a transcript to generate structured minutes</p>
          </div>
        )}
      </div>
    </div>
  );
}


// SOP Generator Tab Component  
function SOPGeneratorTab({
  input, setInput, output, setOutput, loading, setLoading, error, setError, setToast,
  savedSOPs, setSavedSOPs, showSaveDialog, setShowSaveDialog, startTime, setStartTime,
  selectedSOP, setSelectedSOP
}: {
  input: string;
  setInput: (v: string) => void;
  output: SOP | null;
  setOutput: (v: SOP | null) => void;
  loading: boolean;
  setLoading: (v: boolean) => void;
  error: string | null;
  setError: (v: string | null) => void;
  setToast: (v: string | null) => void;
  savedSOPs: SavedSOP[];
  setSavedSOPs: (v: SavedSOP[]) => void;
  showSaveDialog: boolean;
  setShowSaveDialog: (v: boolean) => void;
  startTime: string;
  setStartTime: (v: string) => void;
  selectedSOP: SavedSOP | null;
  setSelectedSOP: (v: SavedSOP | null) => void;
}) {
  async function handleGenerate() {
    if (!input.trim()) return;
    setLoading(true);
    setError(null);
    
    try {
      const res = await fetch('/api/generate-sop', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: input })
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Something went wrong'); return; }
      setOutput(data);
      setToast('SOP generated!');
    } catch { setError('Network error. Please try again.'); }
    finally { setLoading(false); }
  }

  function handleSaveSOP() {
    if (!output || !startTime) return;
    const saved = saveSOP(output, new Date(startTime));
    setSavedSOPs([saved, ...savedSOPs]);
    setOutput(null);
    setInput('');
    setStartTime('');
    setShowSaveDialog(false);
    setToast('SOP saved with reminders!');
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 sm:gap-8">
      <div className="lg:col-span-2 space-y-4 sm:space-y-6">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
              </div>
              <div>
                <h2 className="font-semibold text-[#111318]">SOP Generator</h2>
                <p className="text-sm text-[#636f88] hidden sm:block">Create step-by-step procedures</p>
              </div>
            </div>
          </div>
          <div className="p-4 sm:p-5">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Describe the process you want to create an SOP for..."
              className="w-full h-40 sm:h-48 p-3 sm:p-4 bg-[#f6f6f8] border-0 rounded-xl resize-none focus:ring-2 focus:ring-emerald-500/20 focus:bg-white transition-all text-[#111318] placeholder:text-[#636f88]/60 text-sm"
            />
            <button
              onClick={handleGenerate}
              disabled={loading || !input.trim()}
              className="w-full mt-4 flex items-center justify-center gap-2 px-6 py-4 sm:py-3.5 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-emerald-600/25 min-h-[44px]"
            >
              {loading ? (
                <><svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>Generating...</>
              ) : (
                <><svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z"/></svg>Generate SOP</>
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

      <div className="lg:col-span-3">
        {output ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-4 sm:p-6 border-b border-gray-100 bg-gradient-to-r from-emerald-50/50 to-transparent">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
                <div>
                  <span className="px-2.5 py-1 text-xs font-bold rounded-full uppercase tracking-wider bg-emerald-100 text-emerald-700 mb-2 inline-block">SOP</span>
                  <h2 className="text-lg sm:text-xl font-bold text-[#111318]">{output.name}</h2>
                  <p className="text-sm text-[#636f88] mt-1">Total: {formatDuration(output.totalDuration)} • {output.steps.length} steps</p>
                </div>
                <button
                  onClick={() => setShowSaveDialog(true)}
                  className="flex items-center justify-center gap-1.5 px-4 py-2.5 sm:py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition min-h-[44px]"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"/></svg>
                  Save & Schedule
                </button>
              </div>
              <p className="text-sm text-[#636f88]">{output.summary}</p>
            </div>
            <div className="p-4 sm:p-6 space-y-4 max-h-[60vh] overflow-y-auto">
              {output.steps.map((step) => (
                <div key={step.id} className="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                  <div className="flex items-start gap-3">
                    <span className="w-8 h-8 bg-emerald-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">{step.stepNumber}</span>
                    <div className="flex-1">
                      <h4 className="font-semibold text-emerald-900">{step.title}</h4>
                      <p className="text-sm text-emerald-700 mt-1">{step.description}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-emerald-600">
                        <span>⏱ {formatDuration(step.estimatedDuration)}</span>
                      </div>
                      {step.tips && step.tips.length > 0 && (
                        <div className="mt-2 space-y-1">
                          {step.tips.map((tip, i) => (
                            <p key={i} className="text-xs text-emerald-600 flex items-start gap-1">
                              <span>💡</span>{tip}
                            </p>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {output.unclearPoints.length > 0 && (
                <div className="p-4 bg-amber-50 rounded-xl border border-amber-100">
                  <h4 className="font-semibold text-amber-900 mb-2">⚠️ Unclear Points</h4>
                  <ul className="space-y-1">
                    {output.unclearPoints.map((point, i) => (
                      <li key={i} className="text-sm text-amber-700">• {point}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 sm:p-16 text-center">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-[#f6f6f8] rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6">
              <svg className="w-8 h-8 sm:w-10 sm:h-10 text-[#636f88]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            </div>
            <h3 className="text-lg sm:text-xl font-semibold text-[#111318] mb-2">No SOP Generated</h3>
            <p className="text-[#636f88] max-w-md mx-auto text-sm sm:text-base">Describe a process to generate a step-by-step SOP with time estimates</p>
          </div>
        )}
      </div>

      {/* Save SOP Dialog */}
      {showSaveDialog && output && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={() => setShowSaveDialog(false)}>
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-[#111318] mb-4">Schedule SOP</h3>
            <p className="text-sm text-[#636f88] mb-4">Set a start time to receive reminders for each step.</p>
            <label className="block text-sm font-medium text-[#111318] mb-2">Start Date & Time</label>
            <input
              type="datetime-local"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowSaveDialog(false)}
                className="flex-1 px-4 py-3 border border-gray-200 text-[#636f88] rounded-xl font-medium hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveSOP}
                disabled={!startTime}
                className="flex-1 px-4 py-3 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 disabled:opacity-50"
              >
                Save & Schedule
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}