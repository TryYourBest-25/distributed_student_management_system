using AcademicService.Application.Courses.Response;
using Arch.EntityFrameworkCore.UnitOfWork.Collections;
using Gridify;
using MediatR;

namespace AcademicService.Application.Courses.Query;

public record SearchCourseQuery(GridifyQuery GridifyQuery) : IRequest<IPagedList<CourseBasicResponse>>;