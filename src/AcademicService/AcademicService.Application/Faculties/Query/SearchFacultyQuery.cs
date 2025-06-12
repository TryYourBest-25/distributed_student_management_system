using AcademicService.Application.Faculties.Response;
using Gridify;
using MediatR;

namespace AcademicService.Application.Faculties.Query;

public record SearchFacultyQuery(GridifyQuery GridifyQuery) : IRequest<Paging<FacultyBasicResponse>>;