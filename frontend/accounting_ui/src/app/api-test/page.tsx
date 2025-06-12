'use client';

import { useState } from 'react';
import { getStudents } from '@/services/accountingApi';
import { StudentBasicInfo, PagedResult } from '@/types';
import { API_BASE_URL } from '@/constants/api';

export default function ApiTestPage() {
  const [students, setStudents] = useState<StudentBasicInfo[]>([]);
  const [pagination, setPagination] = useState<PagedResult<StudentBasicInfo> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const testApi = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getStudents(1, 5);
      setStudents(result.items);
      setPagination(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">API Test Page</h1>
      
      <button
        onClick={testApi}
        disabled={loading}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
      >
        {loading ? 'Đang test API...' : 'Test API Students'}
      </button>

      {error && (
        <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          <strong>Lỗi:</strong> {error}
        </div>
      )}

      {students.length > 0 && (
        <div className="mt-4">
          <h2 className="text-xl font-semibold mb-2">Kết quả từ API:</h2>
          {pagination && (
            <div className="mb-4 p-2 bg-gray-100 rounded">
              <strong>Pagination Info:</strong> 
              <br />Tổng số records: {pagination.totalCount}
              <br />Trang hiện tại: {pagination.pageIndex} / {pagination.totalPages}
              <br />Kích thước trang: {pagination.pageSize}
              <br />Index bắt đầu từ: {pagination.indexFrom}
              <br />Có trang trước: {pagination.hasPreviousPage ? 'Có' : 'Không'}
              <br />Có trang sau: {pagination.hasNextPage ? 'Có' : 'Không'}
            </div>
          )}
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-4 py-2 border">Mã SV</th>
                  <th className="px-4 py-2 border">Họ</th>
                  <th className="px-4 py-2 border">Tên</th>
                  <th className="px-4 py-2 border">Lớp</th>
                  <th className="px-4 py-2 border">Khoa</th>
                </tr>
              </thead>
              <tbody>
                {students.map(student => (
                  <tr key={student.studentCode}>
                    <td className="px-4 py-2 border">{student.studentCode}</td>
                    <td className="px-4 py-2 border">{student.lastName}</td>
                    <td className="px-4 py-2 border">{student.firstName}</td>
                    <td className="px-4 py-2 border">{student.classCode}</td>
                    <td className="px-4 py-2 border">{student.facultyCode}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="mt-6 text-sm text-gray-600">
        <p><strong>API URL (Frontend):</strong> {API_BASE_URL}/students</p>
        <p><strong>Proxied to (Backend):</strong> http://localhost:14100/api/v1/students</p>
        <p><strong>Response format:</strong> PagedList&lt;StudentBasicInfo&gt;</p>
        <p><strong>CORS:</strong> Đã được giải quyết bằng Next.js rewrites</p>
        <p>Để test API, hãy đảm bảo API server đang chạy trên cổng 14100</p>
      </div>
    </div>
  );
} 