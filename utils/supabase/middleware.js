// utils/supabase/middleware.js
import { supabaseServer } from '@/lib/server';
import { NextResponse } from 'next/server';

export async function updateSession(request) {
  // Example operation: Validate a code or perform other server-side tasks
  const code = request.nextUrl.searchParams.get('code');

  if (code) {
    const { data, error } = await supabaseServer
      .from('codes')
      .select('*')
      .eq('code', code)
      .eq('is_used', false)
      .single();

    if (error || !data) {
      return NextResponse.redirect(new URL('/invalid-code', request.url));
    }

    // Mark the code as used
    const { error: updateError } = await supabaseServer
      .from('codes')
      .update({ is_used: true })
      .eq('id', data.id);

    if (updateError) {
      console.error('Error updating code:', updateError);
      return NextResponse.error();
    }
  }

  return NextResponse.next();
}
