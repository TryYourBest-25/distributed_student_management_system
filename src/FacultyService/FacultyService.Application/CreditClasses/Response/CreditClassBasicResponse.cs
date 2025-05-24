namespace FacultyService.Application.CreditClasses.Response;

public record CreditClassBasicResponse
{
    public int Id { get; set; }
    public string CourseCode { get; set; } = null!;
    public int GroupNumber { get; set; }
    public int CurrentStudent { get; set; }
    public int MinStudent { get; set; }
    public string AcademicYear { get; set; } = null!;
    public int Semester { get; set; }
}