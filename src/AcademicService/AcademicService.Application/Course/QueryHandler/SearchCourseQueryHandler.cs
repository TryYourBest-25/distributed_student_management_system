using AcademicService.Application.Course.Query;
using AcademicService.Application.Course.Response;
using AcademicService.Application.DbContext;
using Gridify;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Shared.Exception;
using Shared.Infra.Entity;

namespace AcademicService.Application.Course.QueryHandler;

public class SearchCourseQueryHandler : IRequestHandler<SearchCourseQuery, Paging<CourseResponse>>
{
    private readonly AcademicDbContext _context;
    public SearchCourseQueryHandler(AcademicDbContext context)
    {
        _context = context;
    }
    public async Task<Paging<CourseResponse>> Handle(SearchCourseQuery request, CancellationToken cancellationToken)
    {
        var mapper = new GridifyMapper<CourseEf>().GenerateMappings();

        if (!request.GridifyQuery.IsValid(mapper))
        {
            throw new BadInputException("Chuỗi truy vấn không hợp lệ");
        }

        var courses = await _context.Courses
            .AsNoTracking()
            .ApplyFiltering(request.GridifyQuery, mapper)
            .Select(c => new CourseResponse
            {
                CourseCode = c.CourseCode,
                CourseName = c.CourseName,
                LectureCredit = c.LectureCredit,
                LabCredit = c.LabCredit
            }).ToListAsync(cancellationToken);

        return new Paging<CourseResponse>
        {
            Count = courses.Count,
            Data = courses
        };
    }
}