'use client';

import { Button } from '@/components/ui/button';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/';
  const error = searchParams.get('error');

  const handleLogin = () => {
    signIn('keycloak', { callbackUrl });
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-100 dark:bg-gray-900">
      <div className="w-full max-w-sm rounded-lg bg-white p-8 shadow-md dark:bg-gray-800">
        <h1 className="mb-6 text-center text-3xl font-bold text-gray-900 dark:text-white">
          Đăng nhập
        </h1>
        <p className="mb-6 text-center text-gray-600 dark:text-gray-300">
          Sử dụng tài khoản Keycloak để tiếp tục.
        </p>
        {error && (
          <div className="mb-4 rounded-md bg-red-100 p-3 text-center text-sm text-red-700 dark:bg-red-900/30 dark:text-red-400">
            Đăng nhập thất bại. Vui lòng thử lại.
            <p className="text-xs">{error}</p>
          </div>
        )}
        <Button onClick={handleLogin} className="w-full">
          Đăng nhập với Keycloak
        </Button>
        <p className="mt-4 text-center text-xs text-gray-500">
          Bạn sẽ được chuyển hướng đến trang đăng nhập của Keycloak.
        </p>
      </div>
    </main>
  );
}


export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginPageContent />
    </Suspense>
  )
} 