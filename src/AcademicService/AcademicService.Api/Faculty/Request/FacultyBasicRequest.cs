namespace AcademicService.Api.Faculty.Request;

public class FacultyBasicRequest
{
    public string FacultyCode { get; set; } = null!;
    public string FacultyName { get; set; } = null!;
    public string? Description { get; set; }
} 