namespace TuitionService.Api.Controllers.Request;

public record class RequiredTuitionStudentRequest
{
    public string AcademicYear { get; set; }

    public int Semester { get; set; }

    public int TuitionFee { get; set; }
}