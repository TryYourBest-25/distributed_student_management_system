'use client';

import React, { useState } from 'react';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  SortingState,
  ColumnFiltersState,
} from '@tanstack/react-table';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PlusCircle } from 'lucide-react';
import { Course } from '@/types/course';
import { CourseDialog } from './course-dialog';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface CourseDataTableProps {
  columns: ColumnDef<Course>[];
  data: Course[];
  isLoading?: boolean;
  canManage: boolean;
  onDeleteCourse?: (course: Course) => void;
}

export function CourseDataTable({
  columns,
  data,
  isLoading = false,
  canManage,
  onDeleteCourse,
}: CourseDataTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleAddCourse = () => {
    setIsDialogOpen(true);
  };

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnFilters,
      globalFilter,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    enableColumnResizing: true,
    columnResizeMode: 'onChange',
    meta: {
      deleteHandler: onDeleteCourse,
    },
  });

  if (isLoading) {
    return (
      <div className="w-full rounded-md border bg-card shadow-sm">
        <div className="flex items-center justify-center py-16">
          <div className="flex flex-col items-center space-y-4">
            <LoadingSpinner size="lg" />
            <p className="text-muted-foreground">Đang tải dữ liệu môn học...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full rounded-md border bg-card shadow-sm">
      <div className="flex items-center justify-between p-4 border-b">
        <Input
          placeholder="Lọc tất cả các cột..."
          value={globalFilter ?? ''}
          onChange={(event) => setGlobalFilter(event.target.value)}
          className="max-w-sm h-9"
        />
        {canManage && (
          <Button onClick={handleAddCourse} size="sm" className="h-9">
            <PlusCircle className="mr-2 h-4 w-4" />
            Thêm Môn học
          </Button>
        )}
      </div>
      <div className="overflow-x-auto">
        <Table className="w-full">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                                 {headerGroup.headers.map((header) => {
                   const align = (header.column.columnDef.meta as any)?.align;
                   return (
                     <TableHead 
                       key={header.id} 
                       className={`whitespace-nowrap ${align === 'center' ? 'text-center' : ''}`}
                       style={{ width: header.getSize() }}
                     >
                       {header.isPlaceholder
                         ? null
                         : flexRender(
                             header.column.columnDef.header,
                             header.getContext()
                           )}
                     </TableHead>
                   );
                 })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                >
                                     {row.getVisibleCells().map((cell) => {
                     const align = (cell.column.columnDef.meta as any)?.align;
                     return (
                       <TableCell 
                         key={cell.id} 
                         className={`whitespace-nowrap ${align === 'center' ? 'text-center' : ''}`}
                         style={{ width: cell.column.getSize() }}
                       >
                         {flexRender(
                           cell.column.columnDef.cell,
                           cell.getContext()
                         )}
                       </TableCell>
                     );
                   })}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  Không tìm thấy môn học nào.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-between p-4 border-t">
        <div className="text-sm text-muted-foreground">
          {/* Tạm thời ẩn phần chọn dòng */}
          {/* {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} row(s) selected. */} 
          Tổng số: {table.getFilteredRowModel().rows.length} môn học
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Trước
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Sau
          </Button>
        </div>
      </div>

      <CourseDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        course={undefined}
        mode="create"
      />
    </div>
  );
} 