namespace Shared.Infra.Entity;

/// <summary>
/// Bảng chứa thông tin cơ bản của sinh viên cho phòng kế toán (bản sao)
/// </summary>
public partial class StudentBasicInfo
{
    /// <summary>
    /// Mã sinh viên (PK và cột phân phối)
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
    /// Mã lớp gốc của sinh viên
    /// </summary>
    public string? ClassCode { get; set; }

    /// <summary>
    /// Mã khoa gốc của sinh viên
    /// </summary>
    public string? FacultyCode { get; set; }

    public virtual ICollection<Tuition> Tuitions { get; set; } = new List<Tuition>();
}
