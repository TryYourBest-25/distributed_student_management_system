using Shared.Api;

namespace AcademicService.Api.Faculty.Request;

public record FacultyParamsRequest(string? FacultyCode, string? FacultyName) : PageableParamRequest
{
} 