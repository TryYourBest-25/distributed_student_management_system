namespace TuitionService.Api.Controllers.Request;

public record class DeleteStudentTuitionRequest
{
    public string AcademicYear { get; init; }
    public int Semester { get; init; }
}