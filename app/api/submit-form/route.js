import { NextResponse } from 'next/server';
import { supabaseServer } from '../../../lib/server';
import { z } from 'zod';

const formSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  phone: z.string().regex(/^\d{11}$/),
  department: z.string().min(1),
  grade: z.string(),
  age: z.number().min(18).max(99),
});

export async function POST(request) {
  try {
    const body = await request.json();
    const { formData, code_id } = body;

    formSchema.parse({
      ...formData,
      age: formData.age === '' ? undefined : formData.age,
      phone: formData.phone.replace(/\D/g, ''),
    });

    const normalizedPhone = formData.phone.replace(/\D/g, '');

    const { data: existingData } = await supabaseServer
      .from('submissions')
      .select('id')
      .eq('phone', normalizedPhone)
      .single();

    if (existingData) {
      return NextResponse.json({ error: 'Bu telefon numarası zaten kayıt edilmiş.' }, { status: 400 });
    }

    const { error: insertError } = await supabaseServer.from('submissions').insert({
      name: formData.name,
      email: formData.email,
      phone: normalizedPhone,
      department: formData.department,
      grade: formData.grade,
      age: formData.age,
      code_id,
    });

    if (insertError) {
      throw insertError;
    }

    const { error: updateError } = await supabaseServer
      .from('codes')
      .update({ is_used: true })
      .eq('id', code_id);

    if (updateError) {
      throw updateError;
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: err.message || 'Bir hata oluştu' }, { status: 500 });
  }
}
