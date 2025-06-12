"use client";

import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
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
import { Checkbox } from "@/components/ui/checkbox";
import { useUpdateCreditClass } from "@/hooks/use-credit-classes";
import { type UpdateCreditClassRequest, type CreditClassDetailResponse } from "@/services/credit-class-service";
import { CourseSearchCombobox } from "@/components/ui/course-search-combobox";
import { LecturerSearchCombobox } from "@/components/features/lecturers/lecturer-search-combobox";

const editCreditClassSchema = z.object({
  courseCode: z.string().min(1, "Mã môn học là bắt buộc"),
  groupNumber: z.coerce.number().min(1, "Số nhóm phải lớn hơn 0"),
  semester: z.coerce.number().min(1).max(3, "Học kỳ phải từ 1 đến 3"),
  minStudent: z.coerce.number().min(1, "Sĩ số tối thiểu phải lớn hơn 0"),
  lecturerCode: z.string().min(1, "Mã giảng viên là bắt buộc"),
  academicYearCode: z.string().min(1, "Mã năm học là bắt buộc"),
  isCancelled: z.boolean(),
});

type EditCreditClassFormValues = z.infer<typeof editCreditClassSchema>;

interface EditCreditClassDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  facultyCode: string;
  creditClass: CreditClassDetailResponse | null;
}

export function EditCreditClassDialog({
  open,
  onOpenChange,
  facultyCode,
  creditClass,
}: EditCreditClassDialogProps) {
  const form = useForm<EditCreditClassFormValues>({
    resolver: zodResolver(editCreditClassSchema),
    defaultValues: {
      courseCode: "",
      groupNumber: 1,
      semester: 1,
      minStudent: 30,
      lecturerCode: "",
      academicYearCode: "",
      isCancelled: false,
    },
  });

  const updateCreditClassMutation = useUpdateCreditClass(
    facultyCode, 
    creditClass?.creditClassId || 0, 
    {
      onSuccess: () => {
        onOpenChange(false);
      },
    }
  );

  // Reset form with credit class data when dialog opens
  useEffect(() => {
    if (open && creditClass) {
      form.reset({
        courseCode: creditClass.courseCode,
        groupNumber: creditClass.groupNumber,
        semester: creditClass.semester,
        minStudent: creditClass.minStudent,
        lecturerCode: creditClass.lecturerCode,
        academicYearCode: creditClass.academicYear,
        isCancelled: false, // Default giá trị, backend sẽ xử lý
      });
    }
  }, [open, creditClass, form]);

  // Don't render dialog if creditClass is null
  if (!creditClass) {
    return null;
  }

  const onSubmit = async (values: EditCreditClassFormValues) => {
    if (!creditClass) return;
    
    console.log('Form values:', values);
    
    const requestData: UpdateCreditClassRequest = {
      courseCode: values.courseCode,
      groupNumber: values.groupNumber,
      semester: values.semester,
      minStudent: values.minStudent,
      lecturerCode: values.lecturerCode,
      academicYearCode: values.academicYearCode,
      isCancelled: values.isCancelled,
    };
    
    await updateCreditClassMutation.mutateAsync(requestData);
  };

  const handleCancel = () => {
    form.reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Sửa thông tin lớp tín chỉ {creditClass ? `${creditClass.courseCode}.${creditClass.groupNumber}` : ''}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="courseCode"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Mã môn học <span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <CourseSearchCombobox
                        value={field.value}
                        onValueChange={field.onChange}
                        placeholder="Tìm và chọn môn học..."
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="lecturerCode"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Giảng viên <span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <LecturerSearchCombobox
                        value={field.value}
                        onValueChange={field.onChange}
                        placeholder="Tìm và chọn giảng viên..."
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="groupNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Số nhóm <span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <Input 
                        type="number"
                        min="1"
                        placeholder="1"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="semester"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Học kỳ <span className="text-red-500">*</span></FormLabel>
                    <Select onValueChange={field.onChange} value={field.value?.toString()}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Chọn học kỳ" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="1">Học kỳ 1</SelectItem>
                        <SelectItem value="2">Học kỳ 2</SelectItem>
                        <SelectItem value="3">Học kỳ 3</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="minStudent"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sĩ số tối thiểu <span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <Input 
                        type="number"
                        min="1"
                        placeholder="30"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="academicYearCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mã năm học <span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Ví dụ: 2023-2024"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isCancelled"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        Đã hủy lớp tín chỉ
                      </FormLabel>
                      <p className="text-sm text-muted-foreground">
                        Đánh dấu nếu lớp tín chỉ này đã bị hủy
                      </p>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={updateCreditClassMutation.isPending}
              >
                Hủy
              </Button>
              <Button 
                type="submit"
                disabled={updateCreditClassMutation.isPending}
              >
                {updateCreditClassMutation.isPending ? "Đang cập nhật..." : "Cập nhật"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
} 