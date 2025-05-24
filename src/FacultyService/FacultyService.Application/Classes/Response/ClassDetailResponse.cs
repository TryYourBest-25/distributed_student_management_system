using FacultyService.Application.Students.Response;

namespace FacultyService.Application.Classes.Response;

public record ClassDetailResponse : ClassBasicResponse
{
    public IList<StudentBasicResponse> Students { get; init; }
}