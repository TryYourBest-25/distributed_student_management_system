"use client";

import { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { ArrowUpDown, MoreHorizontal, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { Class } from "@/types/class";

export type ClassColumnsProps = {
  canManage: boolean;
  // onEdit: (classInfo: Class) => void; // Example for future use
  // onDelete: (classInfo: Class) => void; // Example for future use
};

// This function can accept props if needed, e.g., for role-based actions
export const columns = (
  // props: ClassColumnsProps
): ColumnDef<Class>[] => [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "class_code",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Mã Lớp
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const classInfo = row.original;
      return (
        <Link href={`/classes/${classInfo.class_code}`} className="font-medium hover:underline">
          {classInfo.class_code}
        </Link>
      );
    },
  },
  {
    accessorKey: "class_name",
    header: "Tên Lớp",
  },
  {
    accessorKey: "faculty_name",
    header: "Khoa Quản lý",
  },
  {
    accessorKey: "academic_year_code",
    header: "Niên khóa",
  },
  {
    accessorKey: "student_count",
    header: "Sĩ số",
  },
  {
    id: "actions",
    cell: ({ row, table }) => {
      const classInfo = row.original;
      const meta = table.options.meta as any;
      // if (!meta?.canManage) return null; // Conditionally render actions

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Mở menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Hành động</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => navigator.clipboard.writeText(classInfo.id)}>
              Sao chép ID Lớp
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {meta?.canManage && (
              <>
                <DropdownMenuItem onClick={() => meta?.editHandler?.(classInfo)}>
                  <Edit className="mr-2 h-4 w-4" /> Sửa
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => meta?.deleteHandler?.(classInfo)} className="text-red-600">
                  <Trash2 className="mr-2 h-4 w-4" /> Xóa
                </DropdownMenuItem>
              </>
            )}
            <DropdownMenuItem asChild>
              <Link href={`/classes/${classInfo.class_code}`} className="flex items-center w-full">
                    Xem chi tiết
              </Link>
                </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
    enableSorting: false,
    enableHiding: true, // Allow hiding actions column if needed
  },
]; 