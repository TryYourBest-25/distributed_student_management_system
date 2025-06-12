import { API_BASE_URL, API_VERSION } from '@/constants/api';
import { parse, isValid, parseISO, format } from 'date-fns';
import {
  StudentBasicInfo,
  StudentDetailResponse,
  PagedResult,
  RequiredTuitionStudentRequest,
  TuitionResponse,
  DeleteStudentTuitionRequest,
  PaymentResponse,
  CreateOrUpdatePaymentRequest,
  // DeleteTuitionPaymentRequest, // This will be a list of objects with just paymentDate
} from '@/types';

// Helper function to handle API responses
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorData = await response.text();
    // Try to parse as JSON, if it fails, use the raw text
    try {
      const errorJson = JSON.parse(errorData);
      console.error('API Error:', errorJson);
      throw new Error(errorJson.detail || errorJson.title || response.statusText);
    } catch {
      console.error('API Error Text:', errorData);
      throw new Error(errorData || response.statusText);
    }
  }
  if (response.status === 204) { // No Content
    return undefined as T;
  }
  
  // Check if response has content before trying to parse JSON
  const contentLength = response.headers.get('content-length');
  const contentType = response.headers.get('content-type');
  
  // If content-length is 0 or response doesn't have JSON content type, return undefined
  if (contentLength === '0' || (!contentType || !contentType.includes('application/json'))) {
    return undefined as T;
  }
  
  // Try to get response text first to check if it's empty
  const responseText = await response.text();
  if (!responseText.trim()) {
    return undefined as T;
  }
  
  // Parse JSON if we have content
  try {
    return JSON.parse(responseText) as T;
  } catch (error) {
    console.error('JSON parse error:', error);
    console.error('Response text:', responseText);
    throw new Error('Lỗi phản hồi từ server không đúng định dạng JSON');
  }
}

// Helper function to handle network errors
async function fetchWithErrorHandling(url: string, options: RequestInit = {}): Promise<Response> {
  try {
    return await fetch(url, options);
  } catch (error) {
    console.error('Network Error:', error);
    if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
      throw new Error('Không thể kết nối tới API server. Vui lòng kiểm tra xem server có đang chạy không.');
    }
    throw error;
  }
}

async function handleBlobResponse(response: Response): Promise<Blob> {
  if (!response.ok) {
    const errorData = await response.text();
    // Try to parse as JSON, if it fails, use the raw text
    try {
      const errorJson = JSON.parse(errorData);
      console.error('API Error:', errorJson);
      throw new Error(errorJson.detail || errorJson.title || response.statusText);
    } catch {
      console.error('API Error Text:', errorData);
      throw new Error(errorData || response.statusText);
    }
  }
  return response.blob();
}

const headers = {
  'Content-Type': 'application/json',
  'X-Api-Version': API_VERSION, // As per Program.cs configuration
};

// Helper function to parse date in different formats
function parsePaymentDate(dateString: string): Date {
  // Try dd/MM/yyyy format first
  let parsedDate = parse(dateString, 'dd/MM/yyyy', new Date());
  if (isValid(parsedDate)) {
    return parsedDate;
  }
  
  // Try yyyy-MM-dd format (ISO format)
  parsedDate = parse(dateString, 'yyyy-MM-dd', new Date());
  if (isValid(parsedDate)) {
    return parsedDate;
  }
  
  // Try parsing as ISO string
  try {
    parsedDate = parseISO(dateString);
    if (isValid(parsedDate)) {
      return parsedDate;
    }
  } catch {
    // Continue to error below
  }
  
  throw new Error(`Ngày thanh toán không hợp lệ: ${dateString}. Vui lòng sử dụng định dạng dd/MM/yyyy hoặc yyyy-MM-dd`);
}

