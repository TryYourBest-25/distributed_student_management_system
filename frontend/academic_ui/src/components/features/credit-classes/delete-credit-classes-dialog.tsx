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
import { useDeleteCreditClasses } from "@/hooks/use-credit-classes";
import { type CreditClassBasicResponse } from "@/services/credit-class-service";

interface DeleteCreditClassesDialogProps {
  facultyCode: string;
  creditClasses: CreditClassBasicResponse[];
  onSuccess?: () => void;
  children?: React.ReactNode;
}

export function DeleteCreditClassesDialog({
  facultyCode,
  creditClasses,
  onSuccess,
  children,
}: DeleteCreditClassesDialogProps) {
  const [open, setOpen] = useState(false);
  const count = creditClasses.length;

  const deleteCreditClassesMutation = useDeleteCreditClasses(
    facultyCode,
    {
      onSuccess: () => {
        setOpen(false);
        onSuccess?.();
      },
    }
  );

  const handleDelete = async () => {
    const creditClassIds = creditClasses.map(cc => cc.creditClassId);
    deleteCreditClassesMutation.mutate(creditClassIds);
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
            Xác nhận xóa lớp tín chỉ
          </DialogTitle>
          <DialogDescription>
            Bạn có chắc chắn muốn xóa {count} lớp tín chỉ được chọn? Hành động này không thể hoàn tác.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h4 className="font-medium text-red-800 mb-3">
              Danh sách lớp tín chỉ sẽ bị xóa:
            </h4>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {creditClasses.map((creditClass) => (
                <div key={creditClass.creditClassId} className="flex items-center justify-between py-2 px-3 bg-white rounded border">
                  <div className="flex flex-col">
                    <span className="font-medium text-sm">
                      {creditClass.courseCode}.{creditClass.groupNumber}
                    </span>
                    <span className="text-xs text-gray-500">
                      HK{creditClass.semester} - {creditClass.academicYear}
                    </span>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Badge variant="outline" className="text-xs">
                      {creditClass.currentStudent}/{creditClass.minStudent} SV
                    </Badge>
                    <Badge variant={creditClass.isCancelled ? "destructive" : "secondary"} className="text-xs">
                      {creditClass.isCancelled ? "Đã hủy" : "Hoạt động"}
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
            disabled={deleteCreditClassesMutation.isPending}
          >
            Hủy
          </Button>
          <Button 
            variant="destructive"
            onClick={handleDelete}
            disabled={deleteCreditClassesMutation.isPending}
          >
            {deleteCreditClassesMutation.isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Xóa {count} lớp tín chỉ
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
} 