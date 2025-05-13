using AcademicService.Application.Course.Response;
using Gridify;
using MediatR;

namespace AcademicService.Application.Course.Query;

public record SearchCourseQuery(GridifyQuery GridifyQuery) : IRequest<Paging<CourseResponse>>
{
}