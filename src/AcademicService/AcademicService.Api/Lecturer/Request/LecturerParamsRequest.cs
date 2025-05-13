using Shared.Api;

namespace AcademicService.Api.Lecturer.Request;

public record LecturerParamsRequest(string? LecturerCode, string? FirstName, string? LastName, string? FacultyCode) : PageableParamRequest
{
} 