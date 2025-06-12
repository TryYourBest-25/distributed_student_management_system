namespace FacultyService.Api.CreditClasses.Request;

public class CreditClassBasicRequest
{
    public string LecturerCode { get; set; } = null!;
    public string CourseCode { get; set; } = null!;
    public ushort GroupNumber { get; set; }
    public int Semester { get; set; }
    public ushort MinStudent { get; set; }
    public string AcademicYearCode { get; set; } = null!;
}