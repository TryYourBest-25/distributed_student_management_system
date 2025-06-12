'use client';

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

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
import { lecturerFormSchema, type LecturerFormValues } from "@/lib/validators/lecturer-validator";
import { Lecturer } from "@/types/lecturer";
import { Faculty } from "@/types/faculty";
import { useAuth } from "@/lib/providers/AuthProvider";
import { UserRole } from "@/types/auth";

interface LecturerFormProps {
  onSubmit: (values: LecturerFormValues) => Promise<void> | void;
  onCancel: () => void;
  defaultValues?: Partial<Lecturer>;
  isLoading?: boolean;
  availableFaculties: Faculty[];
  allowEditLecturerCode?: boolean;
}

export function LecturerForm({
  onSubmit,
  onCancel,
  defaultValues,
  isLoading,
  availableFaculties,
  allowEditLecturerCode = true,
}: LecturerFormProps) {
  const { user } = useAuth();
  const isPgv = user?.role === UserRole.PGV;

  const form = useForm<LecturerFormValues>({
    resolver: zodResolver(lecturerFormSchema),
    defaultValues: {
      lecturer_code: defaultValues?.lecturer_code || "",
      first_name: defaultValues?.first_name || "",
      last_name: defaultValues?.last_name || "",
      degree: defaultValues?.degree || "",
      academic_rank: defaultValues?.academic_rank || "",
      specialization: defaultValues?.specialization || "",
      faculty_code: defaultValues?.faculty_code || (isPgv && availableFaculties.length > 0 ? "" : user?.faculty_code || ""),
    },
  });

  const isEditing = !!defaultValues?.lecturer_code;

  React.useEffect(() => {
    if (defaultValues) {
      form.reset({
        lecturer_code: defaultValues.lecturer_code || "",
        first_name: defaultValues.first_name || "",
        last_name: defaultValues.last_name || "",
        degree: defaultValues.degree || "",
        academic_rank: defaultValues.academic_rank || "",
        specialization: defaultValues.specialization || "",
        faculty_code: defaultValues.faculty_code || (isPgv && availableFaculties.length > 0 ? "" : user?.faculty_code || ""),
      });
    }
  }, [defaultValues, form, isPgv, availableFaculties, user?.faculty_code]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="lecturer_code"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Mã giảng viên</FormLabel>
              <FormControl>
                <Input 
                  placeholder="VD: GV001" 
                  {...field} 
                  disabled={isLoading || !allowEditLecturerCode}
                  style={{ textTransform: 'uppercase' }}
                  onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                />
              </FormControl>
              <FormDescription>
                {allowEditLecturerCode 
                  ? "Mã giảng viên (chỉ chữ cái in hoa và số)."
                  : "Mã giảng viên không thể thay đổi."
                }
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="first_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tên</FormLabel>
                <FormControl>
                  <Input placeholder="VD: Văn An" {...field} disabled={isLoading} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="last_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Họ</FormLabel>
                <FormControl>
                  <Input placeholder="VD: Nguyễn" {...field} disabled={isLoading} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="degree"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Học vị</FormLabel>
                <FormControl>
                  <Input placeholder="VD: Tiến sĩ, Thạc sĩ" {...field} disabled={isLoading} />
                </FormControl>
                <FormDescription>
                  Học vị cao nhất đã đạt được (tùy chọn).
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="academic_rank"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Học hàm</FormLabel>
                <FormControl>
                  <Input placeholder="VD: Phó giáo sư, Giảng viên chính" {...field} disabled={isLoading} />
                </FormControl>
                <FormDescription>
                  Học hàm hiện tại (tùy chọn).
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="specialization"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Chuyên môn</FormLabel>
              <FormControl>
                <Input placeholder="VD: Khoa học máy tính, Điện tử viễn thông" {...field} disabled={isLoading} />
              </FormControl>
              <FormDescription>
                Lĩnh vực chuyên môn chính (tùy chọn).
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="faculty_code"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Khoa</FormLabel>
              <Select 
                onValueChange={field.onChange} 
                value={field.value}
                disabled={isLoading}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn khoa quản lý" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {availableFaculties.map((faculty) => (
                    <SelectItem key={faculty.faculty_code} value={faculty.faculty_code}>
                      {faculty.faculty_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>
                Khoa quản lý giảng viên.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-3 pt-4">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
            Hủy
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Đang lưu..." : "Lưu thay đổi"}
          </Button>
        </div>
      </form>
    </Form>
  );
} 