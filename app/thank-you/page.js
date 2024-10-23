'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ThankYou() {
  const router = useRouter();

  useEffect(() => {
    // Disable the back button from bringing the user back to the form
    window.history.pushState(null, '', window.location.href);
    window.onpopstate = () => {
      window.history.pushState(null, '', window.location.href);
    };

    // Redirect to homepage after 5 seconds
    const timer = setTimeout(() => {
      router.push('/');
    }, 5000);

    // Cleanup the timer when component unmounts
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div>
      <h1>Thank you for submitting your information!</h1>
      <p>You will be redirected to the homepage in 5 seconds.</p>
    </div>
  );
}

/*geri sayım eklencek */