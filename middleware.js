// middleware.js
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

// Initialize Supabase client for server-side operations
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function middleware(request) {
  // Example: Validate a 'code' query parameter
  const code = request.nextUrl.searchParams.get('code');

  if (code) {
    // Check if the code exists and is not used
    const { data, error } = await supabase
      .from('codes')
      .select('*')
      .eq('code', code)
      .eq('is_used', false)
      .single();

    if (error || !data) {
      // Redirect to an error page if the code is invalid or already used
      return NextResponse.redirect(new URL('/invalid-code', request.url));
    }

    // Optionally, mark the code as used
    const { error: updateError } = await supabase
      .from('codes')
      .update({ is_used: true })
      .eq('id', data.id);

    if (updateError) {
      console.error('Error updating code:', updateError);
      return NextResponse.error();
    }

    // Optionally, you can add cookies or other headers here
  }

  // Allow the request to proceed
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - Any image file extensions
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
