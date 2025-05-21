using FacultyService.Domain.ValueObject;
using Shared.Domain.ValueObject;

namespace FacultyService.Application.Student.StudentReader;

public class StudentRecord
{
    public StudentCode StudentCode { get; set; } = null!;
    public ClassCode ClassCode { get; set; } = null!;
    public LastName LastName { get; set; } = null!;
    public FirstName FirstName { get; set; } = null!;
    public string? Address { get; set; }
    public DateOnly? BirthDate { get; set; }
    public Gender? Gender { get; set; }
    public bool IsSuspended { get; set; } = false;


}