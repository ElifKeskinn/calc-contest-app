'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ThankYouPage() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    window.history.pushState(null, '', window.location.href);
    window.onpopstate = () => {
      window.history.pushState(null, '', window.location.href);
    };
  }, []);

  useEffect(() => {
    if (countdown <= 0) {
      router.push('/');
      return;
    }

    const timer = setTimeout(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdown, router]);

  return (
    <div className="thank-you-container">
      <h1 className="thank-you-heading">Bilgilerinizi gönderdiğiniz için teşekkür ederiz!</h1>
      <p className="redirect-message">Ana sayfaya {countdown} saniye içinde yönlendiriliyorsunuz.</p>
    </div>
  );
}
