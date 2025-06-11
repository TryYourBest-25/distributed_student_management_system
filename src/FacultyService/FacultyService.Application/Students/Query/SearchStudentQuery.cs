using Arch.EntityFrameworkCore.UnitOfWork.Collections;
using FacultyService.Application.Students.Response;
using Gridify;
using MediatR;

namespace FacultyService.Application.Students.Query;

public record SearchStudentQuery(GridifyQuery GridifyQuery) : IRequest<IPagedList<StudentBasicResponse>>
{
}