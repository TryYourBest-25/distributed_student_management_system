"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, UserPlus } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { StudentSearchCombobox } from "@/components/features/students/student-search-combobox";
import { useAddStudentToCreditClass } from "@/hooks/use-credit-classes";

const addStudentSchema = z.object({
  studentCode: z.string().min(1, "Vui lòng chọn sinh viên"),
});

type AddStudentForm = z.infer<typeof addStudentSchema>;

interface AddStudentToCreditClassDialogProps {
  facultyCode: string;
  creditClassId: number;
  courseCode: string;
  groupNumber: number;
  children?: React.ReactNode;
}

export function AddStudentToCreditClassDialog({
  facultyCode,
  creditClassId,
  courseCode,
  groupNumber,
  children,
}: AddStudentToCreditClassDialogProps) {
  const [open, setOpen] = useState(false);

  const form = useForm<AddStudentForm>({
    resolver: zodResolver(addStudentSchema),
    defaultValues: {
      studentCode: "",
    },
  });

  const addStudentMutation = useAddStudentToCreditClass(
    facultyCode,
    creditClassId,
    {
      onSuccess: () => {
        setOpen(false);
        form.reset();
      },
    }
  );

  const onSubmit = async (data: AddStudentForm) => {
    addStudentMutation.mutate(data.studentCode);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="outline" size="sm">
            <UserPlus className="mr-2 h-4 w-4" />
            Thêm sinh viên
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Thêm sinh viên vào lớp tín chỉ</DialogTitle>
          <DialogDescription>
            Thêm sinh viên vào lớp tín chỉ {courseCode}.{groupNumber}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="studentCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mã sinh viên</FormLabel>
                  <FormControl>
                    <StudentSearchCombobox
                      facultyCode={facultyCode}
                      value={field.value}
                      onValueChange={field.onChange}
                      placeholder="Nhập mã sinh viên để tìm kiếm..."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={addStudentMutation.isPending}
              >
                Hủy
              </Button>
              <Button 
                type="submit" 
                disabled={addStudentMutation.isPending}
              >
                {addStudentMutation.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Thêm sinh viên
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
} 