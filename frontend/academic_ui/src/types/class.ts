// Class types cho frontend
export interface Class {
  id: string; // Generated from classCode for compatibility
  class_code: string;
  class_name: string;
  faculty_code: string;
  faculty_name: string; // Now from ClassBasicResponse
  academic_year_code: string; // Changed from academic_year to match backend
  student_count: number; // Now required from ClassBasicResponse
}

// API Request interface - matches ClassBasicRequest from backend
export interface ClassApiRequest {
  classCode: string;
  className: string;
  academicYearCode: string;
}



// Convert frontend Class to API request
export function classToApiRequest(classData: Partial<Class>): ClassApiRequest {
  return {
    classCode: classData.class_code || '',
    className: classData.class_name || '',
    academicYearCode: classData.academic_year_code || '',
  };
}

// Convert form values to API request
export function classFormToApiRequest(formData: { class_code: string; class_name: string; academic_year_code: string }): ClassApiRequest {
  return {
    classCode: formData.class_code,
    className: formData.class_name,
    academicYearCode: formData.academic_year_code,
  };
}

// Convert API response to frontend Class (ClassBasicResponse structure)
export function apiResponseToClass(apiResponse: any): Class {
  return {
    id: apiResponse.classCode, // Use classCode as id
    class_code: apiResponse.classCode,
    class_name: apiResponse.className,
    faculty_code: apiResponse.facultyCode,
    faculty_name: apiResponse.facultyName, // Now from API response
    academic_year_code: apiResponse.academicYearCode, // Updated field name
    student_count: apiResponse.studentCount,
  };
} 

 