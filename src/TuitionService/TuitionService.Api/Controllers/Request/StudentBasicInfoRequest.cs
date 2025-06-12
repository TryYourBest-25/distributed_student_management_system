using Shared.Domain.ValueObject;

namespace TuitionService.Api.Controllers.Request;

public record StudentBasicInfoRequest
{
    public string StudentCode { get; set; } = null!;
    public string LastName { get; set; } = null!;
    public string FirstName { get; set; } = null!;
    public string ClassCode { get; set; } = null!;
    public string FacultyCode { get; set; } = null!;
}