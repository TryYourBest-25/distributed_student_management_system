import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function UnauthorizedPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-100 p-4 dark:bg-gray-900">
      <div className="w-full max-w-md rounded-lg bg-white p-8 text-center shadow-md dark:bg-gray-800">
        <h1 className="mb-4 text-4xl font-extrabold text-red-600 dark:text-red-500">
          403
        </h1>
        <h2 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">
          Truy cập bị từ chối
        </h2>
        <p className="mb-6 text-gray-600 dark:text-gray-300">
          Bạn không có quyền truy cập vào tài nguyên này. Vui lòng liên hệ quản
          trị viên nếu bạn cho rằng đây là một sự nhầm lẫn.
        </p>
        <div className="flex justify-center space-x-4">
          <Button asChild>
            <Link href="/">Về trang chủ</Link>
          </Button>
          {/* You could add a logout button here as well */}
        </div>
      </div>
    </main>
  );
}
