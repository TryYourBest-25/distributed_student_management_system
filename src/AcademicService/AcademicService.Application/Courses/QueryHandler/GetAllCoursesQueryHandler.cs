using AcademicService.Application.Courses.Query;
using AcademicService.Application.Courses.Response;
using AcademicService.Application.DbContext;
using Arch.EntityFrameworkCore.UnitOfWork.Collections;
using Gridify;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AcademicService.Application.Courses.QueryHandler;

public class GetAllCoursesQueryHandler(AcademicDbContext context)
    : IRequestHandler<DefaultCourseQuery, IPagedList<CourseBasicResponse>>
{
    public async Task<IPagedList<CourseBasicResponse>> Handle(DefaultCourseQuery request,
        CancellationToken cancellationToken)
    {
        var query = await context.Courses
            .ApplyOrdering(request.GridifyQuery)
            .Select(c => new CourseBasicResponse
            {
                CourseCode = c.CourseCode,
                CourseName = c.CourseName,
                LectureCredit = c.LectureCredit,
                LabCredit = c.LabCredit
            }).ToPagedListAsync(request.GridifyQuery.Page, request.GridifyQuery.PageSize,
                cancellationToken: cancellationToken);

        return query;
    }
}