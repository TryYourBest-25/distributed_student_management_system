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
import { PlusCircle } from "lucide-react";
import { useRouter } from "next/navigation";

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
import { AppTableMeta } from "@/types/table";
import { ClassFormDialog } from "./class-form-dialog";
import { Class } from "@/types/class";
import { ClassFormValues } from "@/lib/validators/class-validator";
import { DeleteClassesDialog } from "./delete-classes-dialog";
import { type ClassApiResponse } from "@/services/class-service";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// Re-export Class as ClassInfo for backward compatibility
export type ClassInfo = Class;

// Helper function to transform Class to ClassApiResponse
const transformToClassApiResponse = (classInfo: Class): ClassApiResponse => {
  return {
    classCode: classInfo.class_code,
    className: classInfo.class_name,
    facultyCode: classInfo.faculty_code,
    facultyName: classInfo.faculty_name,
    studentCount: classInfo.student_count,
    academicYearCode: classInfo.academic_year_code,
  };
};

interface ClassDataTableProps<TData extends Class, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  canManage: boolean;
  facultyCode: string;
  availableFaculties?: { value: string; label: string }[]; // For form if needed
  onSaveClass?: (values: ClassFormValues) => Promise<void>;
  onDeleteClass?: (classInfo: TData) => Promise<void>;
}

export function ClassDataTable<TData extends ClassInfo, TValue>({
  columns: initialColumns,
  data: initialData,
  canManage,
  facultyCode,
  availableFaculties,
  onSaveClass,
  onDeleteClass,
}: ClassDataTableProps<TData, TValue>) {
  const [tableData, setTableData] = React.useState<TData[]>(initialData);
  const router = useRouter();
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

  // State for modals
  const [isFormModalOpen, setIsFormModalOpen] = React.useState(false);
  const [selectedClass, setSelectedClass] = React.useState<TData | undefined>(undefined);
  const [isFormLoading, setIsFormLoading] = React.useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [classToDelete, setClassToDelete] = React.useState<TData | null>(null);

  React.useEffect(() => {
    setTableData(initialData);
  }, [initialData]);

  // Form handlers
  const handleSaveClass = async (values: ClassFormValues) => {
    if (!onSaveClass) return;
    
    try {
      setIsFormLoading(true);
      await onSaveClass(values);
      setIsFormModalOpen(false);
      setSelectedClass(undefined);
    } catch (error) {
      console.error("Error saving class:", error);
    } finally {
      setIsFormLoading(false);
    }
  };

  const deleteHandler = (classInfo: TData) => {
    setClassToDelete(classInfo);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (classToDelete && onDeleteClass) {
      try {
        await onDeleteClass(classToDelete);
        setDeleteDialogOpen(false);
        setClassToDelete(null);
      } catch (error) {
        console.error('Delete failed:', error);
      }
    }
  };
  
  const columns = React.useMemo(() => {
    // Filter out actions column if user cannot manage
    if (!canManage) {
      return initialColumns.filter(col => (col as any).id !== 'actions');
    }
    return initialColumns;
  }, [initialColumns, canManage]);

  const table = useReactTable({
    data: tableData,
    columns,
    enableRowSelection: true,
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
      deleteHandler,
      viewDetailsHandler: (classInfo: TData) => {
        router.push(`/classes/${classInfo.id}`);
      },
      canManage,
    } as AppTableMeta<TData>,
  });

  return (
    <div className="w-full rounded-md border bg-card shadow-sm">
      <div className="flex items-center justify-between p-4 border-b">
        <Input
          placeholder="Lọc theo tên lớp..."
          value={(table.getColumn("class_name")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("class_name")?.setFilterValue(event.target.value)
          }
          className="max-w-sm h-9"
        />
        <div className="flex items-center space-x-2">
          {canManage && table.getFilteredSelectedRowModel().rows.length > 0 && (
            <DeleteClassesDialog
              facultyCode={facultyCode}
              classes={table.getFilteredSelectedRowModel().rows.map(row => transformToClassApiResponse(row.original))}
              onSuccess={() => {
                table.resetRowSelection();
                // Refresh data would be handled by React Query invalidation
              }}
            />
          )}
          {canManage && (
            <Button
              size="sm" className="h-9"
              onClick={() => {
                setSelectedClass(undefined);
                setIsFormModalOpen(true);
              }}
            >
              <PlusCircle className="mr-2 h-4 w-4" /> Thêm Lớp học
            </Button>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-9">
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
                       column.id === "class_code" ? "Mã Lớp" :
                       column.id === "class_name" ? "Tên Lớp" :
                       column.id === "faculty_name" ? "Khoa" :
                       column.id === "academic_year" ? "Niên khóa" :
                       column.id === "homeroom_lecturer_name" ? "GVCN" :
                       column.id === "student_count" ? "Sĩ số" :
                       column.id === "actions" ? "Hành động" :
                       column.id}
                    </DropdownMenuCheckboxItem>
                  );
                })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <div className="overflow-x-auto">
        <Table className="w-full">
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
                  // onClick={() => onRowClick?.(row.original)} // If row click is needed
                  // className={onRowClick ? "cursor-pointer" : ""}
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
            `Tổng số: ${table.getFilteredRowModel().rows.length} lớp học`
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
      
      <ClassFormDialog
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setSelectedClass(undefined);
        }}
        onSubmit={handleSaveClass}
        defaultValues={selectedClass ? {
          class_code: selectedClass.class_code,
          class_name: selectedClass.class_name,
          academic_year_code: selectedClass.academic_year_code,
        } : undefined}
        isLoading={isFormLoading}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa lớp học</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa lớp học "{classToDelete?.class_name}" (Mã: {classToDelete?.class_code})?
              Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setDeleteDialogOpen(false);
              setClassToDelete(null);
            }}>
              Hủy
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
} 