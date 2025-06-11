// Course types cho frontend
export interface Course {
  course_code: string;
  course_name: string;
  lecture_credit: number;
  lab_credit: number;
}

// Mapping functions giữa frontend và API
export function courseToApiRequest(course: Course) {
  return {
    courseCode: course.course_code,
    courseName: course.course_name,
    lectureCredit: course.lecture_credit,
    labCredit: course.lab_credit,
  };
}

export function apiResponseToCourse(apiResponse: any) {
  return {
    course_code: apiResponse.courseCode,
    course_name: apiResponse.courseName,
    lecture_credit: apiResponse.lectureCredit,
    lab_credit: apiResponse.labCredit,
  };
} 