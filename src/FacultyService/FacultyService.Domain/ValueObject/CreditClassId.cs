using Shared.Domain.ValueObject;

namespace FacultyService.Domain.ValueObject;

public record CreditClassId
{
    public int? Id { get; }
    public FacultyCode FacultyCode { get; }
    
    public CreditClassId(int? id, FacultyCode facultyCode)
    {
        ArgumentNullException.ThrowIfNull(facultyCode, nameof(facultyCode));
        Id = id;
        FacultyCode = facultyCode;
    }
}