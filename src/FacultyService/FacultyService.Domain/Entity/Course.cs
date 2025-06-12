namespace FacultyService.Domain.Entity;

/// <summary>
/// Bảng chứa thông tin các môn học
/// </summary>
public partial class Course
{
    /// <summary>
    /// Mã môn học
    /// </summary>
    public string CourseCode { get; set; } = null!;

    /// <summary>
    /// Tên môn học
    /// </summary>
    public string CourseName { get; set; } = null!;

    /// <summary>
    /// Số tín chỉ lý thuyết
    /// </summary>
    public int LectureCredit { get; set; }

    /// <summary>
    /// Số tín chỉ thực hành
    /// </summary>
    public int LabCredit { get; set; }

    public virtual ICollection<CreditClass> CreditClasses { get; set; } = new List<CreditClass>();
}
