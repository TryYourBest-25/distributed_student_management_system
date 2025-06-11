"use client";

import * as React from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  Row,
} from "@tanstack/react-table";
import { useRouter } from "next/navigation"; // For navigation on view details

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PlusCircle, Trash2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DeleteConfirmDialog } from "@/components/core/delete-confirm-dialog";
import { AppTableMeta } from "@/types/table";
import { AddCreditClassDialog } from "./add-credit-class-dialog";
import { DeleteCreditClassesDialog } from "./delete-credit-classes-dialog";
import { type CreditClassBasicResponse } from "@/services/credit-class-service";

// Define and export CreditClassInfo interface
export interface CreditClassInfo {
  creditClassId: number;
  credit_class_code: string;
  course_code: string;
  group_number: number;
  current_students: number;
  min_students: number;
  academic_year: string;
  semester: number;
  is_cancelled: boolean;
}

interface CreditClassDataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  canManage: boolean;
  facultyCode: string;
  servicePath: string;
  onRowClick?: (row: Row<TData>) => void;
}

// Helper function to transform CreditClassInfo to CreditClassBasicResponse
const transformToCreditClassBasicResponse = (creditClassInfo: CreditClassInfo): CreditClassBasicResponse => {
  return {
    creditClassId: creditClassInfo.creditClassId,
    courseCode: creditClassInfo.course_code,
    groupNumber: creditClassInfo.group_number,
    currentStudent: creditClassInfo.current_students,
    minStudent: creditClassInfo.min_students,
    academicYear: creditClassInfo.academic_year,
    semester: creditClassInfo.semester,
    isCancelled: creditClassInfo.is_cancelled,
  };
};

export function CreditClassDataTable<TData extends CreditClassInfo, TValue>({
  columns,
  data,
  canManage,
  facultyCode,
  servicePath,
  onRowClick,
}: CreditClassDataTableProps<TData, TValue>) {
  const router = useRouter();
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

  const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false);

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [deletingCreditClass, setDeletingCreditClass] = React.useState<TData | null>(null);
  const [deletingMultiple, setDeletingMultiple] = React.useState(false);

  const table = useReactTable({
    data,
    columns,
    enableColumnFilters: true,
    enableSorting: true,
    enableRowSelection: true,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
    meta: {
      canManage,
      editHandler: (creditClass: TData) => {
        // Navigate to detail page for editing
        router.push(`/credit-classes/${(creditClass as any).creditClassId}`);
      },
      deleteHandler: (creditClass: TData) => {
        setDeletingCreditClass(creditClass);
        setDeletingMultiple(false);
        setIsDeleteDialogOpen(true);
      },
      viewDetailsHandler: (creditClass: TData) => {
        router.push(`/credit-classes/${creditClass.creditClassId}`);
      },
    } as AppTableMeta<TData>,
  });

  const openAddDialog = () => {
    setIsAddDialogOpen(true);
  };

  const confirmDelete = () => {
    // TODO: Replace with actual API call
    if (deletingMultiple) {
      const selectedIds = table.getFilteredSelectedRowModel().rows.map(row => row.original.creditClassId);
      console.log("Deleting multiple credit classes:", selectedIds);
      // Mutate data or refetch
      table.resetRowSelection(); 
    } else if (deletingCreditClass) {
      console.log("Deleting credit class:", deletingCreditClass.creditClassId);
      // Mutate data or refetch
    }
    setIsDeleteDialogOpen(false);
    setDeletingCreditClass(null);
    // toast({ title: "Success", description: "Credit class(es) deleted." });
  };

  const handleDeleteSelected = () => {
    if (table.getFilteredSelectedRowModel().rows.length > 0) {
        setDeletingMultiple(true);
        setDeletingCreditClass(null); 
        setIsDeleteDialogOpen(true);
    } else {
        alert("Vui lòng chọn lớp tín chỉ để xóa.");
        // toast({ title: "No selection", description: "Please select credit classes to delete.", variant: "destructive" });
    }
  };

  const deleteDialogTitle = React.useMemo(() => {
    if (deletingMultiple) {
      return `Xác nhận xóa ${table.getFilteredSelectedRowModel().rows.length} lớp tín chỉ`;
    }
    if (deletingCreditClass) {
      return `Xác nhận xóa lớp tín chỉ ${deletingCreditClass.credit_class_code}`;
    }
    return "Xác nhận xóa";
  }, [deletingCreditClass, deletingMultiple, table]);

  const deleteDialogDescription = React.useMemo(() => {
    if (deletingMultiple) {
      return `Bạn có chắc chắn muốn xóa ${table.getFilteredSelectedRowModel().rows.length} lớp tín chỉ đã chọn? Hành động này không thể hoàn tác.`;
    }
    if (deletingCreditClass) {
      return `Bạn có chắc chắn muốn xóa lớp tín chỉ ${deletingCreditClass.credit_class_code}? Hành động này không thể hoàn tác.`;
    }
    return "Bạn có chắc chắn muốn thực hiện hành động này? Hành động này không thể hoàn tác.";
  }, [deletingCreditClass, deletingMultiple, table]);

  return (
    <div className="w-full rounded-md border bg-card shadow-sm">
      <div className="flex items-center justify-between p-4 border-b">
        <Input
          placeholder="Lọc theo mã lớp HP..."
          value={(table.getColumn("credit_class_code")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("credit_class_code")?.setFilterValue(event.target.value)
          }
          className="max-w-sm h-9"
        />
        <div className="flex items-center space-x-2">
          {canManage && table.getFilteredSelectedRowModel().rows.length > 0 && (
            <DeleteCreditClassesDialog
              facultyCode={facultyCode}
              creditClasses={table.getFilteredSelectedRowModel().rows.map(row => transformToCreditClassBasicResponse(row.original))}
              onSuccess={() => {
                table.resetRowSelection();
                // Refresh data would be handled by React Query invalidation
              }}
            />
          )}
          {canManage && (
            <Button onClick={openAddDialog} size="sm" className="h-9">
              <PlusCircle className="mr-2 h-4 w-4" /> Thêm Lớp tín chỉ
            </Button>
          )}
        </div>
      </div>
      <div className="overflow-x-auto">
        <Table className="w-full">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
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
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  onClick={() => onRowClick?.(row)} 
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="whitespace-nowrap">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  Không có dữ liệu.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-between p-4 border-t">
        <div className="text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length > 0 ? (
            <>
              {table.getFilteredSelectedRowModel().rows.length} của{" "}
              {table.getFilteredRowModel().rows.length} dòng được chọn.
            </>
          ) : (
            `Tổng số: ${table.getFilteredRowModel().rows.length} lớp tín chỉ`
          )}
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

      <AddCreditClassDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        facultyCode={facultyCode}
        servicePath={servicePath}
      />

      <DeleteConfirmDialog
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={confirmDelete}
        title={deleteDialogTitle}
        description={deleteDialogDescription}
      />
    </div>
  );
}
