'use client';

import React from 'react';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Course } from '@/types/course';
import { useSession } from 'next-auth/react';
import { UserRole } from '@/types/auth';

interface CourseActionCellProps {
  course: Course;
  onDelete?: (course: Course) => void;
}

export function CourseActionCell({ course, onDelete }: CourseActionCellProps) {
  const { data: session } = useSession();

  const canDelete = session?.user?.roles?.includes(UserRole.PGV) ?? false;

  const handleDelete = () => {
    if (onDelete) {
      onDelete(course);
    }
  };

  if (!canDelete) {
    return null;
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleDelete}
      className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
      title="Xóa môn học"
    >
      <Trash2 className="h-4 w-4" />
    </Button>
  );
} 