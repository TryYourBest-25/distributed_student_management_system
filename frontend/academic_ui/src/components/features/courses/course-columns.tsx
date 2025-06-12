'use client';

import { ColumnDef, Column, Row, HeaderContext, CellContext, TableMeta } from '@tanstack/react-table';
import { ArrowUpDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from "@/components/ui/checkbox";
import { Course } from '@/types/course';
import { CourseActionCell } from './course-action-cell';
import Link from 'next/link';

// Định nghĩa interface cho meta data của table
interface AppTableMeta extends TableMeta<Course> {
  deleteHandler?: (course: Course) => void;
}

interface CourseColumnsProps {
  canManage: boolean;
}

// Hàm này trả về mảng các ColumnDef
export const columns = ({ canManage }: CourseColumnsProps): ColumnDef<Course>[] => [
  // Cột Checkbox để chọn hàng (nếu cần)
  // {
  //   id: "select",
  //   header: ({ table }: HeaderContext<Course, unknown>) => (
  //     <Checkbox
  //       checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
  //       onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
  //       aria-label="Select all"
  //       className="translate-y-[2px]"
  //     />
  //   ),
  //   cell: ({ row }: CellContext<Course, unknown>) => (
  //     <Checkbox
  //       checked={row.getIsSelected()}
  //       onCheckedChange={(value) => row.toggleSelected(!!value)}
  //       aria-label="Select row"
  //       className="translate-y-[2px]"
  //     />
  //   ),
  //   enableSorting: false,
  //   enableHiding: false,
  // },
  {
    accessorKey: 'course_code',
    header: ({ column }: { column: Column<Course, unknown> }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        className="h-auto p-0 justify-start"
      >
        Mã Môn Học
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }: { row: Row<Course> }) => (
      <Link 
        href={`/courses/${encodeURIComponent(row.getValue('course_code'))}`} 
        className="font-medium text-blue-600 hover:underline"
      >
        {row.getValue('course_code')}
      </Link>
    ),
    size: 150,
    minSize: 120,
    maxSize: 200,
  },
  {
    accessorKey: 'course_name',
    header: ({ column }: { column: Column<Course, unknown> }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        className="h-auto p-0 justify-start"
      >
        Tên Môn Học
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }: { row: Row<Course> }) => (
      <div className="truncate" title={row.getValue('course_name')}>
        {row.getValue('course_name')}
      </div>
    ),
    size: 300,
    minSize: 200,
    maxSize: 400,
  },
  {
    accessorKey: 'lecture_credit',
    header: ({ column }: { column: Column<Course, unknown> }) => (
      <div className="text-center">
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="w-full justify-center h-auto p-0"
        >
          Số TC LT
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      </div>
    ),
    cell: ({ row }: { row: Row<Course> }) => (
      <div className="text-center font-medium">{row.getValue('lecture_credit')}</div>
    ),
    size: 100,
    minSize: 80,
    maxSize: 120,
    meta: {
      align: 'center',
    },
  },
  {
    accessorKey: 'lab_credit',
    header: ({ column }: { column: Column<Course, unknown> }) => (
      <div className="text-center">
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="w-full justify-center h-auto p-0"
        >
          Số TC TH
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      </div>
    ),
    cell: ({ row }: { row: Row<Course> }) => (
      <div className="text-center font-medium">{row.getValue('lab_credit')}</div>
    ),
    size: 100,
    minSize: 80,
    maxSize: 120,
    meta: {
      align: 'center',
    },
  },
  // Cột Hành động (Actions) - hiển thị cho tất cả người dùng
  {
    id: 'actions',
    header: () => <div className="text-center">Thao tác</div>,
    cell: ({ row, table }: CellContext<Course, unknown>) => {
      const course = row.original;
      const meta = table.options.meta as AppTableMeta | undefined;

      return (
        <div className="flex justify-center">
          <CourseActionCell 
            course={course} 
            onDelete={meta?.deleteHandler}
          />
        </div>
      );
    },
    size: 80,
    minSize: 60,
    maxSize: 100,
    enableSorting: false,
    enableHiding: false,
    meta: {
      align: 'center',
    },
  },
]; 