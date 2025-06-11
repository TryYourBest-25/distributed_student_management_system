'use client';

import { ColumnDef } from '@tanstack/react-table';
import { ArrowUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Lecturer } from '@/types/lecturer'; 
import Link from 'next/link';
import { LecturerActionCell } from './lecturer-action-cell';

interface LecturerColumnsProps {
  canManage: boolean;
  onDelete?: (lecturer: Lecturer) => void;
}

export const columns = ({ canManage, onDelete }: LecturerColumnsProps): ColumnDef<Lecturer>[] => {
  const baseColumns: ColumnDef<Lecturer>[] = [
    {
      accessorKey: 'lecturer_code',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="p-0 hover:bg-transparent"
        >
          Mã GV
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <Link href={`/lecturers/${row.original.lecturer_code}`} className="font-medium text-blue-600 hover:underline">
          {row.getValue('lecturer_code')}
        </Link>
      ),
    },
    {
      accessorKey: 'full_name',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="p-0 hover:bg-transparent"
        >
          Họ và Tên
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => <div>{row.getValue('full_name')}</div>,
    },
    {
      accessorKey: 'degree',
      header: 'Học vị',
      cell: ({ row }) => <div>{row.getValue('degree') || '-'}</div>,
    },
    {
      accessorKey: 'academic_rank',
      header: 'Học hàm',
      cell: ({ row }) => <div>{row.getValue('academic_rank') || '-'}</div>,
    },
    {
      accessorKey: 'specialization',
      header: 'Chuyên môn',
      cell: ({ row }) => <div className="max-w-[200px] truncate" title={row.getValue('specialization') || ''}>{row.getValue('specialization') || '-'}</div>,
    },
    {
      accessorKey: 'faculty_name', // Hiển thị tên khoa cho dễ nhìn
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="p-0 hover:bg-transparent"
        >
          Khoa
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => <div>{row.original.faculty_name || 'Chưa phân khoa'}</div>,
      // enableHiding: !canManage, // Chỉ PGV mới cần thấy cột này nếu đang xem tất cả?
    },
  ];

  if (canManage) {
    baseColumns.push({
      id: 'actions',
      header: 'Thao tác',
      cell: ({ row }) => {
        const lecturer = row.original;
        return (
          <LecturerActionCell
            lecturer={lecturer}
            onDelete={onDelete || (() => {})}
          />
        );
      },
      enableSorting: false,
      enableHiding: false,
    });
  }

  return baseColumns;
}; 