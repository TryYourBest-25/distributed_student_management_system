namespace AcademicService.Application.Course.Response;

public class CourseResponse
{
    public string CourseCode { get; set; } = null!;
    public string CourseName { get; set; } = null!;
    public uint LectureCredit { get; set; }
    public uint LabCredit { get; set; }
    // Có thể thêm FacultyResponse nếu CourseEf có liên kết đến FacultyEf
} 