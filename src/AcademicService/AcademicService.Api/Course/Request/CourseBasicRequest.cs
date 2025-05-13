namespace AcademicService.Api.Course.Request;

public class CourseBasicRequest
{
    public string CourseCode { get; set; } = null!;
    public string CourseName { get; set; } = null!;
    public uint LectureCredit { get; set; }
    public uint LabCredit { get; set; }
}