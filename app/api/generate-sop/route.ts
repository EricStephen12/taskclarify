import { NextRequest, NextResponse } from 'next/server';
import { SOP, SOPStep, ErrorResponse } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const { notes } = await request.json();
    
    if (!notes || notes.trim() === '') {
      return NextResponse.json<ErrorResponse>(
        { error: 'Notes are required' },
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

    const { systemPrompt, userPrompt } = buildSOPPrompt(notes);

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

    const sop = parseSOPResponse(content);
    return NextResponse.json<SOP>(sop);
  } catch {
    return NextResponse.json<ErrorResponse>(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}


function buildSOPPrompt(notes: string): { systemPrompt: string; userPrompt: string } {
  return {
    systemPrompt: `You are an SOP (Standard Operating Procedure) expert. Your job is to transform messy notes about a process into a clear, structured SOP with actionable steps.

CRITICAL RULES:
- Create clear, numbered steps with specific actions
- Include realistic time estimates for each step (in minutes)
- Provide helpful tips for each step
- Identify any unclear points or missing information
- Focus on practical, actionable guidance
- Keep steps concise but complete

Return ONLY valid JSON, no markdown or extra text.`,
    userPrompt: `Transform these notes into a structured SOP (Standard Operating Procedure).

Analyze the notes and create:
1. A clear name for the SOP
2. A brief summary of what this procedure accomplishes
3. Step-by-step instructions with:
   - Step number
   - Clear title
   - Detailed description
   - Estimated duration in minutes
   - Helpful tips (2-3 per step)
4. Any unclear points that need clarification

Return JSON in this EXACT format:
{
  "name": "Clear SOP name",
  "summary": "2-3 sentence summary of what this procedure accomplishes",
  "steps": [
    {
      "stepNumber": 1,
      "title": "Step title",
      "description": "Detailed description of what to do",
      "estimatedDuration": 15,
      "tips": ["Tip 1", "Tip 2"]
    }
  ],
  "unclearPoints": ["Point that needs clarification"]
}

Notes to transform:
${notes}`
  };
}

function parseSOPResponse(content: string): SOP {
  let cleaned = content.replace(/\`\`\`json\n?/g, '').replace(/\`\`\`\n?/g, '').trim();
  
  const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('No JSON found in response');
  }
  
  const parsed = JSON.parse(jsonMatch[0]);
  
  const steps: SOPStep[] = (parsed.steps || []).map((step: Record<string, unknown>, index: number) => ({
    id: `step-${index + 1}`,
    stepNumber: (step.stepNumber as number) || index + 1,
    title: (step.title as string) || `Step ${index + 1}`,
    description: (step.description as string) || '',
    estimatedDuration: (step.estimatedDuration as number) || 10,
    tips: (step.tips as string[]) || [],
    completed: false
  }));
  
  const totalDuration = steps.reduce((sum, step) => sum + step.estimatedDuration, 0);
  
  return {
    id: `sop-${Date.now()}`,
    name: (parsed.name as string) || 'Untitled SOP',
    summary: (parsed.summary as string) || '',
    totalDuration,
    steps,
    unclearPoints: (parsed.unclearPoints as string[]) || [],
    createdAt: new Date().toISOString()
  };
}
