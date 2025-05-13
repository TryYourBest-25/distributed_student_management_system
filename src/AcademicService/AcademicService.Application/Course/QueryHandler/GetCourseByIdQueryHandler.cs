using AcademicService.Application.Course.Query;
using AcademicService.Application.Course.Response;
using AcademicService.Application.DbContext;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AcademicService.Application.Course.QueryHandler;

public class GetCourseByIdQueryHandler(AcademicDbContext context)
    : IRequestHandler<CourseByIdQuery, CourseResponse?>
{
    public async Task<CourseResponse?> Handle(CourseByIdQuery request, CancellationToken cancellationToken)
    {
        var course = await context.Courses
            .AsNoTracking()
            .Where(c => c.CourseCode == request.CourseCode)
            .Select(c => new CourseResponse
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