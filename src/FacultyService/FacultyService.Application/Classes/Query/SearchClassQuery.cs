using FacultyService.Application.Classes.Response;
using Gridify;
using MediatR;

namespace FacultyService.Application.Classes.Query;

public record SearchClassQuery(GridifyQuery GridifyQuery) : IRequest<Paging<ClassBasicResponse>>
{
}