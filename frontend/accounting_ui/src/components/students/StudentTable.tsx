'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  PaginationState,
} from '@tanstack/react-table';
import { StudentRow, StudentBasicInfo } from '@/types';
import { getStudents } from '@/services/accountingApi';

export default function StudentTable() {
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0, 
    pageSize: 5, // Let's use 5 per page for mock data demo
  });
  const [data, setData] = useState<StudentRow[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      setError(null);
      try {
        // Use real API (0-based pagination)
        const result = await getStudents(
          pagination.pageIndex, // API uses 0-based pagination same as frontend
          pagination.pageSize
        );
        setData(result.items.map((s: StudentBasicInfo) => ({ ...s }))); 
        setTotalCount(result.totalCount);
      } catch (err) {
        console.error('Failed to fetch students:', err);
        setError(err instanceof Error ? err.message : 'Có lỗi xảy ra khi tải dữ liệu sinh viên');
      }
      setIsLoading(false);
    }
    fetchData();
  }, [pagination]);

  const columns = useMemo<ColumnDef<StudentRow>[]>(() => [
    {
      accessorKey: 'studentCode',
      header: 'Mã Sinh Viên',
      cell: info => (
        <Link
          href={`/students/${info.getValue()}`}
          className="text-blue-600 hover:underline font-medium"
        >
          {info.getValue() as string}
        </Link>
      ),
    },
    {
      accessorKey: 'lastName',
      header: 'Họ',
    },
    {
      accessorKey: 'firstName',
      header: 'Tên',
    },
    {
      accessorKey: 'classCode',
      header: 'Lớp',
    },
    {
      accessorKey: 'facultyCode',
      header: 'Khoa',
    },
  ], []);

  const pageCount = Math.ceil(totalCount / pagination.pageSize);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    manualPagination: true, 
    rowCount: totalCount,
    pageCount: pageCount, // Provide pageCount
    state: {
      pagination,
    },
    onPaginationChange: setPagination,
  });

  if (isLoading) return <p className="text-center py-4">Đang tải dữ liệu sinh viên...</p>;
  if (error) return <p className="text-red-500 bg-red-100 p-3 rounded-md">Lỗi: {error}</p>;
  if (data.length === 0 && !isLoading) return <p className="text-center py-4 text-gray-500">Không có dữ liệu sinh viên.</p>;

  return (
    <div className="overflow-x-auto bg-white shadow-md rounded-lg">
      <table className="min-w-full border-collapse">
        <thead className="bg-gray-100">
          {table.getHeaderGroups().map(headerGroup => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map(header => (
                <th key={header.id} scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider border-b border-gray-200">
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody className="divide-y divide-gray-200">
          {table.getRowModel().rows.map(row => (
            <tr key={row.id} className="hover:bg-gray-50 transition-colors">
              {row.getVisibleCells().map(cell => (
                <td key={cell.id} className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 border-b border-gray-200">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="py-3 px-4 flex flex-col sm:flex-row items-center justify-between gap-2 border-t border-gray-200">
        <span className="text-sm text-gray-700">
          Trang {table.getState().pagination.pageIndex + 1} / {pageCount} (Tổng số {totalCount} sinh viên)
        </span>
        <div className="flex items-center gap-2">
          <button
            className="px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
          >
            Trang Đầu
          </button>
          <button
            className="px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Trang Trước
          </button>
          <button
            className="px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Trang Sau
          </button>
          <button
            className="px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            onClick={() => table.setPageIndex(pageCount - 1)}
            disabled={!table.getCanNextPage()}
          >
            Trang Cuối
          </button>
        </div>
      </div>
    </div>
  );
} 