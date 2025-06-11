"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { RegistrationBasicResponse } from "@/services/student-service";

export const registrationColumns: ColumnDef<RegistrationBasicResponse>[] = [
  {
    accessorKey: "courseCode",
    header: "Mã môn học",
    cell: ({ row }) => {
      return (
        <div className="font-medium">
          {row.getValue("courseCode")}
        </div>
      );
    },
  },
  {
    accessorKey: "groupNumber",
    header: "Nhóm",
    cell: ({ row }) => {
      return (
        <div className="text-center">
          {row.getValue("groupNumber")}
        </div>
      );
    },
  },
  {
    accessorKey: "academicYear",
    header: "Năm học",
    cell: ({ row }) => {
      return (
        <div className="text-center">
          {row.getValue("academicYear")}
        </div>
      );
    },
  },
  {
    accessorKey: "semester",
    header: "Học kỳ",
    cell: ({ row }) => {
      return (
        <div className="text-center">
          HK {row.getValue("semester")}
        </div>
      );
    },
  },
  {
    accessorKey: "currentStudent",
    header: "Sĩ số",
    cell: ({ row }) => {
      const current = row.getValue("currentStudent") as number;
      const min = row.original.minStudent;
      
      return (
        <div className="text-center">
          <span className={`font-medium ${current >= min ? 'text-green-600' : 'text-orange-600'}`}>
            {current}
          </span>
          <span className="text-gray-500">/{min}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "isCancelled",
    header: "Trạng thái",
    cell: ({ row }) => {
      const isCancelled = row.getValue("isCancelled") as boolean;
      
      return (
        <div className="text-center">
          <Badge 
            variant={isCancelled ? "destructive" : "default"}
            className={isCancelled ? "" : "bg-green-100 text-green-800 hover:bg-green-200"}
          >
            {isCancelled ? "Đã hủy" : "Đã đăng ký"}
          </Badge>
        </div>
      );
    },
  },
]; 