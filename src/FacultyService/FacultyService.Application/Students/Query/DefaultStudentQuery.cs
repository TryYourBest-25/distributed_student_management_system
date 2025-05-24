using Arch.EntityFrameworkCore.UnitOfWork.Collections;
using FacultyService.Application.Students.Response;
using Gridify;
using MediatR;

namespace FacultyService.Application.Students.Query;

public record DefaultStudentQuery(GridifyQuery GridifyQuery) : IRequest<IPagedList<StudentBasicResponse>>;