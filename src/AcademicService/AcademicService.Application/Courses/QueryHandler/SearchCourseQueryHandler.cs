using AcademicService.Application.Courses.Query;
using AcademicService.Application.Courses.Response;
using AcademicService.Application.DbContext;
using Arch.EntityFrameworkCore.UnitOfWork.Collections;
using Gridify;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Shared.Exception;
using Shared.Infra.Entity;

namespace AcademicService.Application.Courses.QueryHandler;

public class SearchCourseQueryHandler(AcademicDbContext context)
    : IRequestHandler<SearchCourseQuery, IPagedList<CourseBasicResponse>>
{
    public async Task<IPagedList<CourseBasicResponse>> Handle(SearchCourseQuery request,
        CancellationToken cancellationToken)
    {
        var mapper = new GridifyMapper<Course>().GenerateMappings();

        if (!request.GridifyQuery.IsValid(mapper))
        {
            throw new BadInputException("Chuỗi truy vấn không hợp lệ");
        }

        var courses = await context.Courses
            .AsNoTracking()
            .ApplyFiltering(request.GridifyQuery, mapper)
            .ApplyOrdering(request.GridifyQuery.OrderBy ?? "CourseCode")
            .Select(c => new CourseBasicResponse
            {
                CourseCode = c.CourseCode,
                CourseName = c.CourseName,
                LectureCredit = c.LectureCredit,
                LabCredit = c.LabCredit
            }).ToPagedListAsync(request.GridifyQuery.Page, request.GridifyQuery.PageSize,
                cancellationToken: cancellationToken);

        return courses;
    }
}