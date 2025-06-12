'use client';

import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function ErrorPageContent() {
    const searchParams = useSearchParams();
    const error = searchParams.get('error');

    return (
        <main className="flex min-h-screen flex-col items-center justify-center bg-gray-100 p-4 dark:bg-gray-900">
            <div className="w-full max-w-md rounded-lg bg-white p-8 text-center shadow-md dark:bg-gray-800">
                <h1 className="mb-4 text-4xl font-extrabold text-yellow-500 dark:text-yellow-400">
                    Lỗi
                </h1>
                <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
                    Đã có lỗi xảy ra
                </h2>
                <p className="mb-6 text-gray-600 dark:text-gray-300">
                    Một lỗi không mong muốn đã xảy ra trong quá trình xác thực.
                </p>
                {error && (
                    <div className="mb-4 rounded-md bg-red-100 p-3 text-left text-sm text-red-700 dark:bg-red-900/30 dark:text-red-400">
                        <p className="font-semibold">Chi tiết lỗi:</p>
                        <pre className="mt-2 whitespace-pre-wrap break-all"><code>{error}</code></pre>
                    </div>
                )}
                <div className="flex justify-center space-x-4">
                    <Button asChild>
                        <Link href="/login">Thử lại</Link>
                    </Button>
                </div>
            </div>
        </main>
    )
}

export default function ErrorPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <ErrorPageContent />
        </Suspense>
    )
} 