namespace FacultyService.Application.CreditClasses.Response;

public record CreditClassForStudentResponse
{
    public int Id { get; set; }
    public string CourseCode { get; set; } = null!;
    public int LectureCredit { get; set; }
    public int LabCredit { get; set; }
    public string LecturerName { get; set; } = null!;
    public string LecturerCode { get; set; } = null!;
    public int GroupNumber { get; set; }
    public int CurrentStudent { get; set; }
    public int MinStudent { get; set; }
    public string AcademicYear { get; set; } = null!;
    public int Semester { get; set; }

    public bool IsRegistered { get; set; }
}