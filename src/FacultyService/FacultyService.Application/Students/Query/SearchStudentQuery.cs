using FacultyService.Application.Students.Response;
using Gridify;
using MediatR;

namespace FacultyService.Application.Students.Query;

public record SearchStudentQuery(GridifyQuery GridifyQuery) : IRequest<Paging<StudentBasicResponse>>
{
}