using Shared.Api;

namespace AcademicService.Api.Faculties.Request;

public record FacultyParamsRequest(string? FacultyCode, string? FacultyName) : PageableParamRequest
{
}