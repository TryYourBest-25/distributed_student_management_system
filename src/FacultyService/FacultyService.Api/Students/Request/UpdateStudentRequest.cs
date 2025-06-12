namespace FacultyService.Api.Students.Request;

public record class UpdateStudentRequest : StudentBasicRequest
{
    public string? NewStudentCode { get; set; }
}