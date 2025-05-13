namespace AcademicService.Application.Course.Response;

public record CourseBasicResponse
{
    public string CourseCode { get; set; } = null!;
    public string CourseName { get; set; } = null!;
    public uint LectureCredit { get; set; }
    public uint LabCredit { get; set; }
}