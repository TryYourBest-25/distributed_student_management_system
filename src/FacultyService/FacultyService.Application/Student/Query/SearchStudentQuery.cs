using FacultyService.Application.Student.Response;
using Gridify;
using MediatR;

namespace FacultyService.Application.Student.Query;

public record SearchStudentQuery(GridifyQuery GridifyQuery) : IRequest<Paging<StudentResponse>>
{
} 