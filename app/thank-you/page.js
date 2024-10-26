'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function ThankYou() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    // Kullanıcının geri butonunu kullanarak form sayfasına dönmesini engellemek
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
    <div>
      <h1>Bilgilerinizi gönderdiğiniz için teşekkür ederiz!</h1>
      <p>
        Ana sayfaya {countdown} saniye içinde yönlendiriliyorsunuz.
      </p>
    </div>
  );
}
