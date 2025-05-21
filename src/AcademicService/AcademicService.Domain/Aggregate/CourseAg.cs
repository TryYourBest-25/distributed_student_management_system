using Shared.Domain;
using Shared.Domain.Model;
using Shared.Domain.ValueObject;

namespace AcademicService.Domain.Aggregate;

/// <summary>
/// Bảng chứa thông tin các môn học
/// </summary>
public partial class CourseAg(CourseCode courseCode) : AggregateRootBase<CourseCode>(courseCode)
{
    /// <summary>
    /// Tên môn học
    /// </summary>
    public CourseName CourseName { get; set; } = null!;

    /// <summary>
    /// Số tiết lý thuyết
    /// </summary>
    public LectureCredit LectureCredit { get; set; } = null!;

    /// <summary>
    /// Số tiết thực hành
    /// </summary>
    public LabCredit LabCredit { get; set; } = null!;
}
