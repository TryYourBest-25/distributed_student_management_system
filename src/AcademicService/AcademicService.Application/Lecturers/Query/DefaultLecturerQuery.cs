using AcademicService.Application.Lecturers.Response;
using Arch.EntityFrameworkCore.UnitOfWork.Collections;
using MediatR;
using Gridify;

namespace AcademicService.Application.Lecturers.Query;

public record DefaultLecturerQuery(GridifyQuery GridifyQuery) : IRequest<IPagedList<LecturerResponse>>;