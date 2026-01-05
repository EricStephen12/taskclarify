import { NextRequest } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the Google Generative AI client
const genAI = process.env.GEMINI_API_KEY ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY) : null;

export async function POST(req: NextRequest) {
  try {
    const { transcript } = await req.json();
    
    if (!transcript || typeof transcript !== 'string') {
      return Response.json({ error: 'Invalid transcript: expected a string' }, { status: 400 });
    }

    // If we have the GEMINI_API_KEY, use it to generate structured meeting minutes
    if (genAI) {
      const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
      
      const prompt = `Convert this meeting transcript into structured meeting minutes. Format as follows:

# Meeting Minutes

## Attendees
- [List of attendees if mentioned]

## Date & Time
- [Date and time if mentioned]

## Agenda Items
- [Key agenda items discussed]

## Discussion Points
- [Key discussion points with context]

## Action Items
- [Action items with assigned owners and deadlines if mentioned]

## Decisions Made
- [Key decisions made during the meeting]

## Next Steps
- [Next steps and follow-up items]

Here is the transcript:
${transcript}`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      return Response.json({ minutes: text });
    } else {
      // If no GEMINI_API_KEY, return a basic structured format
      return Response.json({ 
        minutes: `# Meeting Minutes

## Discussion Summary
${transcript}

## Action Items
- [Action items to be determined]

## Next Steps
- [Next steps to be determined]
` 
      });
    }
  } catch (error) {
    console.error('Error processing meeting minutes:', error);
    return Response.json({ error: 'Failed to process meeting minutes' }, { status: 500 });
  }
}