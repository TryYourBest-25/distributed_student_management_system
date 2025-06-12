namespace FacultyService.Domain.Entity;

/// <summary>
/// Bảng chứa thông tin sinh viên
/// </summary>
public partial class Student
{
    /// <summary>
    /// Mã sinh viên
    /// </summary>
    public string StudentCode { get; set; } = null!;

    /// <summary>
    /// Họ sinh viên
    /// </summary>
    public string LastName { get; set; } = null!;

    /// <summary>
    /// Tên sinh viên
    /// </summary>
    public string FirstName { get; set; } = null!;

    /// <summary>
    /// Mã lớp
    /// </summary>
    public string ClassCode { get; set; } = null!;

    /// <summary>
    /// Phái (FALSE: Nam, TRUE: Nữ)
    /// </summary>
    public bool? Gender { get; set; }

    /// <summary>
    /// Ngày sinh
    /// </summary>
    public DateOnly? BirthDate { get; set; }

    /// <summary>
    /// Địa chỉ
    /// </summary>
    public string? Address { get; set; }

    /// <summary>
    /// Đã nghỉ học (TRUE: nghỉ, FALSE: còn học)
    /// </summary>
    public bool IsSuspended { get; set; }

    /// <summary>
    /// Mã khoa của sinh viên (cột phân phối)
    /// </summary>
    public string FacultyCode { get; set; } = null!;

    public Class Class { get; set; } = null!;

    public Faculty FacultyCodeNavigation { get; set; } = null!;

    public ICollection<Registration> Registrations { get; set; } = new List<Registration>();

    public GlobalStudentCode StudentCodeNavigation { get; set; } = null!;
}