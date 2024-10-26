'use client';

import { supabase } from '../../lib/client';
import { z } from 'zod';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';

const formSchema = z.object({
  name: z.string().min(1, 'İsim alanı zorunludur'),
  email: z.string().email('Geçersiz email'),
  phone: z.string()
    .regex(/^0\(\d{3}\)-\d{3}-\d{2}-\d{2}$/, 'Telefon numaranız 0(XXX)-XXX-XX-XX formatında olmalıdır')
    .refine((val) => {
      const digits = val.replace(/\D/g, '');
      return digits.length === 11;
    }, 'Telefon numaranız 11 haneli olmalıdır'),
  department: z.string().min(1, 'Bölüm alanı zorunludur'),
  grade: z.enum(['Hazırlık Sınıfı', '1. Sınıf', '2. Sınıf', '3. Sınıf', '4. Sınıf', 'Diğer'], {
    errorMap: () => ({ message: 'Geçersiz sınıf değeri' }),
  }),
  age: z
    .number()
    .int('Yaşınız tam sayı olmalıdır')
    .min(18, '18 yaşından küçükler katılamaz')
    .max(99, 'Geçersiz yaş'),
});

// Yardımcı Fonksiyon: Telefon Numarasını Formatlama
const formatPhoneNumber = (value) => {
  if (!value) return value;

  const phoneNumber = value.replace(/\D/g, '');

  if (phoneNumber.length > 11) {
    return phoneNumber.slice(0, 11);
  }

  // Telefon numarasını formatlama: 0(XXX)-XXX-XX-XX
  let formattedNumber = '';

  if (phoneNumber.length > 0) {
    formattedNumber += phoneNumber[0]; // 0
  }
  if (phoneNumber.length > 1) {
    formattedNumber += '(' + phoneNumber.slice(1, 4);
  }
  if (phoneNumber.length >= 4) {
    formattedNumber += ')';
  }
  if (phoneNumber.length > 4) {
    formattedNumber += '-' + phoneNumber.slice(4, 7);
  }
  if (phoneNumber.length > 7) {
    formattedNumber += '-' + phoneNumber.slice(7, 9);
  }
  if (phoneNumber.length > 9) {
    formattedNumber += '-' + phoneNumber.slice(9, 11);
  }

  return formattedNumber;
};

export default function SubmitForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const code_id = searchParams.get('code_id');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    department: '',
    grade: '', // Boş bırakıldı
    age: '', // Başlangıçta boş
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false); // Loading durumu ekleyelim
  const [isInitialized, setIsInitialized] = useState(false); // Hydration mismatch için ek

  useEffect(() => {
    setIsInitialized(true);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'age') {
      setFormData({
        ...formData,
        [name]: value === '' ? '' : Number(value),
      });
    } else if (name === 'phone') {
      const formattedPhone = formatPhoneNumber(value);
      setFormData({
        ...formData,
        phone: formattedPhone,
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Validate form data
      formSchema.parse({
        ...formData,
        age: formData.age === '' ? undefined : formData.age, // age boşsa undefined olarak ayarla
      });

      // Normalize phone number (digits only) for duplication check
      const normalizedPhone = formData.phone.replace(/\D/g, '');

      // Check if phone already exists
      const { data: existingData, error: phoneError } = await supabase
        .from('submissions')
        .select('id')
        .eq('phone', normalizedPhone)
        .single();

      if (existingData) {
        setError('Bu telefon numarası zaten kayıt edilmiş.');
        setLoading(false);
        return;
      }

      // Insert submission
      const { error: insertError } = await supabase.from('submissions').insert({
        name: formData.name,
        email: formData.email,
        phone: normalizedPhone, // Normalize phone before storing
        department: formData.department,
        grade: formData.grade,
        age: formData.age,
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
      if (err instanceof z.ZodError) {
        setError(err.errors[0].message);
      } else if (err.code === '23505') { // Unique violation error code in PostgreSQL
        setError('Bu telefon numarası zaten kayıt edilmiş.');
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container">
      <form onSubmit={handleSubmit} className="info-form">
        {/* Name Field */}
        <input
          type="text"
          name="name"
          placeholder="İsim Soyisim"
          value={formData.name}
          onChange={handleChange}
          required
          className="form-input"
        />

        {/* Email Field */}
        <input
          type="email"
          name="email"
          placeholder="E-mail"
          value={formData.email}
          onChange={handleChange}
          required
          className="form-input"
        />

        {/* Phone Field */}
        <input
          type="text"
          name="phone"
          placeholder="0(XXX)-XXX-XX-XX"
          value={formData.phone}
          onChange={handleChange}
          required
          className="form-input"
        />

        {/* Department Field */}
        <input
          type="text"
          name="department"
          placeholder="Okuduğunuz bölüm"
          value={formData.department}
          onChange={handleChange}
          required
          className="form-input"
        />

        {/* Grade Field */}
        <select
          name="grade"
          value={formData.grade}
          onChange={handleChange}
          required
          className="form-select"
        >
          <option disabled value="">Sınıf Seçiniz</option>
          <option value="Hazırlık Sınıfı">Hazırlık Sınıfı</option>
          <option value="1. Sınıf">1. Sınıf</option>
          <option value="2. Sınıf">2. Sınıf</option>
          <option value="3. Sınıf">3. Sınıf</option>
          <option value="4. Sınıf">4. Sınıf</option>
          <option value="Diğer">Diğer</option>
        </select>

        {/* Age Field */}
        <input
          type="number"
          name="age"
          placeholder="Yaşınız"
          value={formData.age}
          onChange={handleChange}
          required
          min="18"
          max="99"
          className="form-input"
        />

        <button type="submit" disabled={loading} className="submit-button">
          {loading ? 'Gönderiliyor...' : 'Gönder'}
        </button>
      </form>
      {error && <p className="error-message">{error}</p>}
    </div>
  );
}
