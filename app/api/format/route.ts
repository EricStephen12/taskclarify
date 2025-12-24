import { NextRequest, NextResponse } from 'next/server';
import { FormattedNote, ErrorResponse } from '@/types';

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

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content: `You are a senior product manager and requirements analyst. Your job is to transform messy meeting notes into professional, structured requirements documents.

Be thorough and extract EVERYTHING. Don't be lazy. Analyze deeply.

Return ONLY valid JSON, no markdown or extra text.`
          },
          {
            role: 'user',
            content: `Analyze these meeting notes and create a professional requirements document.

Return JSON in this EXACT format:
{
  "taskName": "Clear, professional task/feature name",
  "summary": "2-3 sentence executive summary of what needs to be built",
  "priority": "HIGH" | "MEDIUM" | "LOW",
  "estimatedComplexity": "Simple" | "Moderate" | "Complex",
  "functionalRequirements": [
    {
      "id": "FR-001",
      "title": "Requirement title",
      "description": "Detailed description of what the system must do",
      "acceptanceCriteria": ["Criterion 1", "Criterion 2"]
    }
  ],
  "technicalRequirements": [
    {
      "id": "TR-001",
      "title": "Technical requirement title",
      "description": "Technical implementation detail"
    }
  ],
  "userStories": [
    {
      "id": "US-001",
      "persona": "User type",
      "action": "What they want to do",
      "benefit": "Why they want to do it"
    }
  ],
  "unclearPoints": [
    {
      "id": "UC-001",
      "issue": "What's unclear",
      "impact": "Why this matters",
      "suggestedResolution": "How to resolve"
    }
  ],
  "questionsForStakeholder": [
    {
      "id": "Q-001",
      "question": "The question to ask",
      "context": "Why this question matters",
      "options": ["Possible answer 1", "Possible answer 2"]
    }
  ],
  "assumptions": ["Assumption 1", "Assumption 2"],
  "outOfScope": ["What's NOT included"],
  "dependencies": ["External dependencies"],
  "risks": [
    {
      "risk": "Risk description",
      "mitigation": "How to mitigate"
    }
  ]
}

Meeting Notes:
${notes}`
          }
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

    const result = parseResponse(content);
    return NextResponse.json<FormattedNote>(result);
  } catch (error) {
    return NextResponse.json<ErrorResponse>(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}

function parseResponse(content: string): FormattedNote {
  let cleaned = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
  
  const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('No JSON found');
  }
  
  const parsed = JSON.parse(jsonMatch[0]);
  
  return {
    taskName: parsed.taskName || 'Untitled Task',
    summary: parsed.summary || '',
    priority: parsed.priority || 'MEDIUM',
    estimatedComplexity: parsed.estimatedComplexity || 'Moderate',
    functionalRequirements: parsed.functionalRequirements || [],
    technicalRequirements: parsed.technicalRequirements || [],
    userStories: parsed.userStories || [],
    unclearPoints: parsed.unclearPoints || [],
    questionsForStakeholder: parsed.questionsForStakeholder || [],
    assumptions: parsed.assumptions || [],
    outOfScope: parsed.outOfScope || [],
    dependencies: parsed.dependencies || [],
    risks: parsed.risks || []
  };
}
