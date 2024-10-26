'use client';
import { supabase } from '../../lib/client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function CheckCodePage() {
  const router = useRouter();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');

  const handleCodeCheck = async (e) => {
    e.preventDefault();
    const lowerCaseCode = code.toLowerCase();

    const { data, error } = await supabase
      .from('codes')
      .select('*')
      .eq('code', lowerCaseCode)
      .eq('is_used', false)
      .single();

    if (error || !data) {
      setError('Geçersiz ya da kullanılmış bir kod girdiniz.');
    } else {
      router.push(`/submit-form?code_id=${data.id}`);
    }
  };

  return (
    <div className="code-check-container">
      <form onSubmit={handleCodeCheck} className="code-check-form">
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Kodunuzu giriniz"
          className="code-input"
        />
        <button type="submit" className="submit-button">Gönder</button>
      </form>
      {error && <p className="error-message">{error}</p>}
    </div>
  );
}
