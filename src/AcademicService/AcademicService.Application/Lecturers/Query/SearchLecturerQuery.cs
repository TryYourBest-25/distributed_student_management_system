using AcademicService.Application.Lecturers.Response;
using Gridify;
using MediatR;

namespace AcademicService.Application.Lecturers.Query;

public record SearchLecturerQuery(GridifyQuery GridifyQuery) : IRequest<Paging<LecturerResponse>>;