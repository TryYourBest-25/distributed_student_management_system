"use client";

import * as React from "react";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useSearchStudentsByCode } from "@/hooks/use-students";
import { type StudentDetailResponse } from "@/services/student-service";
import { useTenantContext } from "@/contexts/tenant-context";

interface StudentSearchComboboxProps {
  facultyCode: string;
  servicePath: string;
  value?: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function StudentSearchCombobox({
  facultyCode,
  servicePath,
  value = "",
  onValueChange,
  placeholder = "Nhập mã sinh viên...",
  disabled = false,
  className,
}: StudentSearchComboboxProps) {
  const [searchQuery, setSearchQuery] = React.useState(value);
  const [showSuggestions, setShowSuggestions] = React.useState(false);
  const [debounceTimer, setDebounceTimer] = React.useState<NodeJS.Timeout | null>(null);

  // Search students when user types
  const { data: studentsResponse, isLoading } = useSearchStudentsByCode(
    facultyCode,
    servicePath,
    searchQuery,
    searchQuery.length >= 2 && showSuggestions
  );

  const students = studentsResponse?.items || [];

  // Find selected student info
  const selectedStudent = students.find(student => student.studentCode === value);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = event.target.value;
    setSearchQuery(inputValue);
    
    // Clear previous timer
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }
    
    // Set new timer for debounced search
    const timer = setTimeout(() => {
      if (inputValue.length >= 2) {
        setShowSuggestions(true);
      } else {
        setShowSuggestions(false);
      }
    }, 300);
    
    setDebounceTimer(timer);
    
    // Update value immediately for user feedback
    onValueChange(inputValue);
  };

  const handleSelect = (student: StudentDetailResponse) => {
    setSearchQuery(student.studentCode);
    onValueChange(student.studentCode);
    setShowSuggestions(false);
  };

  const handleClear = () => {
    setSearchQuery("");
    onValueChange("");
    setShowSuggestions(false);
  };

  const handleFocus = () => {
    if (searchQuery.length >= 2) {
      setShowSuggestions(true);
    }
  };

  const handleBlur = () => {
    // Delay hiding suggestions to allow clicking on them
    setTimeout(() => setShowSuggestions(false), 200);
  };

  // Cleanup timer on unmount
  React.useEffect(() => {
    return () => {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
    };
  }, [debounceTimer]);

  return (
    <div className={cn("relative", className)}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="text"
          placeholder={placeholder}
          value={searchQuery}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          disabled={disabled}
          className="pl-10 pr-10"
        />
        {searchQuery && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 p-0"
            onClick={handleClear}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Student suggestions dropdown */}
      {showSuggestions && (
        <div className="absolute top-full z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto">
          {isLoading && (
            <div className="p-3 text-sm text-muted-foreground text-center">
              Đang tìm kiếm...
            </div>
          )}
          
          {!isLoading && students.length === 0 && searchQuery.length >= 2 && (
            <div className="p-3 text-sm text-muted-foreground text-center">
              Không tìm thấy sinh viên nào (chỉ hiển thị sinh viên đang hoạt động)
            </div>
          )}
          
          {!isLoading && students.length > 0 && (
            <div className="py-1">
              {students.map((student) => (
                <button
                  key={student.studentCode}
                  type="button"
                  className="w-full px-3 py-2 text-left hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
                  onClick={() => handleSelect(student)}
                >
                  <div className="flex flex-col">
                    <span className="font-medium text-sm">{student.studentCode}</span>
                    <span className="text-xs text-muted-foreground">
                      {student.firstName} {student.lastName} - Lớp {student.classCode}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
      
      {/* Display selected student info */}
      {selectedStudent && searchQuery === selectedStudent.studentCode && (
        <div className="mt-2 text-xs text-muted-foreground">
          {selectedStudent.firstName} {selectedStudent.lastName} - Lớp {selectedStudent.classCode}
        </div>
      )}
    </div>
  );
} 