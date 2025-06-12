using Arch.EntityFrameworkCore.UnitOfWork.Collections;
using FacultyService.Application.Classes.Response;
using Gridify;
using MediatR;

namespace FacultyService.Application.Classes.Query;

public record DefaultClassQuery(GridifyQuery GridifyQuery) : IRequest<IPagedList<ClassBasicResponse>>;