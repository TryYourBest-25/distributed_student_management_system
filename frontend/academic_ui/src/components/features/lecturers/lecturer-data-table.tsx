'use client';

import React, { useState, useEffect, useMemo } from 'react';
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
  VisibilityState,
  RowSelectionState,
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
import { LecturerFormDialog } from './lecturer-form-dialog';
import { LecturerFormValues } from '@/lib/validators/lecturer-validator';


import { AppTableMeta } from "@/types/table";
import { Faculty } from "@/types/faculty";
import { Lecturer } from "@/types/lecturer";

interface LecturerDataTableProps {
  columns: ColumnDef<Lecturer>[];
  data: Lecturer[];
  isLoading?: boolean;
  canManage: boolean;
  availableFaculties: Faculty[];
  onDelete: (lecturer: Lecturer) => void;
  onSave: (lecturerData: LecturerFormValues, existingLecturerCode?: string) => Promise<void>;
}

export function LecturerDataTable({
  columns: initialColumns,
  data,
  isLoading: isLoadingInitialData = false,
  canManage,
  availableFaculties,
  onDelete,
  onSave,
}: LecturerDataTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [tableData, setTableData] = useState<Lecturer[]>(data);
  const [isTableBusy, setIsTableBusy] = useState(false);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});



  useEffect(() => {
    setTableData(data);
  }, [data]);

  const handleOpenAddLecturerModal = () => {
    setIsFormModalOpen(true);
  };

  const handleFormSubmit = async (values: LecturerFormValues) => {
    setIsTableBusy(true);
    try {
      await onSave(values);
    } catch (error) {
      console.error("Failed to save lecturer:", error);
    }
    setIsFormModalOpen(false);
    setIsTableBusy(false);
  };

  const handleCloseForm = () => {
    setIsFormModalOpen(false);
  };

  const internalDeleteOpener = (lecturer: Lecturer) => {
    onDelete(lecturer);
  };
  
  const columns = useMemo(() => {
    return initialColumns;
  }, [initialColumns]);

  const table = useReactTable({
    data: tableData,
    columns,
    state: {
      sorting,
      columnFilters,
      globalFilter,
      columnVisibility,
      rowSelection,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    meta: {
      canManage,
    } as AppTableMeta<Lecturer>,
  });

  return (
    <div className="w-full rounded-md border bg-card shadow-sm">
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center space-x-4">
          <Input
            placeholder="Lọc giảng viên..."
            value={globalFilter ?? ''}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
              setGlobalFilter(event.target.value)
            }
            className="max-w-sm h-9"
          />
        </div>
        {canManage && (
          <Button onClick={handleOpenAddLecturerModal} size="sm" className="h-9" disabled={isTableBusy}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Thêm Giảng viên
          </Button>
        )}
      </div>
      <div className="overflow-x-auto">
        <Table className="w-full">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="whitespace-nowrap">
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  {isLoadingInitialData ? "Đang tải..." : "Không có dữ liệu."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 p-4 border-t">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} của{" "}
          {table.getFilteredRowModel().rows.length} dòng được chọn.
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage() || isTableBusy}
          >
            Trước
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage() || isTableBusy}
          >
            Sau
          </Button>
        </div>
      </div>

      {isFormModalOpen && (
        <LecturerFormDialog
          isOpen={isFormModalOpen}
          onClose={handleCloseForm}
          onSubmit={handleFormSubmit}
          defaultValues={undefined}
          isLoading={isTableBusy}
          availableFaculties={availableFaculties || []}
        />
      )}


    </div>
  );
} 