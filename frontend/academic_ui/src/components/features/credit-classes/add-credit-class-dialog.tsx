"use client";

import { useState } from "react";
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
import { useCreateCreditClass } from "@/hooks/use-credit-classes";
import { type CreateCreditClassRequest } from "@/services/credit-class-service";
import { CourseSearchCombobox } from "@/components/ui/course-search-combobox";
import { LecturerSearchCombobox } from "@/components/features/lecturers/lecturer-search-combobox";

const addCreditClassSchema = z.object({
  courseCode: z.string().min(1, "Mã môn học là bắt buộc"),
  groupNumber: z.coerce.number().min(1, "Số nhóm phải lớn hơn 0"),
  semester: z.coerce.number().min(1).max(3, "Học kỳ phải từ 1 đến 3"),
  minStudent: z.coerce.number().min(1, "Sĩ số tối thiểu phải lớn hơn 0"),
  lecturerCode: z.string().min(1, "Mã giảng viên là bắt buộc"),
  academicYearCode: z.string().min(1, "Mã năm học là bắt buộc"),
});

type AddCreditClassFormValues = z.infer<typeof addCreditClassSchema>;

interface AddCreditClassDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  facultyCode: string;
  servicePath: string;
}

export function AddCreditClassDialog({
  open,
  onOpenChange,
  facultyCode,
  servicePath,
}: AddCreditClassDialogProps) {
  const form = useForm<AddCreditClassFormValues>({
    resolver: zodResolver(addCreditClassSchema),
    defaultValues: {
      courseCode: "",
      groupNumber: 1,
      semester: 1,
      minStudent: 30,
      lecturerCode: "",
      academicYearCode: "",
    },
  });

  const createCreditClassMutation = useCreateCreditClass(facultyCode, servicePath, {
    onSuccess: () => {
      form.reset();
      onOpenChange(false);
    },
  });

  const onSubmit = async (values: AddCreditClassFormValues) => {
    console.log('Form values:', values);
    
    const requestData: CreateCreditClassRequest = {
      courseCode: values.courseCode,
      groupNumber: values.groupNumber,
      semester: values.semester,
      minStudent: values.minStudent,
      lecturerCode: values.lecturerCode,
      academicYearCode: values.academicYearCode,
    };
    
    await createCreditClassMutation.mutateAsync(requestData);
  };

  const handleCancel = () => {
    form.reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Thêm Lớp tín chỉ mới</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="courseCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mã môn học <span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <CourseSearchCombobox
                        value={field.value}
                        onValueChange={field.onChange}
                        placeholder="Tìm kiếm mã môn học..."
                        disabled={createCreditClassMutation.isPending}
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
                  <FormItem>
                    <FormLabel>Giảng viên <span className="text-red-500">*</span></FormLabel>
                    <FormControl>
                      <LecturerSearchCombobox
                        value={field.value}
                        onValueChange={field.onChange}
                        placeholder="Tìm kiếm giảng viên..."
                        disabled={createCreditClassMutation.isPending}
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
                    <Select onValueChange={field.onChange} defaultValue={field.value?.toString()}>
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
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={createCreditClassMutation.isPending}
              >
                Hủy
              </Button>
              <Button 
                type="submit"
                disabled={createCreditClassMutation.isPending}
              >
                {createCreditClassMutation.isPending ? "Đang xử lý..." : "Thêm lớp tín chỉ"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
} 