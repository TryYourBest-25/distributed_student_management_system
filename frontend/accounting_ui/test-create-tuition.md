# Test Scenarios - Chức năng Tạo Học Phí

## 1. Test Validation

### Academic Year Validation
- ✅ Định dạng đúng: 2022-2023, 2024-2025
- ❌ Định dạng sai: 2022, 22-23, 2022-24, abc-def
- ❌ Năm không liên tiếp: 2022-2024, 2022-2021
- ❌ Năm quá xa: 2010-2011 (hơn 10 năm trước), 2030-2031 (hơn 5 năm sau)

### Semester Validation
- ✅ Giá trị hợp lệ: 1, 2, 3, 4
- ❌ Giá trị không hợp lệ: 0, 5, -1, abc

### Tuition Fee Validation
- ✅ Giá trị hợp lệ: 1001, 7000000, 50000000
- ❌ Quá nhỏ: 0, 1000, -100
- ❌ Quá lớn: 100000001

## 2. Test UX Features

### Auto-fill Suggestions
- ✅ Khi mở modal, form tự động điền:
  - Academic Year: hiện tại (VD: 2024-2025)
  - Semester: dựa trên tháng hiện tại
  - Tuition Fee: gợi ý dựa trên năm học

### Helper Text
- ✅ Academic Year: hiển thị format và ví dụ
- ✅ Semester: hiển thị học kỳ hiện tại
- ✅ Tuition Fee: hiển thị range và gợi ý theo academic year

### Keyboard Shortcuts
- ✅ ESC: đóng modal
- ✅ Ctrl+Enter: submit form
- ✅ Auto-focus vào field đầu tiên khi mở modal

## 3. Test API Integration

### Create Tuition Success
- ✅ Gửi đúng format request body:
  ```json
  {
    "studentCode": "SV001",
    "academicYear": "2024-2025",
    "semester": 1,
    "tuitionFee": 7000000
  }
  ```
- ✅ Reload danh sách sau khi tạo thành công
- ✅ Reset form sau khi submit
- ✅ Hiển thị toast success
- ✅ Đóng modal

### Duplicate Validation
- ✅ Kiểm tra duplicate trước khi call API
- ✅ Hiển thị error message nếu duplicate
- ❌ Không call API nếu duplicate

### Error Handling
- ✅ Network error: hiển thị error toast
- ✅ Server error: hiển thị error message
- ✅ Validation error: hiển thị field-specific errors

## 4. Test Loading States

### Form Disabled State
- ✅ Tất cả input fields bị disable khi đang submit
- ✅ Submit button hiển thị "Đang ghi..."
- ✅ Cancel button bị disable
- ✅ Không thể đóng modal bằng ESC khi đang submit

### Page Loading State
- ✅ "Ghi Học Phí Mới" button bị disable khi đang load tuitions
- ✅ Hiển thị loading indicators thích hợp

## 5. Test User Experience

### Form Reset
- ✅ Reset form khi đóng modal (Cancel hoặc ESC)
- ✅ Reset form sau khi submit thành công
- ✅ Không reset form khi có lỗi

### Responsive Design
- ✅ Modal responsive trên mobile
- ✅ Form fields hiển thị đúng trên các screen sizes
- ✅ Button layout thích hợp

### Accessibility
- ✅ Proper labels cho form fields
- ✅ Error messages có ID references
- ✅ Keyboard navigation hoạt động
- ✅ Focus management đúng

## 6. Test Edge Cases

### Empty Student Info
- ✅ Button bị disable khi không có student info
- ✅ Error message khi thiếu student code

### Network Issues
- ✅ Timeout handling
- ✅ Connection error handling
- ✅ Retry mechanism (nếu có)

### Form State Management
- ✅ Form state được maintain đúng cách
- ✅ Validation errors cleared khi fix
- ✅ Form values persist trong session (nếu cần)

## 7. Manual Test Steps

### Test Tạo học phí thành công:
1. Vào trang chi tiết sinh viên
2. Click "Ghi Học Phí Mới"
3. Kiểm tra form đã được auto-fill
4. Thay đổi giá trị nếu cần
5. Click "Ghi Học Phí" hoặc Ctrl+Enter
6. Verify: toast success, modal đóng, danh sách reload

### Test Validation:
1. Mở modal
2. Nhập giá trị không hợp lệ
3. Try submit
4. Verify: error messages hiển thị đúng
5. Fix errors
6. Verify: errors cleared, submit thành công

### Test Duplicate:
1. Tạo học phí cho 2024-2025 Kỳ 1
2. Try tạo lại cùng academic year và semester
3. Verify: error message về duplicate
4. API không được call

### Test Keyboard Shortcuts:
1. Mở modal
2. Press ESC → modal đóng
3. Mở lại modal
4. Fill form
5. Press Ctrl+Enter → form submit

## Acceptance Criteria ✅

- [x] Form validation theo business rules
- [x] Auto-fill với suggestions thông minh
- [x] Keyboard shortcuts hoạt động
- [x] API integration đúng format
- [x] Error handling robust
- [x] Loading states appropriate
- [x] UX smooth và intuitive
- [x] Duplicate prevention
- [x] Responsive design
- [x] Accessibility compliance 