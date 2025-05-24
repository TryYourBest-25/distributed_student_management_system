namespace FacultyService.Api.Classes.Request;

public record class ClassBasicRequest
{
    public string ClassCode { get; set; }
    public string ClassName { get; set; }

    public string AcademicYearCode { get; set; }
}