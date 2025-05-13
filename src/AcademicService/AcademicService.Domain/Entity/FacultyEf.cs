namespace Shared.Infra.Entity;

/// <summary>
/// Bảng chứa thông tin các khoa
/// </summary>
public partial class FacultyEf
{
    /// <summary>
    /// Mã khoa
    /// </summary>
    public string FacultyCode { get; set; } = null!;

    /// <summary>
    /// Tên khoa
    /// </summary>
    public string FacultyName { get; set; } = null!;


    public  ICollection<LecturerEf> Lecturers { get; set; } = new List<LecturerEf>();

}
