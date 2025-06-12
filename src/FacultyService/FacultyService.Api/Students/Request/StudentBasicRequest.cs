using Microsoft.AspNetCore.Mvc;

namespace FacultyService.Api.Students.Request;

public record class StudentBasicRequest
{
    public string FirstName { get; set; } = null!;
    public string LastName { get; set; } = null!;
    public string? Address { get; set; }
    public bool Gender { get; set; }
    public string? BirthDate { get; set; }
    public bool? IsSuspended { get; set; }
}