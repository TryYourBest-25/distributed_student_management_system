using Shared.Api;

namespace AcademicService.Api.Course.Request;

public record CourseParamsRequest(string? CourseCode, string? CourseName, uint? LectureCredit, uint? LabCredit) : PageableParamRequest
{
}