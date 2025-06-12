"use client";

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
import { classFormSchema, type ClassFormValues } from "@/lib/validators/class-validator";

interface ClassFormProps {
  onSubmit: (values: ClassFormValues) => Promise<void> | void;
  onCancel: () => void;
  defaultValues?: Partial<ClassFormValues>;
  isLoading?: boolean;
  allowEditClassCode?: boolean;
}

export function ClassForm({
  onSubmit,
  onCancel,
  defaultValues,
  isLoading,
  allowEditClassCode = true,
}: ClassFormProps) {
  const form = useForm<ClassFormValues>({
    resolver: zodResolver(classFormSchema),
    defaultValues: {
      class_code: defaultValues?.class_code || "",
      class_name: defaultValues?.class_name || "",
      academic_year_code: defaultValues?.academic_year_code || "",
    },
  });

  const isEditing = !!defaultValues?.class_code;

  React.useEffect(() => {
    if (defaultValues) {
      form.reset({
        class_code: defaultValues.class_code || "",
        class_name: defaultValues.class_name || "",
        academic_year_code: defaultValues.academic_year_code || "",
      });
    }
  }, [defaultValues, form]);

  // Auto-generate class code based on academic year
  const watchedAcademicYear = form.watch("academic_year_code");
  React.useEffect(() => {
    if (watchedAcademicYear && !isEditing && allowEditClassCode) {
      const yearMatch = watchedAcademicYear.match(/^(\d{4})-/);
      if (yearMatch) {
        const fullYear = yearMatch[1]; // năm đầy đủ (2022)
        const yearSuffix = fullYear.slice(-2); // 2 số cuối (22)
        const suggestion = `D${yearSuffix}CQ`; // D22CQ để user tự điền phần sau
        
        // Chỉ update khi field trống hoặc chưa có đủ format
        const currentCode = form.getValues("class_code");
        if (!currentCode || !currentCode.startsWith(`D${yearSuffix}CQ`)) {
          form.setValue("class_code", suggestion);
          
          // Focus vào cuối field để user tiếp tục nhập
          setTimeout(() => {
            const classCodeInput = document.querySelector('input[name="class_code"]') as HTMLInputElement;
            if (classCodeInput) {
              classCodeInput.focus();
              classCodeInput.setSelectionRange(suggestion.length, suggestion.length);
            }
          }, 100);
        }
      }
    }
  }, [watchedAcademicYear, form, isEditing, allowEditClassCode]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="academic_year_code"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Niên khóa</FormLabel>
              <FormControl>
                <Input 
                  placeholder="VD: 2022-2026" 
                  {...field} 
                  disabled={isLoading}
                />
              </FormControl>
              <FormDescription>
                Niên khóa theo định dạng YYYY-YYYY (năm bắt đầu - năm kết thúc).
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="class_code"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Mã lớp</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Sẽ tự động điền D22CQ khi nhập niên khóa..." 
                  {...field} 
                  disabled={isLoading || !allowEditClassCode}
                  style={{ textTransform: 'uppercase' }}
                  onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                />
              </FormControl>
              <FormDescription>
                {allowEditClassCode 
                  ? "Tiếp tục nhập phần sau: CN01, IT02, v.v. (định dạng: DxxCQyyZZ)"
                  : "Mã lớp không thể thay đổi."
                }
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="class_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tên lớp</FormLabel>
              <FormControl>
                <Input 
                  placeholder="VD: Đại học CNTT Khóa 2022 - Nhóm 1" 
                  {...field} 
                  disabled={isLoading} 
                />
              </FormControl>
              <FormDescription>
                Tên đầy đủ của lớp học.
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