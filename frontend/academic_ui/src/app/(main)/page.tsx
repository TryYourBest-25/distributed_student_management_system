'use client'; // Or remove if redirect can be server-side

import { useEffect } from 'react';
import { useRouter } from 'next/navigation'; // Corrected import for App Router

export default function MainPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/dashboard');
  }, [router]);

  // Optional: Render a loading state or null while redirecting
  return null; 
  // Or a simple loading message:
  // return <p>Đang chuyển hướng đến bảng điều khiển...</p>;
} 