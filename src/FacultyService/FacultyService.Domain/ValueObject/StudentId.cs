using Shared.Domain.ValueObject;

namespace FacultyService.Domain.ValueObject;

public record StudentId
{
    public StudentCode StudentCode { get; }
    public FacultyCode FacultyCode { get; }
    
    public StudentId(StudentCode studentCode, FacultyCode facultyCode)
    {
        ArgumentNullException.ThrowIfNull(studentCode, nameof(studentCode));
        ArgumentNullException.ThrowIfNull(facultyCode, nameof(facultyCode));
        StudentCode = studentCode;
        FacultyCode = facultyCode;
    }
}