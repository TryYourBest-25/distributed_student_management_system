namespace FacultyService.Domain.Entity;

/// <summary>
/// Bảng chứa thông tin đăng ký lớp tín chỉ của sinh viên
/// </summary>
public partial class Registration
{
    /// <summary>
    /// Mã lớp tín chỉ (phần của PK)
    /// </summary>
    public int CreditClassId { get; set; }

    /// <summary>
    /// Mã sinh viên (phần của PK)
    /// </summary>
    public string StudentCode { get; set; } = null!;

    /// <summary>
    /// Điểm chuyên cần (0-10)
    /// </summary>
    public float? AttendanceScore { get; set; }

    /// <summary>
    /// Điểm giữa kỳ (0-10)
    /// </summary>
    public float? MidtermScore { get; set; }

    /// <summary>
    /// Điểm cuối kỳ (0-10)
    /// </summary>
    public float? FinalScore { get; set; }

    /// <summary>
    /// Đăng ký đã bị hủy (TRUE: hủy)
    /// </summary>
    public bool IsCancelled { get; set; }

    /// <summary>
    /// Mã khoa (cột phân phối, phần của PK)
    /// </summary>
    public string FacultyCode { get; set; } = null!;

    public  CreditClass CreditClass { get; set; } = null!;

    public  Faculty FacultyCodeNavigation { get; set; } = null!;

    public  Student Student { get; set; } = null!;
}
