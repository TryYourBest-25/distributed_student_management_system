import { z } from "zod";

export const classFormSchema = z.object({
  class_code: z.string()
    .trim()
    .min(1, { message: "Mã lớp không được để trống." })
    .max(20, { message: "Mã lớp không được quá 20 ký tự." })
    .regex(/^D\d{2}CQ[A-Z]{2}\d{2}$/, { 
      message: "Mã lớp phải có định dạng DxxCQxxdd (ví dụ: D22CQCN01)." 
    }),
  class_name: z.string()
    .trim()
    .min(1, { message: "Tên lớp không được để trống." })
    .max(50, { message: "Tên lớp không được quá 50 ký tự." }),
  academic_year_code: z.string()
    .trim()
    .min(1, { message: "Niên khóa không được để trống." })
    .regex(/^\d{4}-\d{4}$/, { 
      message: "Niên khóa phải có định dạng YYYY-YYYY (ví dụ: 2022-2026)." 
    })
    .refine((value) => {
      const [startYear, endYear] = value.split('-').map(Number);
      return startYear < endYear;
    }, { message: "Năm bắt đầu phải nhỏ hơn năm kết thúc." }),
})
.refine((data) => {
  // Kiểm tra mã lớp phù hợp với năm bắt đầu
  const yearFromCode = parseInt(data.class_code.substring(1, 3));
  const startYear = parseInt(data.academic_year_code.substring(2, 4));
  return yearFromCode === startYear;
}, {
  message: "Năm trong mã lớp phải khớp với năm bắt đầu của niên khóa.",
  path: ["class_code"]
});

export type ClassFormValues = z.infer<typeof classFormSchema>; 