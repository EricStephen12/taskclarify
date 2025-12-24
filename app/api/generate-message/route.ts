import { NextRequest, NextResponse } from 'next/server';
import { FormattedNote } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const { formattedNote } = await request.json() as { formattedNote: FormattedNote };
    
    if (!formattedNote) {
      return NextResponse.json({ error: 'Formatted note required' }, { status: 400 });
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'API key not configured' }, { status: 500 });
    }

    // Extract requirements text from the new structure
    const requirementsText = formattedNote.functionalRequirements
      ?.map(r => r.title)
      .join(', ') || 'None specified';
    
    const unclearText = formattedNote.unclearPoints
      ?.map(u => u.issue)
      .join(', ') || 'None';
    
    const questionsText = formattedNote.questionsForStakeholder
      ?.map(q => q.question)
      .join(', ') || 'None';

    const prompt = `Generate a professional confirmation message to send to a manager based on this task:

Task: ${formattedNote.taskName}
Summary: ${formattedNote.summary || ''}
Requirements: ${requirementsText}
Unclear Points: ${unclearText}
Questions: ${questionsText}

Write a concise, friendly message that:
1. Confirms understanding of the task
2. Lists the key requirements
3. Asks the clarifying questions
4. Requests confirmation

Keep it professional but not too formal. No subject line needed.`;

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: 'You write professional but friendly workplace messages.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 800
      })
    });

    if (!response.ok) {
      return NextResponse.json({ error: 'AI API request failed' }, { status: 500 });
    }

    const data = await response.json();
    const message = data.choices?.[0]?.message?.content || '';

    return NextResponse.json({ message });
  } catch {
    return NextResponse.json({ error: 'Failed to generate message' }, { status: 500 });
  }
}
