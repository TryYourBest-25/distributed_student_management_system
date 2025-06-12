using AcademicService.Application.Faculties.Response;
using Arch.EntityFrameworkCore.UnitOfWork.Collections;
using Gridify;
using MediatR;

namespace AcademicService.Application.Faculties.Query;

public record DefaultFacultyQuery(GridifyQuery GridifyQuery)
    : IRequest<IPagedList<FacultyBasicResponse>>;