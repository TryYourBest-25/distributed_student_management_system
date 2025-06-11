namespace FacultyService.Application.Classes.Response;

public record ClassBasicResponse
{
    public string ClassCode { get; set; } = null!;
    public string ClassName { get; set; } = null!;
    public string FacultyCode { get; set; } = null!;
    public string FacultyName { get; set; } = null!;

    public int StudentCount { get; set; }

    public string AcademicYearCode { get; set; } = null!;
}