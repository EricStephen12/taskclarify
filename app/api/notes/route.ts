import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';

// GET - Load all notes for the user
export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: notes, error } = await supabase
      .from('notes')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading notes:', error);
      return NextResponse.json({ error: 'Failed to load notes' }, { status: 500 });
    }

    // Transform to match SavedNote format
    const savedNotes = notes.map(note => ({
      id: note.id,
      rawInput: note.raw_input,
      taskName: note.task_name,
      detectedType: note.detected_type,
      createdAt: note.created_at,
      ...note.document_data
    }));

    return NextResponse.json(savedNotes);
  } catch (error) {
    console.error('Error in GET /api/notes:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Save a new note
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { rawInput, taskName, detectedType, ...documentData } = body;

    const { data: note, error } = await supabase
      .from('notes')
      .insert({
        user_id: user.id,
        raw_input: rawInput,
        task_name: taskName,
        detected_type: detectedType,
        document_data: documentData
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving note:', error);
      return NextResponse.json({ error: 'Failed to save note' }, { status: 500 });
    }

    // Return in SavedNote format
    const savedNote = {
      id: note.id,
      rawInput: note.raw_input,
      taskName: note.task_name,
      detectedType: note.detected_type,
      createdAt: note.created_at,
      ...note.document_data
    };

    return NextResponse.json(savedNote);
  } catch (error) {
    console.error('Error in POST /api/notes:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
