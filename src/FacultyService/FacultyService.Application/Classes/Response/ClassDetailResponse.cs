using Arch.EntityFrameworkCore.UnitOfWork.Collections;
using FacultyService.Application.Students.Response;

namespace FacultyService.Application.Classes.Response;

public record ClassDetailResponse : ClassBasicResponse
{
    public IPagedList<StudentBasicResponse> Students { get; init; }
}