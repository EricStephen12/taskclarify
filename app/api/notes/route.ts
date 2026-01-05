import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

interface NoteRow {
  id: string;
  raw_input: string;
  task_name: string;
  detected_type: string;
  document_data: Record<string, unknown>;
  created_at: string;
}

function getSupabaseClient() {
  const cookieStore = cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Ignore errors in server components
          }
        },
      },
    }
  );
}

// GET - Load all notes for the user
export async function GET() {
  try {
    const supabase = getSupabaseClient();
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
    const savedNotes = (notes as NoteRow[]).map((note) => ({
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
    const supabase = getSupabaseClient();
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
