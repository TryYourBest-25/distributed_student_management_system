using FacultyService.Application.Student.Response;

namespace FacultyService.Application.Class.Response;

public record ClassDetailResponse : ClassResponse
{
    public IList<StudentResponse> Students { get; init; }
}