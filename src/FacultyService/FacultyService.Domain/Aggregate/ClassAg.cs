using FacultyService.Domain.ValueObject;
using Shared.Domain.Model;

namespace FacultyService.Domain.Aggregate;

public class ClassAg : AggregateRootBase<ClassId>
{
    public ClassAg(ClassId id)
        : base(id)
    {
    }
    
    public AcademicYearCode AcademicYear { get; set; } = null!;
    
    public ClassName ClassName { get; set; } = null!;
    
    
}