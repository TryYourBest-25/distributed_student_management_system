using FacultyService.Domain.ValueObject;
using Shared.Domain.Model;
using Shared.Domain.ValueObject;

namespace FacultyService.Domain.Aggregate;

public class StudentAg : AggregateRootBase<StudentId>
{
    public StudentAg(StudentId id)
        : base(id)
    {
    }
    
    public LastName LastName { get; set; } = null!;
    
    public FirstName FirstName { get; set; } = null!;
    
    public ClassCode ClassCode { get; set; } = null!;
    
    public Gender? Gender { get; set; }
    
    public DateOnly? Birthdate { get; set; }
    
    public string? Address { get; set; }
    
    public bool? IsSuspended { get; set; }
    
    public string FullName => $"{LastName} {FirstName}";
    
    
}