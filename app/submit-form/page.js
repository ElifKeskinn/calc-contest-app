'use client';

import { Suspense } from 'react';
import SubmitForm from '../component/SubmitForm';

export default function SubmitFormPage() {
  return (
    <Suspense fallback={<div>Yükleniyor...</div>}>
      <SubmitForm />
    </Suspense>
  );
}
