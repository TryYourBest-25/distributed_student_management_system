using FacultyService.Domain.ValueObject;
using Shared.Domain.Model;
using Shared.Domain.ValueObject;

namespace FacultyService.Domain.Aggregate;

public class CreditClassAg : AggregateRootBase<CreditClassId>
{
    public CreditClassAg(CreditClassId id)
        : base(id)
    {
    }
    
    public AcademicYearCode AcademicYear { get; set; } = null!;

    public ushort Semester { get; set; } 
    
    public CourseCode CourseCode { get; set; } = null!;
    
    public GroupNumber GroupNumber { get; set; } = null!;
    
    public ushort MinStudent { get; set; }

    public bool IsCancelled { get; set; } = false;
    
    

}