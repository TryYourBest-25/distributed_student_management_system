namespace FacultyService.Application.Class.Response;

public record ClassResponse
{
    public string ClassCode { get; set; }
    public string ClassName { get; set; }
    public string FacultyCode { get; set; }
    public string FacultyName { get; set; }
    
    public int StudentCount { get; set; }
    
    
}