using Shared.Api;

namespace AcademicService.Api.Courses.Request;

public record CourseParamsRequest(string? CourseCode, string? CourseName, uint? LectureCredit, uint? LabCredit)
    : PageableParamRequest
{
}