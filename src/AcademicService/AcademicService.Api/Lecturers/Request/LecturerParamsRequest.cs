using Shared.Api;

namespace AcademicService.Api.Lecturers.Request;

public record LecturerParamsRequest(string? LecturerCode, string? FirstName, string? LastName, string? FacultyCode)
    : PageableParamRequest
{
}