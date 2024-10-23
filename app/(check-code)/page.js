'use client';
import { supabase } from '../../lib/client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function CheckCode() {
  const router = useRouter();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');

  const handleCodeCheck = async (e) => {
    e.preventDefault();
    const { data, error } = await supabase
      .from('codes')
      .select('*')
      .eq('code', code)
      .eq('is_used', false)
      .single();

    if (error || !data) {
      setError('Invalid or already used code');
    } else {
      router.push(`/submit-form?code_id=${data.id}`);
    }
  };

  return (
    <div>
      <form onSubmit={handleCodeCheck}>
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Enter your code"
        />
        <button type="submit">Submit</button>
      </form>
      {error && <p>{error}</p>}
    </div>
  );
}
