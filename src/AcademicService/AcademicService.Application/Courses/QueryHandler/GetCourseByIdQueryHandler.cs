using AcademicService.Application.Courses.Query;
using AcademicService.Application.Courses.Response;
using AcademicService.Application.DbContext;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AcademicService.Application.Courses.QueryHandler;

public class GetCourseByIdQueryHandler(AcademicDbContext context)
    : IRequestHandler<CourseByIdQuery, CourseBasicResponse?>
{
    public async Task<CourseBasicResponse?> Handle(CourseByIdQuery request, CancellationToken cancellationToken)
    {
        var course = await context.Courses
            .AsNoTracking()
            .Where(c => c.CourseCode == request.CourseCode.Value)
            .Select(c => new CourseBasicResponse
            {
                CourseCode = c.CourseCode,
                CourseName = c.CourseName,
                LectureCredit = c.LectureCredit,
                LabCredit = c.LabCredit
            })
            .FirstOrDefaultAsync(cancellationToken);

        return course;
    }
}