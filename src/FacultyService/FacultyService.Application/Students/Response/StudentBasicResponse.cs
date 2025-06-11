using Shared.Domain.ValueObject;

namespace FacultyService.Application.Students.Response;

public record StudentBasicResponse
{
    public Gender Gender { get; set; }
    public string StudentCode { get; set; }
    public string FirstName { get; set; }
    public string LastName { get; set; }
    public DateOnly? BirthDate { get; set; }
    public string? Address { get; set; }
    public bool IsSuspended { get; set; }
    public string ClassCode { get; set; }
    public string FacultyCode { get; set; }
}