'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { Lecturer } from '@/types/lecturer';
import { useSession } from 'next-auth/react';
import { UserRole } from '@/types/auth';

interface LecturerActionCellProps {
  lecturer: Lecturer;
  onDelete: (lecturer: Lecturer) => void;
}

export function LecturerActionCell({ lecturer, onDelete }: LecturerActionCellProps) {
  const { data: session } = useSession();
  const userRoles = session?.user?.roles || [];
  const isPgv = userRoles.includes('PGV');

  if (!isPgv) {
    return null;
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => onDelete(lecturer)}
      className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
    >
      <Trash2 className="h-4 w-4" />
    </Button>
  );
} 