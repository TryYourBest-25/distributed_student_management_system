# Academic UI

- Dùng tanstack table để hiển thị dữ liệu.
- Dùng shadcn/ui để tạo các component.
- Dùng react-hook-form để xử lý form.
- Dùng zod để xử lý validation.
- Dùng react-query để xử lý data fetching.
- Dùng react-hook-form để xử lý form.
- Dùng zod để xử lý validation.
- Dùng react-query để xử lý data fetching.
- Tại mỗi trang , đầu trang hiển thị breadcrumb từ shadcn/ui.
- Tại những trang hiển thị bảng tanstack luôn có một cột dành cho nút select hàng.
- Khi thêm mới thì hiển thị hộp thêm mới.
- Khi sửa thì chuyển đến trang chi tiết.
- Khi xóa thì hiển thị hộp xác nhận xóa.
- Dùng toast-react để hiển thị thông báo.
- Thiết kế:

- Navigation bar:
  - Có một hộp lựa chọn danh sách khoa để chọn khoa.
  - Có các mục bao gồm:
    - Giảng viên:
      - Hiển thị bảng các giảng viên.
      - Khi bấm vào mỗi giảng viên chuyển đến trang chi tiết giảng viên.
      - Có thể thêm, sửa, xóa giảng viên.
    - Môn học:
      - Trong môn học hiển thị bảng các môn học.
      - Khi bấm vào mỗi môn học chuyển đến trang chi tiết môn học.
      - Có thể thêm, sửa môn học.
      - Có thể xóa nhiều môn học cùng lúc.
    - Lớp học:
      - Trong lớp học hiển thị bảng các lớp học của khoa đã chọn.
      - Khi bấm vào mỗi lớp học chuyển đến trang chi tiết lớp học.
      - Có thể thêm, xóa lớp học.
      - Có thể xóa nhiều lớp học cùng lúc.
    - Lớp tín chỉ
      - Trong lớp tín chỉ hiển thị bảng các lớp tín chỉ.
      - Khi bấm vào mỗi lớp tín chỉ chuyển đến trang chi tiết lớp tín chỉ.
      - Có thể thêm, xóa, sửa lớp tín chỉ.
      - Có thể xóa nhiều lớp tín chỉ cùng lúc.
    - Sinh viên chỉ hiển thị dưới dạng bảng khi đi đến trang chi tiết lớp học, lớp tín chỉ:
      - Khi bấm vào mỗi sinh viên chuyển đến trang chi tiết sinh viên.
      - Có thể thêm, xóa, sửa sinh viên.
      - Có thể xóa nhiều sinh viên cùng lúc.

academic_ui/
├── app/
│   ├── (auth)/                     # Routes cho đăng nhập, đăng ký (nếu có)
│   │   └── login/page.tsx
│   ├── (main)/                     # Layout chính sau khi đăng nhập (DÙNG CHUNG CHO PGV & KHOA)
│   │   ├── layout.tsx              # Chứa Header, Sidebar (Sidebar sẽ động dựa trên vai trò)
│   │   │                           # Cần lấy vai trò người dùng (PGV/Khoa) ở đây.
│   │   │
│   │   ├── dashboard/page.tsx      # Dashboard chung, nội dung có thể thay đổi theo vai trò
│   │   │
│   │   ├── faculties/              # Quản lý Khoa (PGV: CRUD)
│   │   │   └── page.tsx            #   (Logic trong page: chỉ PGV mới truy cập/có quyền CRUD)
│   │   │
│   │   ├── courses/                # Môn học (PGV: CRUD; Khoa: Read-only)
│   │   │   └── page.tsx            #   (Logic trong page: thay đổi giao diện/chức năng theo vai trò)
│   │   │
│   │   ├── lecturers/              # Giảng viên (PGV: CRUD; Khoa: Read-only)
│   │   │   ├── page.tsx            #   (Logic trong page: thay đổi giao diện/chức năng theo vai trò)
│   │   │   └── [lecturer_code]/page.tsx # Chi tiết giảng viên
│   │   │
│   │   ├── classes/                # Quản lý Lớp học
│   │   │   ├── page.tsx            #   (Logic trong page: PGV - theo khoa đã chọn; Khoa - của khoa mình)
│   │   │   └── [class_code]/page.tsx     # Chi tiết lớp (gồm DSSV)
│   │   │
│   │   ├── credit-classes/         # Quản lý Lớp tín chỉ
│   │   │   ├── page.tsx            #   (Logic trong page: PGV - theo khoa đã chọn; Khoa - của khoa mình)
│   │   │   └── [credit_class_id]/page.tsx # Chi tiết LTC (gồm DSSV đăng ký, nhập điểm)
│   │   │
│   │   ├── student-registrations/page.tsx # Đăng ký học phần cho SV (Logic theo vai trò)
│   │   │
│   │   └── reports/page.tsx        # Báo cáo (Logic và dữ liệu theo vai trò)
│   │   │
│   │   └── page.tsx                # Trang mặc định sau login (có thể là dashboard)
│   │
│   ├── layout.tsx                  # Root layout
│   └── global.css
│
├── components/
│   ├── auth/                       # Components cho login, auth state
│   ├── core/                       # Các components lõi dùng chung
│   │   ├── breadcrumb.tsx
│   │   ├── data-table/             # Wrapper cho Tanstack Table + Shadcn
│   │   ├── delete-confirm-dialog.tsx
│   │   ├── faculty-selector.tsx    # (Cho PGV trong Header/Sidebar để chọn khoa làm việc)
│   │   └── page-header.tsx         # Tiêu đề trang + nút hành động (Thêm mới)
│   ├── layout/
│   │   ├── header.tsx              # Header có thể chứa FacultySelector cho PGV
│   │   ├── sidebar.tsx             # Sidebar với các mục menu động theo vai trò
│   │   └── user-nav.tsx            # Dropdown thông tin user ở header
│   └── ui/                         # Re-export các components từ Shadcn/UI
│
├── features/                       # Nhóm theo nghiệp vụ
│   ├── courses/
│   │   ├── components/course-form.tsx
│   │   └── services/api.ts         # (React Query hooks, API calls có thể cần tham số vai trò/khoa)
│   ├── lecturers/
│   ├── classes/
│   ├── students/
│   ├── credit-classes/
│   └── registrations/
│
├── lib/
│   ├── hooks/                      # Custom hooks (vd: useAuth() để lấy vai trò)
│   ├── providers/                  # React Context providers (AuthContext, FacultySelectedContext cho PGV)
│   ├── utils.ts                    # Hàm tiện ích
│   └── validators/                 # Zod schemas (cho từng form)
│
├── services/                       # Các hàm gọi API tổng quát (nếu có)
├── types/                          # Định nghĩa TypeScript
└── constants/                      # Hằng số (VD: role names, permissions)
