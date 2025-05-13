namespace Shared.Infra.Entity;

/// <summary>
/// Bảng chứa thông tin các môn học
/// </summary>
public partial class CourseEf
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
    public uint LectureCredit { get; set; }

    /// <summary>
    /// Số tín chỉ thực hành
    /// </summary>
    public uint LabCredit { get; set; }
}
