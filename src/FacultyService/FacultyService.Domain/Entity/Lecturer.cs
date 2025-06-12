namespace FacultyService.Domain.Entity;

/// <summary>
/// Bảng chứa thông tin giảng viên
/// </summary>
public partial class Lecturer
{
    /// <summary>
    /// Mã giảng viên
    /// </summary>
    public string LecturerCode { get; set; } = null!;

    /// <summary>
    /// Họ giảng viên
    /// </summary>
    public string LastName { get; set; } = null!;

    /// <summary>
    /// Tên giảng viên
    /// </summary>
    public string FirstName { get; set; } = null!;

    /// <summary>
    /// Học vị
    /// </summary>
    public string? Degree { get; set; }

    /// <summary>
    /// Học hàm
    /// </summary>
    public string? AcademicRank { get; set; }

    /// <summary>
    /// Chuyên môn
    /// </summary>
    public string? Specialization { get; set; }

    /// <summary>
    /// Mã khoa (FK)
    /// </summary>
    public string FacultyCode { get; set; } = null!;

    public ICollection<CreditClass> CreditClasses { get; set; } = new List<CreditClass>();

    public Faculty FacultyCodeNavigation { get; set; } = null!;
}
