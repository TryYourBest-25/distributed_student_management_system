"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Student } from "./student-data-table"; // Assuming Student is exported from here
// import { DatePicker } from "@/components/ui/date-picker"; // If a custom date picker is available

export const studentFormSchema = z.object({
  student_code: z.string().min(1, { message: "Mã số sinh viên không được để trống." })
    .regex(/^[0-9]+$/, { message: "MSSV chỉ chứa số."}), // Adjust regex if needed
  full_name: z.string().min(1, { message: "Họ và tên không được để trống." }),
  gender: z.enum(["Nam", "Nữ", "Khác"], { required_error: "Vui lòng chọn giới tính." }),
  date_of_birth: z.string()
    .min(1, { message: "Ngày sinh không được để trống." })
    .regex(/^\d{4}-\d{2}-\d{2}$/, { message: "Ngày sinh phải có dạng YYYY-MM-DD."}), // Basic format, consider a date picker
  email: z.string().email({ message: "Địa chỉ email không hợp lệ." }).optional().or(z.literal('')),
  phone_number: z.string().optional().or(z.literal('')),
  // class_code is usually contextual and not part of this specific form unless adding a new student to ANY class
  // If adding to a specific class, class_code is passed separately.
});

export type StudentFormValues = z.infer<typeof studentFormSchema>;

interface StudentFormProps {
  onSubmit: (values: StudentFormValues, studentId?: string) => void;
  onCancel: () => void;
  defaultValues?: Partial<Student>; // Student type from student-data-table
  isLoading?: boolean;
  // classCode?: string; // Contextual class code, might not be needed if form is only for a specific class
}

export function StudentForm({
  onSubmit,
  onCancel,
  defaultValues,
  isLoading,
}: StudentFormProps) {
  const form = useForm<StudentFormValues>({
    resolver: zodResolver(studentFormSchema),
    defaultValues: {
      student_code: defaultValues?.student_code || "",
      full_name: defaultValues?.full_name || "",
      gender: defaultValues?.gender || undefined,
      date_of_birth: defaultValues?.date_of_birth || "",
      email: defaultValues?.email || "",
      phone_number: defaultValues?.phone_number || "",
    },
  });

  const currentStudentId = defaultValues?.id;

  const handleSubmit = (values: StudentFormValues) => {
    onSubmit(values, currentStudentId);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="student_code"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Mã số sinh viên (MSSV)</FormLabel>
              <FormControl>
                <Input placeholder="VD: 2001200001" {...field} disabled={!!defaultValues?.student_code} />
              </FormControl>
              <FormDescription>MSSV không thể thay đổi sau khi tạo.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="full_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Họ và tên</FormLabel>
              <FormControl>
                <Input placeholder="VD: Nguyễn Văn An" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField
            control={form.control}
            name="gender"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Giới tính</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                    <SelectTrigger>
                        <SelectValue placeholder="Chọn giới tính" />
                    </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                    <SelectItem value="Nam">Nam</SelectItem>
                    <SelectItem value="Nữ">Nữ</SelectItem>
                    <SelectItem value="Khác">Khác</SelectItem>
                    </SelectContent>
                </Select>
                <FormMessage />
                </FormItem>
            )}
            />
            <FormField
            control={form.control}
            name="date_of_birth"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Ngày sinh</FormLabel>
                <FormControl>
                    {/* Consider using a Shadcn/UI DatePicker component here if available */}
                    <Input type="date" placeholder="YYYY-MM-DD" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
        </div>
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email (tùy chọn)</FormLabel>
              <FormControl>
                <Input type="email" placeholder="VD: nva@email.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="phone_number"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Số điện thoại (tùy chọn)</FormLabel>
              <FormControl>
                <Input placeholder="VD: 09xxxxxxxx" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
            Hủy
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Đang lưu..." : defaultValues?.id ? "Lưu Sinh viên" : "Thêm Sinh viên"}
          </Button>
        </div>
      </form>
    </Form>
  );
} 