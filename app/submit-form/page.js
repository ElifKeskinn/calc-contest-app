"use client";

import { supabase } from '../../lib/client';
import { z } from 'zod';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';

const formSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email'),
  phone: z.string().min(10, 'Phone number is too short'),
});

export default function SubmitForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const code_id = searchParams.get('code_id');
  const [formData, setFormData] = useState({ name: '', email: '', phone: '' });
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    try {
      // Validate form data
      formSchema.parse(formData);
  
      // Insert submission
      const { error: insertError } = await supabase.from('submissions').insert({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        code_id,
      });
  
      if (insertError) throw insertError;
  
      // Update the code as used (set is_used to true)
      const { error: updateError } = await supabase
        .from('codes')
        .update({ is_used: true })
        .eq('id', code_id);
  
      if (updateError) throw updateError;
  
      // Redirect to thank you page
      router.push('/thank-you');
    } catch (err) {
      setError(err.errors ? err.errors[0].message : err.message);
    }
  };
  

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        />
        <input
          type="email"
          placeholder="Email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        />
        <input
          type="text"
          placeholder="Phone"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
        />
        <button type="submit">Submit</button>
      </form>
      {error && <p>{error}</p>}
    </div>
  );
}
