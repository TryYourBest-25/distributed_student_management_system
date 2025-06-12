import { z } from "zod";

export const lecturerFormSchema = z.object({
  lecturer_code: z.string()
    .trim()
    .min(1, { message: "Mã giảng viên không được để trống." })
    .max(20, { message: "Mã giảng viên không được quá 20 ký tự." })
    .regex(/^[A-Z0-9]+$/, { message: "Mã giảng viên chỉ được chứa chữ cái in hoa và số." }),
  first_name: z.string()
    .trim()
    .min(1, { message: "Tên không được để trống." })
    .max(50, { message: "Tên không được quá 50 ký tự." }),
  last_name: z.string()
    .trim()
    .min(1, { message: "Họ không được để trống." })
    .max(50, { message: "Họ không được quá 50 ký tự." }),
  degree: z.string()
    .trim()
    .max(100, { message: "Học vị không được quá 100 ký tự." })
    .optional()
    .or(z.literal('')),
  academic_rank: z.string()
    .trim()
    .max(100, { message: "Học hàm không được quá 100 ký tự." })
    .optional()
    .or(z.literal('')),
  specialization: z.string()
    .trim()
    .max(200, { message: "Chuyên môn không được quá 200 ký tự." })
    .optional()
    .or(z.literal('')),
  faculty_code: z.string()
    .min(1, { message: "Vui lòng chọn khoa." }),
});

export type LecturerFormValues = z.infer<typeof lecturerFormSchema>; 