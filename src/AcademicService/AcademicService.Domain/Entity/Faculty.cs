namespace Shared.Infra.Entity;

/// <summary>
/// Bảng chứa thông tin các khoa
/// </summary>
public partial class Faculty
{
    /// <summary>
    /// Mã khoa
    /// </summary>
    public string FacultyCode { get; set; } = null!;

    /// <summary>
    /// Tên khoa
    /// </summary>
    public string FacultyName { get; set; } = null!;


    public ICollection<Lecturer> Lecturers { get; set; } = new List<Lecturer>();
}