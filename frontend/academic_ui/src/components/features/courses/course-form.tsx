'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
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

// Định nghĩa schema validation cho form môn học
const courseFormSchema = z.object({
  course_code: z.string()
    .trim()
    .min(1, { message: "Mã môn học không được để trống." })
    .max(20, { message: "Mã môn học không được quá 20 ký tự." })
    .regex(/^[A-Z0-9]+$/, { message: "Mã môn học chỉ được chứa chữ cái in hoa và số." }),
  course_name: z.string()
    .trim()
    .min(1, { message: "Tên môn học không được để trống." })
    .max(50, { message: "Tên môn học không được quá 50 ký tự." }),
  lecture_credit: z.coerce.number()
    .int({ message: "Số tín chỉ lý thuyết phải là số nguyên." })
    .min(0, { message: "Số tín chỉ lý thuyết không được âm." })
    .max(10, { message: "Số tín chỉ lý thuyết không được quá 10." }),
  lab_credit: z.coerce.number()
    .int({ message: "Số tín chỉ thực hành phải là số nguyên." })
    .min(0, { message: "Số tín chỉ thực hành không được âm." })
    .max(10, { message: "Số tín chỉ thực hành không được quá 10." }),
});

export type CourseFormValues = z.infer<typeof courseFormSchema>;

interface CourseFormProps {
  onSubmit: (values: CourseFormValues) => void; // Hàm xử lý khi submit form
  onCancel?: () => void; // Hàm xử lý khi hủy
  defaultValues?: Partial<CourseFormValues>; // Giá trị mặc định cho form (dùng cho edit)
  isLoading?: boolean; // Trạng thái loading cho nút submit
  allowEditCourseCode?: boolean; // Cho phép chỉnh sửa mã môn học (mặc định: true)
}

export const CourseForm: React.FC<CourseFormProps> = ({ 
  onSubmit, 
  onCancel, 
  defaultValues, 
  isLoading,
  allowEditCourseCode = true
}) => {
  const form = useForm<CourseFormValues>({
    resolver: zodResolver(courseFormSchema),
    defaultValues: defaultValues || {
      course_code: '',
      course_name: '',
      lecture_credit: 0,
      lab_credit: 0,
    },
  });

  const handleSubmit = (values: CourseFormValues) => {
    onSubmit(values);
    // form.reset(); // Reset form sau khi submit thành công nếu cần
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="course_code"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base font-medium">Mã Môn Học</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Ví dụ: IT001" 
                    {...field} 
                    disabled={isLoading || !allowEditCourseCode}
                    className="h-12 text-base"
                    style={{ textTransform: 'uppercase' }}
                    onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                  />
                </FormControl>
                <FormDescription>
                  {allowEditCourseCode 
                    ? "Mã định danh cho môn học (chỉ chữ cái in hoa và số)."
                    : "Mã môn học không thể thay đổi."
                  }
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="course_name"
            render={({ field }) => (
              <FormItem className="lg:col-span-2">
                <FormLabel className="text-base font-medium">Tên Môn Học</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Ví dụ: Lập trình Java" 
                    {...field} 
                    disabled={isLoading}
                    className="h-12 text-base"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="lecture_credit"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base font-medium">Số Tín Chỉ Lý Thuyết</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      placeholder="0" 
                      {...field} 
                      disabled={isLoading}
                      className="h-12 text-base"
                      min="0"
                      max="10"
                    />
                  </FormControl>
                  <FormDescription>
                    Số tín chỉ lý thuyết (0-10).
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="lab_credit"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base font-medium">Số Tín Chỉ Thực Hành</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      placeholder="0" 
                      {...field} 
                      disabled={isLoading}
                      className="h-12 text-base"
                      min="0"
                      max="10"
                    />
                  </FormControl>
                  <FormDescription>
                    Số tín chỉ thực hành (0-10).
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
        </div>

        <div className="flex justify-end space-x-4 pt-6">
          {onCancel && (
            <Button 
              type="button" 
              variant="outline" 
              onClick={onCancel} 
              disabled={isLoading}
              size="lg"
            >
              Hủy
            </Button>
          )}
          <Button type="submit" disabled={isLoading} size="lg">
            {isLoading ? 'Đang xử lý...' : (defaultValues ? 'Lưu thay đổi' : 'Thêm Môn học')}
          </Button>
        </div>
      </form>
    </Form>
  );
}; 