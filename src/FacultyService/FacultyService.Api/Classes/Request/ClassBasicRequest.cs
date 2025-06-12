namespace FacultyService.Api.Classes.Request;

public record class ClassBasicRequest
{
    public string ClassCode { get; set; } = null!;
    public string ClassName { get; set; } = null!;

    public string AcademicYearCode { get; set; } = null!;
}