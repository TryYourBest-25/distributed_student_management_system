'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from "next/image";

// This is the root page of the application (e.g., http://localhost:3000/)
// We want it to redirect to the main application dashboard.
// Authentication checks within the /dashboard route (or its layout) will handle
// redirecting to login if the user is not authenticated.

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/dashboard');
  }, [router]);

  // Render nothing or a loading indicator while redirecting
  return null; 
  // For example, you could render: <p>Loading application...</p>
}
