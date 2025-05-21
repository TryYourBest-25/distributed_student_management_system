using FacultyService.Application.Class.Response;
using Gridify;
using MediatR;

namespace FacultyService.Application.Class.Query;

public record SearchClassQuery(GridifyQuery GridifyQuery) : IRequest<Paging<ClassResponse>>
{
} 