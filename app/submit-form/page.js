import { Suspense } from 'react';
import SubmitForm from './SubmitForm';

export default function SubmitFormPage() {
  return (
    <Suspense fallback={<div>Yükleniyor...</div>}>
      <SubmitForm />
    </Suspense>
  );
}
