namespace FacultyService.Domain.Entity;

/// <summary>
/// Bảng chứa thông tin các lớp học
/// </summary>
public partial class Class
{
    /// <summary>
    /// Mã lớp
    /// </summary>
    public string ClassCode { get; set; } = null!;

    /// <summary>
    /// Tên lớp
    /// </summary>
    public string ClassName { get; set; } = null!;

    /// <summary>
    /// Khóa học (ví dụ K60, D2020)
    /// </summary>
    public string AcademicYearCode { get; set; } = null!;

    /// <summary>
    /// Mã khoa (FK và cột phân phối)
    /// </summary>
    public string FacultyCode { get; set; } = null!;

    public  Faculty FacultyCodeNavigation { get; set; } = null!;

    public  GlobalClassCode GlobalClassCode { get; set; } = null!;

    public  ICollection<Student> Students { get; set; } = new List<Student>();
}
