using Shared.Domain;
using Shared.Domain.Model;
using Shared.Domain.ValueObject;

namespace AcademicService.Domain.Aggregate;

/// <summary>
/// Bảng chứa thông tin giảng viên
/// </summary>
public partial class LecturerAg : AggregateRootBase<LecturerCode>
{
    public LecturerAg(LecturerCode id) : base(id)
    {
    }
    /// <summary>
    /// Họ giảng viên
    /// </summary>
    public LastName LastName { get; set; } = null!;

    /// <summary>
    /// Tên giảng viên
    /// </summary>
    public FirstName FirstName { get; set; } = null!;

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
    public FacultyCode FacultyCode { get; set; } = null!;

}
