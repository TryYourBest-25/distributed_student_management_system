// Lecturer types cho frontend
export interface Lecturer {
  lecturer_code: string;
  first_name: string;
  last_name: string;
  full_name: string; // computed field
  degree?: string;
  academic_rank?: string;
  specialization?: string;
  faculty_code: string;
  faculty_name?: string; // computed field từ faculty service
}

// Mapping functions giữa frontend và API
export function lecturerToApiRequest(lecturer: Omit<Lecturer, 'full_name' | 'faculty_name'>) {
  return {
    lecturerCode: lecturer.lecturer_code,
    firstName: lecturer.first_name,
    lastName: lecturer.last_name,
    degree: lecturer.degree,
    academicRank: lecturer.academic_rank,
    specialization: lecturer.specialization,
    facultyCode: lecturer.faculty_code,
  };
}

export function apiResponseToLecturer(apiResponse: any, facultyName?: string): Lecturer {
  return {
    lecturer_code: apiResponse.lecturerCode,
    first_name: apiResponse.firstName,
    last_name: apiResponse.lastName,
    full_name: `${apiResponse.firstName} ${apiResponse.lastName}`,
    degree: apiResponse.degree,
    academic_rank: apiResponse.academicRank,
    specialization: apiResponse.specialization,
    faculty_code: apiResponse.facultyCode,
    faculty_name: facultyName,
  };
} 