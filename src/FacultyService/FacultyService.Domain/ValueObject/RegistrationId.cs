namespace FacultyService.Domain.ValueObject;

public record RegistrationId
{
    public CreditClassId CreditClassId { get; }
    
    public StudentCode StudentCode { get; }
    
    public RegistrationId(CreditClassId creditClassId, StudentCode studentCode)
    {
        ArgumentNullException.ThrowIfNull(studentCode, nameof(studentCode));
        ArgumentNullException.ThrowIfNull(creditClassId, nameof(creditClassId));
        CreditClassId = creditClassId;
        StudentCode = studentCode;
    }
    
    
}