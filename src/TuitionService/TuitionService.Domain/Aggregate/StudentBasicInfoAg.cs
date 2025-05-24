using Shared.Domain.Model;
using Shared.Domain.ValueObject;

namespace TuitionService.Domain.Aggregate;

public class StudentBasicInfoAg : AggregateRootBase<StudentCode>
{
    public StudentBasicInfoAg(StudentCode id) : base(id)
    {
    }

    public LastName LastName { get; set; } = null!;
    public FirstName FirstName { get; set; } = null!;
    public ClassCode ClassCode { get; set; } = null!;
    public FacultyCode FacultyCode { get; set; } = null!;
}