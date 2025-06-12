namespace FacultyService.Domain.Entity;

/// <summary>
/// Bảng chứa thông tin các lớp tín chỉ
/// </summary>
public partial class CreditClass
{
    /// <summary>
    /// Mã lớp tín chỉ (tự động tăng)
    /// </summary>
    public int CreditClassId { get; set; }

    /// <summary>
    /// Niên khóa (ví dụ: 2023-2024)
    /// </summary>
    public string AcademicYear { get; set; } = null!;

    /// <summary>
    /// Học kỳ
    /// </summary>
    public int Semester { get; set; }

    /// <summary>
    /// Mã môn học (FK)
    /// </summary>
    public string CourseCode { get; set; } = null!;

    /// <summary>
    /// Nhóm
    /// </summary>
    public int GroupNumber { get; set; }

    /// <summary>
    /// Mã giảng viên (FK)
    /// </summary>
    public string LecturerCode { get; set; } = null!;

    /// <summary>
    /// Mã khoa quản lý lớp tín chỉ (FK và cột phân phối)
    /// </summary>
    public string FacultyCode { get; set; } = null!;

    /// <summary>
    /// Số sinh viên tối thiểu
    /// </summary>
    public short MinStudent { get; set; }

    /// <summary>
    /// Lớp đã bị hủy (TRUE: hủy)
    /// </summary>
    public bool IsCancelled { get; set; }

    public  Course CourseCodeNavigation { get; set; } = null!;

    public  Faculty FacultyCodeNavigation { get; set; } = null!;

    public  Lecturer LecturerCodeNavigation { get; set; } = null!;

    public  ICollection<Registration> Registrations { get; set; } = new List<Registration>();
}
