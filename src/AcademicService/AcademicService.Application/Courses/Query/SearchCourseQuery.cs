using AcademicService.Application.Courses.Response;
using Gridify;
using MediatR;

namespace AcademicService.Application.Courses.Query;

public record SearchCourseQuery(GridifyQuery GridifyQuery) : IRequest<Paging<CourseBasicResponse>>
{
}