namespace TuitionService.Api.Response;

public record StudentBasicResponse
{
    public string StudentCode { get; set; }
    public string LastName { get; set; }
    public string FirstName { get; set; }
    public string ClassCode { get; set; }

    public string FacultyCode { get; set; }
}