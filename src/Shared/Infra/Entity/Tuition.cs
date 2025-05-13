namespace Shared.Infra.Entity;

/// <summary>
/// Bảng chứa thông tin học phí phải đóng của sinh viên
/// </summary>
public partial class Tuition
{
    /// <summary>
    /// Mã sinh viên (FK và cột phân phối)
    /// </summary>
    public string StudentCode { get; set; } = null!;

    /// <summary>
    /// Niên khóa
    /// </summary>
    public string AcademicYear { get; set; } = null!;

    /// <summary>
    /// Học kỳ
    /// </summary>
    public int Semester { get; set; }

    /// <summary>
    /// Học phí phải đóng
    /// </summary>
    public int TuitionFee { get; set; }

    public virtual StudentBasicInfo StudentCodeNavigation { get; set; } = null!;

    public virtual ICollection<TuitionPayment> TuitionPayments { get; set; } = new List<TuitionPayment>();
}
