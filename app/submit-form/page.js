"use client";

import { supabase } from '../../lib/client';
import { z } from 'zod';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';

const formSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email'),
  phone: z.string()
    .regex(/^0\(\d{3}\)-\d{2}-\d{2}$/, 'Phone number must be in the format 0(XXX)-XX-XX')
    .refine((val) => {
      const digits = val.replace(/\D/g, '');
      return digits.length === 11;
    }, 'Phone number must contain exactly 11 digits'),
  department: z.string().min(1, 'Department is required'),
  grade: z.enum(['Hazırlık Sınıfı', '1. Sınıf', '2. Sınıf', '3. Sınıf', '4. Sınıf', 'Diğer'], {
    errorMap: () => ({ message: 'Invalid grade selected' }),
  }),
  age: z
    .number()
    .int('Age must be an integer')
    .min(18, 'You must be at least 18 years old')
    .max(99, 'Age must be a two-digit number'),
});

// Yardımcı Fonksiyon: Telefon Numarasını Formatlama
const formatPhoneNumber = (value) => {
  if (!value) return value;

  const phoneNumber = value.replace(/\D/g, '');

  if (phoneNumber.length > 11) {
    return phoneNumber.slice(0, 11);
  }

  // Telefon numarasını formatlama: 0(XXX)-XX-XX
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
    formattedNumber += '-' + phoneNumber.slice(4, 6);
  }
  if (phoneNumber.length > 6) {
    formattedNumber += '-' + phoneNumber.slice(6, 8);
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
    grade: 'Sınıf Seçiniz', 
    age: '',
  });
  const [error, setError] = useState('');

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

    try {
      // Validate form data
      formSchema.parse(formData);

      // Check if phone already exists
      const { data: existingData, error: phoneError } = await supabase
        .from('submissions')
        .select('id')
        .eq('phone', formData.phone)
        .single();

      if (existingData) {
        setError('Bu telefon numarası zaten kayıt edilmiş.');
        return;
      }

      // Insert submission
      const { error: insertError } = await supabase.from('submissions').insert({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
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
      } else {
        setError(err.message);
      }
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        {/* Name Field */}
        <input
          type="text"
          name="name"
          placeholder="Name"
          value={formData.name}
          onChange={handleChange}
          required
        />

        {/* Email Field */}
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
        />

        {/* Phone Field */}
        <input
          type="text"
          name="phone"
          placeholder="0(5XX)-XX-XX"
          value={formData.phone}
          onChange={handleChange}
          required
        />

        {/* Department Field */}
        <input
          type="text"
          name="department"
          placeholder="Department"
          value={formData.department}
          onChange={handleChange}
          required
        />

        {/* Grade Field */}
        <select
          name="grade"
          value={formData.grade}
          onChange={handleChange}
          required
        >
          <option disabled value="Sınıf Seçiniz">Sınıf Seçiniz</option>
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
          placeholder="Age"
          value={formData.age}
          onChange={handleChange}
          required
          min="18"
          max="99"
        />

        <button type="submit">Submit</button>
      </form>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
}
