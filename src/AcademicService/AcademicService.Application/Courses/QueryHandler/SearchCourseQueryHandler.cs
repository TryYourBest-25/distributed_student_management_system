using AcademicService.Application.Courses.Query;
using AcademicService.Application.Courses.Response;
using AcademicService.Application.DbContext;
using Gridify;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Shared.Exception;
using Shared.Infra.Entity;

namespace AcademicService.Application.Courses.QueryHandler;

public class SearchCourseQueryHandler(AcademicDbContext context, ILogger logger)
    : IRequestHandler<SearchCourseQuery, Paging<CourseBasicResponse>>
{
    public async Task<Paging<CourseBasicResponse>> Handle(SearchCourseQuery request,
        CancellationToken cancellationToken)
    {
        var mapper = new GridifyMapper<Course>().GenerateMappings();

        if (!request.GridifyQuery.IsValid(mapper))
        {
            logger.LogWarning("Chuỗi truy vấn không hợp lệ: {Query}", request.GridifyQuery);
            throw new BadInputException("Chuỗi truy vấn không hợp lệ");
        }

        var courses = await context.Courses
            .AsNoTracking()
            .ApplyFiltering(request.GridifyQuery, mapper)
            .Select(c => new CourseBasicResponse
            {
                CourseCode = c.CourseCode,
                CourseName = c.CourseName,
                LectureCredit = c.LectureCredit,
                LabCredit = c.LabCredit
            }).ToListAsync(cancellationToken);

        return new Paging<CourseBasicResponse>
        {
            Count = courses.Count,
            Data = courses
        };
    }
}