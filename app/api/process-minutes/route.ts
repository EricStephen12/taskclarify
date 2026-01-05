import { NextRequest } from 'next/server';
import { MeetingMinutes, DiscussionPoint, MeetingActionItem } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const { transcript } = await req.json();
    
    if (!transcript || typeof transcript !== 'string') {
      return Response.json({ error: 'Invalid transcript: expected a string' }, { status: 400 });
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      // Fallback to basic format if no API key
      return Response.json({ 
        minutes: generateBasicMinutes(transcript),
        structured: null
      });
    }

    const { systemPrompt, userPrompt } = buildMinutesPrompt(transcript);

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.5,
        max_tokens: 4000
      })
    });

    if (!response.ok) {
      return Response.json({ error: 'AI API request failed' }, { status: 500 });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    if (!content) {
      return Response.json({ error: 'Empty response from AI' }, { status: 500 });
    }

    const { minutes, structured } = parseMinutesResponse(content, transcript);
    return Response.json({ minutes, structured });
  } catch (error) {
    console.error('Error processing meeting minutes:', error);
    return Response.json({ error: 'Failed to process meeting minutes' }, { status: 500 });
  }
}

function buildMinutesPrompt(transcript: string): { systemPrompt: string; userPrompt: string } {
  return {
    systemPrompt: `You are an expert meeting minutes assistant. Your job is to extract structured, actionable information from meeting transcripts.

CRITICAL RULES:
- Extract EVERY action item mentioned, even implied ones
- SMART OWNER ASSIGNMENT: 
  - If someone says "I'll do X" or "John will do X" → assign to that person
  - If someone raises a topic/problem, they likely own the follow-up action
  - If it's a team decision, assign to "Team" not "[Unassigned]"
  - Only use "[Unassigned]" if truly unclear who should own it
- SPECIFIC DEADLINES:
  - Convert vague terms: "soon" → "Within 3 days", "ASAP" → "Within 24 hours", "next week" → actual date
  - "Before next meeting" → "By next meeting (suggest scheduling)"
  - If no deadline mentioned but urgent, suggest "Within 1 week"
- Identify key decisions made during the meeting
- List all attendees/participants mentioned by name
- Summarize discussion points with context
- Be specific - never use "[to be determined]" if information exists in the transcript

Return ONLY valid JSON, no markdown or extra text.`,
    userPrompt: `Extract structured meeting minutes from this transcript:

"${transcript}"

Return JSON in this EXACT format:
{
  "title": "Meeting title based on main topic discussed",
  "date": "${new Date().toISOString().split('T')[0]}",
  "attendees": ["Name1", "Name2"],
  "agendaItems": ["Topic 1", "Topic 2"],
  "discussionPoints": [
    {
      "topic": "What was discussed",
      "summary": "Key points and context",
      "participants": ["Who contributed"]
    }
  ],
  "actionItems": [
    {
      "task": "Specific action to take",
      "owner": "Person responsible (infer from context, use 'Team' for group tasks)",
      "deadline": "Specific deadline (convert vague terms to concrete timeframes)",
      "priority": "high|medium|low"
    }
  ],
  "decisions": ["Decision 1 that was made", "Decision 2"],
  "nextSteps": ["Follow-up item 1", "Follow-up item 2"],
  "keyTakeaways": ["Important point 1", "Important point 2"],
  "nextMeetingDate": "Suggested follow-up date if actions have deadlines"
}

OWNER INFERENCE RULES:
- Person who raised the issue → likely owner of investigation/research tasks
- Person with relevant expertise mentioned → owner of technical tasks  
- "We need to..." or "Let's..." → assign to "Team" or meeting organizer
- Budget/cost tasks → assign to person who mentioned budget concerns

DEADLINE CONVERSION:
- "soon" / "quickly" → "Within 3 days"
- "ASAP" / "urgent" → "Within 24 hours"  
- "next week" → "${getNextWeekDate()}"
- "end of month" → "${getEndOfMonthDate()}"
- "before next meeting" → "By next meeting"
- No deadline but high priority → "Within 1 week"

Extract ALL action items with smart owner assignment!`
  };
}

