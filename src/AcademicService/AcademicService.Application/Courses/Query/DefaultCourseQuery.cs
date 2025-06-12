using AcademicService.Application.Courses.Response;
using Arch.EntityFrameworkCore.UnitOfWork.Collections;
using Gridify;
using MediatR;
using Shared.Api;

namespace AcademicService.Application.Courses.Query;

public record DefaultCourseQuery(GridifyQuery GridifyQuery) : IRequest<IPagedList<CourseBasicResponse>>;