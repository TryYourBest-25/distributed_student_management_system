using AcademicService.Application.Faculty.Response;
using Gridify;
using MediatR;

namespace AcademicService.Application.Faculty.Query;

public record SearchFacultyQuery(GridifyQuery GridifyQuery) : IRequest<Paging<FacultyResponse>>; 