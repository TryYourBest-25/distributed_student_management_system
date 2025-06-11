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
} from "@tanstack/react-table";
import { PlusCircle, Trash2 } from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ConfirmDeleteDialog } from "@/components/core/confirm-delete-dialog";

// Define and export Student interface
export interface Student {
  id: string;
  student_code: string; // MSSV
  full_name: string;
  gender: "Nam" | "Nữ" | "Khác";
  date_of_birth: string; // YYYY-MM-DD
  email?: string;
  phone_number?: string;
  class_code: string; // To link student to a specific class context if needed by table
}

// Define table meta interface
interface StudentTableMeta {
  editStudentHandler?: (student: Student) => void;
  deleteStudentHandler?: (student: Student) => void;
  canManageStudents?: boolean;
  classCode?: string;
}

interface StudentDataTableProps<TData extends Student, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  canManage: boolean; // Can manage students in this specific class
  classCode: string; // To associate actions with the current class
  facultyCode: string; // Faculty code for API calls
  onDeleteStudent?: (student: TData) => void; // Callback for deleting single student
  onDeleteStudents?: (students: TData[]) => void; // Callback for bulk delete
}

export function StudentDataTable<TData extends Student, TValue>({
  columns: initialColumns,
  data: initialData,
  canManage,
  classCode,
  facultyCode,
  onDeleteStudent,
  onDeleteStudents,
}: StudentDataTableProps<TData, TValue>) {
  const [tableData, setTableData] = React.useState<TData[]>(initialData);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  
  // State for delete confirmation
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = React.useState(false);
  const [studentToDelete, setStudentToDelete] = React.useState<TData | undefined>(undefined);
  const [isBulkDeleteConfirmOpen, setIsBulkDeleteConfirmOpen] = React.useState(false);

  React.useEffect(() => {
    setTableData(initialData);
  }, [initialData]);

  // Handler functions
  const editStudentHandler = (student: TData) => {
    console.log("Editing student:", student, "in class:", classCode);
    alert(`Sửa sinh viên: ${student.full_name} (chức năng đang phát triển)`);
  };

  const deleteStudentHandler = (student: TData) => {
    setStudentToDelete(student);
    setIsDeleteConfirmOpen(true);
  };

  const confirmDeleteStudent = () => {
    if (studentToDelete) {
      onDeleteStudent?.(studentToDelete);
    }
    setIsDeleteConfirmOpen(false);
    setStudentToDelete(undefined);
  };

  const handleBulkDelete = () => {
    const selectedStudents = table.getFilteredSelectedRowModel().rows.map(row => row.original);
    if (selectedStudents.length > 0) {
      setIsBulkDeleteConfirmOpen(true);
    }
  };

  const confirmBulkDelete = () => {
    const selectedStudents = table.getFilteredSelectedRowModel().rows.map(row => row.original);
    if (selectedStudents.length > 0) {
      onDeleteStudents?.(selectedStudents);
      setRowSelection({});
    }
    setIsBulkDeleteConfirmOpen(false);
  };
  
  const columns = React.useMemo(() => {
    if (!canManage) {
      return initialColumns.filter(col => (col as any).id !== 'actions');
    }
    return initialColumns;
  }, [initialColumns, canManage]);

  const table = useReactTable({
    data: tableData,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
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
      editStudentHandler,
      deleteStudentHandler,
      canManageStudents: canManage,
      classCode: classCode,
    } as any,
  });

  return (
    <div className="w-full mt-6">
      <div className="flex items-center py-4">
        <Input
          placeholder="Lọc theo tên sinh viên..."
          value={(table.getColumn("full_name")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("full_name")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
        <div className="ml-auto flex items-center gap-2">
          {canManage && table.getFilteredSelectedRowModel().rows.length > 0 && (
            <Button
              variant="destructive"
              size="sm"
              onClick={handleBulkDelete}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Xóa {table.getFilteredSelectedRowModel().rows.length} sinh viên
            </Button>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                Cột hiển thị
              </Button>
            </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                  >
                    {column.id === "select" ? "Chọn" :
                     column.id === "student_code" ? "MSSV" :
                     column.id === "full_name" ? "Họ và Tên" :
                     column.id === "gender" ? "Giới tính" :
                     column.id === "date_of_birth" ? "Ngày sinh" :
                     column.id === "email" ? "Email" :
                     column.id === "actions" ? "Hành động" :
                     column.id}
                  </DropdownMenuCheckboxItem>
                );
              })}
          </DropdownMenuContent>
        </DropdownMenu>
        </div>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
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
                  data-state={row.getIsSelected() && "selected"}
                >
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
                  Không có sinh viên trong lớp này.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} của{" "}
          {table.getFilteredRowModel().rows.length} dòng được chọn.
        </div>
        <div className="space-x-2">
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
      
      {/* Delete single student dialog */}
      <ConfirmDeleteDialog
        open={isDeleteConfirmOpen}
        onOpenChange={setIsDeleteConfirmOpen}
        onConfirm={confirmDeleteStudent}
        title="Xác nhận xóa sinh viên"
        description={`Bạn có chắc chắn muốn xóa sinh viên ${studentToDelete?.full_name || ''} (${studentToDelete?.student_code || ''}) khỏi lớp ${classCode}?`}
        confirmButtonText="Xóa sinh viên"
      />
      
      {/* Bulk delete dialog */}
      <ConfirmDeleteDialog
        open={isBulkDeleteConfirmOpen}
        onOpenChange={setIsBulkDeleteConfirmOpen}
        onConfirm={confirmBulkDelete}
        title="Xác nhận xóa nhiều sinh viên"
        description={`Bạn có chắc chắn muốn xóa ${table.getFilteredSelectedRowModel().rows.length} sinh viên được chọn khỏi lớp ${classCode}?`}
        confirmButtonText="Xóa các sinh viên"
      />
    </div>
  );
} 