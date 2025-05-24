namespace AcademicService.Application.Courses.Response;

public class CourseBasicResponse
{
    public string CourseCode { get; set; } = null!;
    public string CourseName { get; set; } = null!;
    public uint LectureCredit { get; set; }

    public uint LabCredit { get; set; }
    // Có thể thêm FacultyBasicResponse nếu CourseEf có liên kết đến Faculty
}