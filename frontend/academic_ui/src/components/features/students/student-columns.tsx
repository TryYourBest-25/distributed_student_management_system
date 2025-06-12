"use client";

import { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { ArrowUpDown, MoreHorizontal, Edit, Trash2, Eye } from "lucide-react";
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
import { Student } from "./student-data-table"; // Will be defined and exported here
import { Badge } from "@/components/ui/badge"; // For gender or status

// This function can accept props if needed, e.g., for role-based actions or specific class context
export const columns = (
  // props: { canManage: boolean; classCode: string; ... }
): ColumnDef<Student>[] => [
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
    accessorKey: "student_code",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          MSSV
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => (
      <Link 
        href={`/students/${row.getValue("student_code")}`}
        className="font-medium text-blue-600 hover:text-blue-800 hover:underline"
      >
        {row.getValue("student_code")}
      </Link>
    ),
  },
  {
    accessorKey: "full_name",
    header: "Họ và Tên",
  },
  {
    accessorKey: "gender",
    header: "Giới tính",
    cell: ({ row }) => {
      const gender = row.getValue("gender") as string;
      return <Badge variant={gender === "Nam" ? "default" : gender === "Nữ" ? "secondary" : "outline"}>{gender}</Badge>;
    },
  },
  {
    accessorKey: "date_of_birth",
    header: "Ngày sinh",
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => row.getValue("email") || <span className="text-xs italic text-muted-foreground">Chưa có</span>,
  },
  {
    id: "actions",
    cell: ({ row, table }) => {
      const student = row.original;
      const meta = table.options.meta as any;
      // if (!meta?.canManageStudents) return null;

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
            <DropdownMenuItem onClick={() => navigator.clipboard.writeText(student.student_code)}>
              Sao chép MSSV
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href={`/students/${student.student_code}`} className="flex items-center">
                <Eye className="mr-2 h-4 w-4" /> Xem chi tiết
              </Link>
            </DropdownMenuItem>
            {meta?.canManageStudents && (
              <>
                <DropdownMenuItem onClick={() => meta?.editStudentHandler?.(student)}>
                  <Edit className="mr-2 h-4 w-4" /> Sửa thông tin SV
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => meta?.deleteStudentHandler?.(student)} className="text-red-600">
                  <Trash2 className="mr-2 h-4 w-4" /> Xóa SV khỏi lớp
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
    enableSorting: false,
    enableHiding: true,
  },
]; 