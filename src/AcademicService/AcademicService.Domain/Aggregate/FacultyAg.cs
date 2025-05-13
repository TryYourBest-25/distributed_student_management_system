using AcademicService.Domain.ValueObject;
using Shared.Domain;
using Shared.Domain.Model;

namespace AcademicService.Domain.Aggregate;

/// <summary>
/// Bảng chứa thông tin các khoa
/// </summary>
public partial class FacultyAg(FacultyCode facultyCode) : AggregateRootBase<FacultyCode>(facultyCode)
{

    /// <summary>
    /// Tên khoa
    /// </summary>
    public FacultyName FacultyName { get; set; } = null!;

}