function getNextWeekDate(): string {
  const date = new Date();
  date.setDate(date.getDate() + 7);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function getEndOfMonthDate(): string {
  const date = new Date();
  date.setMonth(date.getMonth() + 1, 0);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function parseMinutesResponse(content: string, originalTranscript: string): { minutes: string; structured: MeetingMinutes } {
  let cleaned = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  
  const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('No JSON found in response');
  }
  
  const parsed = JSON.parse(jsonMatch[0]);
  
  // Build structured MeetingMinutes object
  const structured: MeetingMinutes = {
    id: `minutes-${Date.now()}`,
    title: parsed.title || 'Meeting Minutes',
    date: parsed.date || new Date().toISOString(),
    attendees: parsed.attendees || [],
    agendaItems: parsed.agendaItems || [],
    discussionPoints: (parsed.discussionPoints || []).map((dp: DiscussionPoint) => ({
      topic: dp.topic || '',
      summary: dp.summary || '',
      participants: dp.participants || []
    })),
    actionItems: (parsed.actionItems || []).map((ai: MeetingActionItem & { priority?: string; deadline?: string }, idx: number) => ({
      id: `action-${idx + 1}`,
      task: ai.task || '',
      owner: ai.owner || '[Unassigned]',
      deadline: ai.deadline || undefined,
      status: 'pending' as const,
      priority: ai.priority || 'medium'
    })),
    decisions: parsed.decisions || [],
    nextSteps: parsed.nextSteps || [],
    rawTranscript: originalTranscript,
    createdAt: new Date().toISOString()
  };
  
  // Generate formatted markdown minutes
  const minutes = generateFormattedMinutes(structured, parsed.keyTakeaways || [], parsed.nextMeetingDate);
  
  return { minutes, structured };
}

function generateFormattedMinutes(data: MeetingMinutes, keyTakeaways: string[], nextMeetingDate?: string): string {
  let md = `# ${data.title}\n\n`;
  md += `📅 **Date:** ${new Date(data.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}\n\n`;
  
  if (data.attendees.length > 0) {
    md += `## 👥 Attendees\n`;
    data.attendees.forEach(a => md += `- ${a}\n`);
    md += '\n';
  }
  
  if (data.agendaItems.length > 0) {
    md += `## 📋 Agenda\n`;
    data.agendaItems.forEach((item, i) => md += `${i + 1}. ${item}\n`);
    md += '\n';
  }
  
  if (data.discussionPoints.length > 0) {
    md += `## 💬 Discussion Points\n\n`;
    data.discussionPoints.forEach(dp => {
      md += `### ${dp.topic}\n`;
      md += `${dp.summary}\n`;
      if (dp.participants.length > 0) {
        md += `*Contributors: ${dp.participants.join(', ')}*\n`;
      }
      md += '\n';
    });
  }
  
  if (data.actionItems.length > 0) {
    md += `## ✅ Action Items\n\n`;
    md += `| # | Task | Owner | Deadline | Priority | Status |\n`;
    md += `|---|------|-------|----------|----------|--------|\n`;
    data.actionItems.forEach((ai, i) => {
      const priority = (ai as MeetingActionItem & { priority?: string }).priority || 'medium';
      const priorityEmoji = priority === 'high' ? '🔴' : priority === 'medium' ? '🟡' : '🟢';
      md += `| ${i + 1} | ${ai.task} | ${ai.owner} | ${ai.deadline || '-'} | ${priorityEmoji} ${priority} | ⬜ Open |\n`;
    });
    md += '\n';
  }
  
  if (data.decisions.length > 0) {
    md += `## 🎯 Decisions Made\n`;
    data.decisions.forEach(d => md += `- ✓ ${d}\n`);
    md += '\n';
  }
  
  if (keyTakeaways.length > 0) {
    md += `## 💡 Key Takeaways\n`;
    keyTakeaways.forEach(t => md += `- ${t}\n`);
    md += '\n';
  }
  
  if (data.nextSteps.length > 0) {
    md += `## ➡️ Next Steps\n`;
    data.nextSteps.forEach((step, i) => md += `${i + 1}. ${step}\n`);
    md += '\n';
  }
  
  if (nextMeetingDate) {
    md += `## 📆 Follow-up Meeting\n`;
    md += `Suggested: ${nextMeetingDate}\n\n`;
  }
  
  md += `---\n*Minutes generated on ${new Date().toLocaleString()}*`;
  
  return md;
}

function generateBasicMinutes(transcript: string): string {
  return `# Meeting Minutes

📅 **Date:** ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}

## 💬 Discussion Summary
${transcript}

## ✅ Action Items
*Please configure GROQ_API_KEY for AI-powered action extraction*

## ➡️ Next Steps
*Please configure GROQ_API_KEY for AI-powered extraction*

---
*Minutes generated on ${new Date().toLocaleString()}*`;
}
