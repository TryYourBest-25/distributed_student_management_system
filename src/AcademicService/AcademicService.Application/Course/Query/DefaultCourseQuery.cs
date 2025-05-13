using AcademicService.Application.Course.Response;
using Arch.EntityFrameworkCore.UnitOfWork.Collections;
using MediatR;
using Shared.Api;

namespace AcademicService.Application.Course.Query;

public record DefaultCourseQuery(string? OrderBy, bool Desc = false, int Page = 0, int Size = 10) : OrderableParamRequest(OrderBy, Desc, Page, Size), IRequest<IPagedList<CourseResponse>>;