// 1. Get Students (Paged) - using Gridify query format
export async function getStudents(page: number = 0, pageSize: number = 10): Promise<PagedResult<StudentBasicInfo>> {
  // API uses 0-based pagination
  const response = await fetchWithErrorHandling(`${API_BASE_URL}/students?page=${page}&pageSize=${pageSize}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  
  // Backend returns PagedList<StudentBasicInfo> format
  const result = await handleResponse<PagedResult<StudentBasicInfo>>(response);
  
  return result;
}

// 2. Get Student Details with Tuitions
export async function getStudentDetail(studentCode: string): Promise<StudentDetailResponse> {
  const response = await fetchWithErrorHandling(`${API_BASE_URL}/students/${studentCode}`, {
    method: 'GET',
    headers,
  });
  return handleResponse<StudentDetailResponse>(response);
}

// 2b. Get Student Basic Info Only (for compatibility)
export async function getStudent(studentCode: string): Promise<StudentBasicInfo> {
  const studentDetail = await getStudentDetail(studentCode);
  return {
    studentCode: studentDetail.studentCode,
    firstName: studentDetail.firstName,
    lastName: studentDetail.lastName,
    classCode: studentDetail.classCode,
    facultyCode: studentDetail.facultyCode,
  };
}

// 3. Get Tuitions for a Student
export async function getStudentTuitions(studentCode: string): Promise<TuitionResponse[]> {
  const studentDetail = await getStudentDetail(studentCode);
  return studentDetail.tuitions;
}

// 4. Get Single Tuition Detail for a Student
export async function getStudentTuition(studentCode: string, academicYear: string, semester: number): Promise<TuitionResponse> {
  const allTuitions = await getStudentTuitions(studentCode);
  const tuition = allTuitions.find(t => t.academicYear === academicYear && t.semester === semester.toString());
  
  if (!tuition) {
    throw new Error(`Không tìm thấy học phí cho niên khóa ${academicYear} - Học kỳ ${semester}`);
  }
  
  return tuition;
}

// 5. Update Tuition Amount for a Student
export async function updateStudentTuition(studentCode: string, academicYear: string, semester: number, newTuitionFee: number): Promise<void> {
  // Delete the old tuition first
  await deleteStudentTuitions(studentCode, [{ academicYear, semester }]);
  
  // Create new tuition with updated amount
  const request: RequiredTuitionStudentRequest = {
    studentCode,
    academicYear,
    semester,
    tuitionFee: newTuitionFee,
  };
  
  await createStudentTuition(studentCode, request);
}

// 3. Create Tuition for a Student
export async function createStudentTuition(studentCode: string, request: RequiredTuitionStudentRequest): Promise<void> {
  const response = await fetchWithErrorHandling(`${API_BASE_URL}/students/${studentCode}/tuitions`, {
    method: 'POST',
    headers,
    body: JSON.stringify(request),
  });
  await handleResponse<void>(response);
}

// 4. Delete Tuitions for a Student
// The backend expects a list of objects identifying academic year and semester
export async function deleteStudentTuitions(studentCode: string, tuitionsToDelete: DeleteStudentTuitionRequest[]): Promise<void> {
  const response = await fetchWithErrorHandling(`${API_BASE_URL}/students/${studentCode}/tuitions`, {
    method: 'DELETE',
    headers,
    body: JSON.stringify(tuitionsToDelete),
  });
  await handleResponse<void>(response);
}

// 5. Search Tuitions for a Student (Paged)
export async function searchStudentTuitions(
  studentCode: string,
  params: { filter?: string; orderBy?: string; page: number; pageSize: number }
): Promise<PagedResult<TuitionResponse>> {
  const queryParams = new URLSearchParams({
    page: params.page.toString(),
    pageSize: params.pageSize.toString(),
  });
  if (params.filter) queryParams.append('filter', params.filter);
  if (params.orderBy) queryParams.append('orderBy', params.orderBy);

  const response = await fetchWithErrorHandling(`${API_BASE_URL}/students/${studentCode}/tuitions/search?${queryParams.toString()}`, {
    method: 'GET',
    headers,
  });
  // Backend returns Paging<TuitionResponse> directly
  return handleResponse<PagedResult<TuitionResponse>>(response);
}

// 6. Get Tuition Payments for a Student, Academic Year, and Semester
export async function getTuitionPayments(
  studentCode: string,
  academicYear: string,
  semester: number
): Promise<PaymentResponse[]> {
  const response = await fetchWithErrorHandling(`${API_BASE_URL}/students/${studentCode}/tuitions/${academicYear}/${semester}/payments`, {
    method: 'GET',
    headers,
  });
  return handleResponse<PaymentResponse[]>(response);
}

// 7. Create (or Update) Tuition Payment for a Student
export async function upsertTuitionPayment(
  studentCode: string,
  academicYear: string,
  semester: number,
  paymentDate: string, // dd/MM/yyyy or yyyy-MM-dd
  amountPaid: number
): Promise<void> {
  // Convert date string to dd/MM/yyyy format
  const parsedDate = parsePaymentDate(paymentDate);
  const formattedDate = format(parsedDate, 'dd/MM/yyyy');
  
  const requestBody: CreateOrUpdatePaymentRequest = {
    paymentDate: formattedDate, // Send as dd/MM/yyyy string
    money: amountPaid
  };
  
  const response = await fetchWithErrorHandling(
    `${API_BASE_URL}/students/${studentCode}/tuitions/${academicYear}/${semester}/payments`,
    {
      method: 'PUT',
      headers,
      body: JSON.stringify(requestBody),
    }
  );
  await handleResponse<void>(response);
}

// 8. Delete Tuition Payments for a Student, Academic Year, and Semester
// The backend expects a list of DeleteTuitionPaymentRequest objects according to the API
export async function deleteTuitionPayments(
  studentCode: string,
  academicYear: string,
  semester: number,
  paymentsToDelete: Array<{ paymentDate: string }> // Array of objects with paymentDate (dd/MM/yyyy or yyyy-MM-dd format)
): Promise<void> {
  // Convert to the format expected by backend: list of DeleteTuitionPaymentRequest with dd/MM/yyyy format
  const requestBody = paymentsToDelete.map(p => {
    const parsedDate = parsePaymentDate(p.paymentDate);
    const formattedDate = format(parsedDate, 'dd/MM/yyyy');
    
    return {
      academicYear,
      semester,
      paymentDate: formattedDate // Convert to dd/MM/yyyy string
    };
  });

  const response = await fetchWithErrorHandling(
    `${API_BASE_URL}/students/${studentCode}/tuitions/${academicYear}/${semester}/payments`,
    {
      method: 'DELETE',
      headers,
      body: JSON.stringify(requestBody),
    }
  );
  await handleResponse<void>(response);
}


// 9. Export Tuitions
export async function exportTuitions(params: {
  classCode: string;
  facultyCode: string;
  academicYear: string;
  semester: number;
}): Promise<Blob> {
  const queryParams = new URLSearchParams({
    classCode: params.classCode,
    facultyCode: params.facultyCode,
    academicYear: params.academicYear,
    semester: params.semester.toString(),
  });
  const response = await fetchWithErrorHandling(`${API_BASE_URL}/tuitions/export?${queryParams.toString()}`, {
    method: 'GET',
    headers: {
      'X-Api-Version': API_VERSION,
    }
  });
  return handleBlobResponse(response);
}

// Note: The /students/batch endpoint (CreateStudentBatch) is not implemented here
// as it might be for bulk data import rather than typical UI interaction.
// It can be added if needed. 