using AcademicService.Application.Lecturers.Response;
using Arch.EntityFrameworkCore.UnitOfWork.Collections;
using Gridify;
using MediatR;

namespace AcademicService.Application.Lecturers.Query;

public record SearchLecturerQuery(GridifyQuery GridifyQuery) : IRequest<IPagedList<LecturerResponse>>;