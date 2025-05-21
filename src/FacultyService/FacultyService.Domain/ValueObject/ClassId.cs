using Shared.Domain.ValueObject;

namespace FacultyService.Domain.ValueObject;

public record ClassId
{
    public ClassCode ClassCode { get; }
    public FacultyCode FacultyCode { get; }
    
    public ClassId(ClassCode classCode, FacultyCode facultyCode)
    {
        ArgumentNullException.ThrowIfNull(classCode, nameof(classCode));
        ArgumentNullException.ThrowIfNull(facultyCode, nameof(facultyCode));
        ClassCode = classCode;
        FacultyCode = facultyCode;
    }
    
    
}