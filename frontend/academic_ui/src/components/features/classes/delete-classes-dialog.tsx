"use client";

import { useState } from "react";
import { Loader2, Trash2, AlertTriangle } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useDeleteClasses } from "@/hooks/use-classes";
import { type ClassApiResponse } from "@/services/class-service";

interface DeleteClassesDialogProps {
  facultyCode: string;
  classes: ClassApiResponse[];
  onSuccess?: () => void;
  children?: React.ReactNode;
}

export function DeleteClassesDialog({
  facultyCode,
  classes,
  onSuccess,
  children,
}: DeleteClassesDialogProps) {
  const [open, setOpen] = useState(false);
  const count = classes.length;

  const deleteClassesMutation = useDeleteClasses(
    facultyCode,
    {
      onSuccess: () => {
        setOpen(false);
        onSuccess?.();
      },
    }
  );

  const handleDelete = async () => {
    const classCodes = classes.map(c => c.classCode);
    deleteClassesMutation.mutate(classCodes);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="destructive" size="sm">
            <Trash2 className="mr-2 h-4 w-4" />
            Xóa ({count})
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            Xác nhận xóa lớp học
          </DialogTitle>
          <DialogDescription>
            Bạn có chắc chắn muốn xóa {count} lớp học được chọn? Hành động này không thể hoàn tác.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h4 className="font-medium text-red-800 mb-3">
              Danh sách lớp học sẽ bị xóa:
            </h4>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {classes.map((classItem) => (
                <div key={classItem.classCode} className="flex items-center justify-between py-2 px-3 bg-white rounded border">
                  <div className="flex flex-col">
                    <span className="font-medium text-sm">
                      {classItem.classCode}
                    </span>
                    <span className="text-xs text-gray-500">
                      {classItem.className}
                    </span>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Badge variant="outline" className="text-xs">
                      {classItem.studentCount} SV
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      {classItem.academicYearCode}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={deleteClassesMutation.isPending}
          >
            Hủy
          </Button>
          <Button 
            variant="destructive"
            onClick={handleDelete}
            disabled={deleteClassesMutation.isPending}
          >
            {deleteClassesMutation.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Xóa {count} lớp học
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
} 