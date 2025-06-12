using Arch.EntityFrameworkCore.UnitOfWork.Collections;
using FacultyService.Application.Students.Response;
using Gridify;
using MediatR;
using Shared.Domain.ValueObject;

namespace FacultyService.Application.Students.Query;

public record StudentInClassQuery(GridifyQuery GridifyQuery, ClassCode ClassCode)
    : IRequest<IPagedList<StudentBasicResponse>>;