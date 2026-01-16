import { NextRequest, NextResponse } from 'next/server';
import { BlameProofDocs, ErrorResponse } from '@/types';
import { getAuthenticatedUser } from '../auth-helper';

export async function POST(req: NextRequest) {
  try {
    // Authentication check can be added here if needed
    // const { user } = await getAuthenticatedUser(req);

    const { input } = await req.json();
    
    if (!input || typeof input !== 'string' || input.trim() === '') {
      return NextResponse.json<ErrorResponse>(
        { error: 'Input is required' },
        { status: 400 }
      );
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return NextResponse.json<ErrorResponse>(
        { error: 'API key not configured' },
        { status: 500 }
      );
    }

    const { systemPrompt, userPrompt } = buildBlameProofPrompt(input);

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
        temperature: 0.7,
        max_tokens: 4000
      })
    });

    if (!response.ok) {
      return NextResponse.json<ErrorResponse>(
        { error: 'AI API request failed' },
        { status: 500 }
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    if (!content) {
      return NextResponse.json<ErrorResponse>(
        { error: 'Empty response from AI' },
        { status: 500 }
      );
    }

    const docs = parseBlameProofResponse(content, input);
    return NextResponse.json(docs);
  } catch {
    return NextResponse.json<ErrorResponse>(
      { error: 'Failed to generate documents' },
      { status: 500 }
    );
  }
}


function buildBlameProofPrompt(input: string): { systemPrompt: string; userPrompt: string } {
  return {
    systemPrompt: `You are a professional communication expert specializing in workplace documentation and blame-proof communication. Your job is to help users create clear, professional documentation that protects them while maintaining positive relationships.

CRITICAL RULES:
- Generate professional, non-confrontational language
- Focus on facts and timelines
- Create actionable items with clear ownership
- Maintain a collaborative tone while documenting everything
- Include specific timestamps and details
- Use placeholders like [Name], [Date], [Time], [Project Name] for customization
- Include CC line suggestions in emails
- Add "Please reply to confirm receipt" for accountability
- Include mitigation suggestions for blockers

Return ONLY valid JSON, no markdown or extra text.`,
    userPrompt: `Based on this situation, generate blame-proof documentation:

"${input}"

Analyze the situation and create:
1. A professional paper trail email with:
   - Clear subject line
   - CC line with relevant stakeholders
   - Specific placeholders: [Name], [Date], [Time], [Project Name]
   - "Please reply to confirm receipt of this email and the tasks assigned" at the end
2. A structured action plan with immediate, short-term, and long-term actions (each with owner)
3. A timeline tracker of events (use format: "Log actual timestamp when action occurs")
4. A meeting agenda if needed
5. Blockers with mitigation suggestions

Return JSON in this EXACT format:
{
  "paperTrailEmail": "Subject: [Project Name] - Task Assignment & Timeline Confirmation\\n\\nTo: [Recipient Name]\\nCC: [Manager Name], [Stakeholder Name]\\n\\nHi [Name],\\n\\nFollowing our discussion on [Date], I wanted to document the agreed tasks and timeline:\\n\\n1. [Task 1] - Owner: [Name] - Due: [Date]\\n2. [Task 2] - Owner: [Name] - Due: [Date]\\n3. [Task 3] - Owner: [Name] - Due: [Date]\\n\\nBlockers identified:\\n- [Blocker 1]\\n- [Blocker 2]\\n\\nNext steps:\\n- [Next step 1]\\n- [Next step 2]\\n\\nPlease reply to confirm receipt of this email and the tasks assigned.\\n\\nBest regards,\\n[Your Name]",
  "actionPlan": {
    "immediateActions": ["[Owner]: Action 1 - Due: Today", "[Owner]: Action 2 - Due: Tomorrow"],
    "shortTermActions": ["[Owner]: Action 1 - Due: This week", "[Owner]: Action 2 - Due: Next week"],
    "longTermActions": ["[Owner]: Action 1 - Due: This month", "[Owner]: Action 2 - Due: Next quarter"],
    "blockers": [
      { "blocker": "Blocker description", "mitigation": "How to resolve or work around" }
    ]
  },
  "timelineTracker": [
    { "timestamp": "[Date] [Time] - Log actual timestamp", "event": "What happened", "actor": "Who did it" },
    { "timestamp": "[Date] [Time] - Log actual timestamp", "event": "Next event", "actor": "Who" }
  ],
  "meetingAgenda": {
    "title": "Meeting title",
    "duration": "30 mins",
    "items": [
      { "topic": "Review current status", "duration": "5 mins", "owner": "[Name]" },
      { "topic": "Discuss blockers", "duration": "10 mins", "owner": "[Name]" },
      { "topic": "Assign action items", "duration": "10 mins", "owner": "[Name]" },
      { "topic": "Confirm next steps", "duration": "5 mins", "owner": "All" }
    ],
    "preparation": ["Review previous meeting notes", "Prepare status update", "List blockers and questions"]
  },
  "context": {
    "issue": "Brief issue description",
    "urgency": "low|medium|high|critical",
    "stakeholders": ["[Name 1]", "[Name 2]"],
    "timeline": "Timeline summary"
  }
}`
  };
}

function parseBlameProofResponse(content: string, originalInput: string): BlameProofDocs {
  let cleaned = content.replace(/\`\`\`json\n?/g, '').replace(/\`\`\`\n?/g, '').trim();
  
  const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('No JSON found in response');
  }
  
  const parsed = JSON.parse(jsonMatch[0]);
  
  return {
    paperTrailEmail: parsed.paperTrailEmail || generateFallbackEmail(originalInput),
    actionPlan: {
      immediateActions: parsed.actionPlan?.immediateActions || [],
      shortTermActions: parsed.actionPlan?.shortTermActions || [],
      longTermActions: parsed.actionPlan?.longTermActions || [],
      blockers: parsed.actionPlan?.blockers || []
    },
    timelineTracker: parsed.timelineTracker || [],
    meetingAgenda: {
      title: parsed.meetingAgenda?.title || 'Issue Discussion',
      duration: parsed.meetingAgenda?.duration || '30 mins',
      items: parsed.meetingAgenda?.items || [],
      preparation: parsed.meetingAgenda?.preparation || []
    },
    context: {
      issue: parsed.context?.issue || 'Issue reported',
      urgency: parsed.context?.urgency || 'medium',
      stakeholders: parsed.context?.stakeholders || [],
      timeline: parsed.context?.timeline || 'To be determined'
    }
  };
}

function generateFallbackEmail(input: string): string {
  return `Subject: Following up on reported issue

Hi Team,

I wanted to document our discussion regarding the following matter:

${input}

I'm currently investigating and will provide updates as I make progress.

Could you please confirm:
1. The exact details of the issue?
2. When this was first noticed?
3. Who else is affected?

Best regards`;
}
