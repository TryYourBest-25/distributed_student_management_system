namespace AcademicService.Application.Lecturers.Response;

public class LecturerResponse
{
    public string LecturerCode { get; set; } = null!;
    public string FirstName { get; set; } = null!;
    public string LastName { get; set; } = null!;
    public string? Degree { get; set; }
    public string? AcademicRank { get; set; }
    public string? Specialization { get; set; }

    public string FacultyCode { get; set; } = null!;
}