using AcademicService.Application.Courses.Command;
using AcademicService.Application.DbContext;
using EntityFramework.Exceptions.Common;
using MediatR;
using Microsoft.Extensions.Logging;
using Shared.Domain.ValueObject;
using Shared.Exception;
using Shared.Infra.Entity;

namespace AcademicService.Application.Courses.CommandHandler;

public class CreateCourseCommandHandler(AcademicDbContext context, ILogger<CreateCourseCommandHandler> logger)
    : IRequestHandler<CreateCourseCommand, CourseCode>
{
    public async Task<CourseCode> Handle(CreateCourseCommand request, CancellationToken cancellationToken)
    {
        logger.LogInformation("Creating course {CourseCode} with name {CourseName}", request.CourseCode,
            request.CourseName);

        var courseEf = new Course
        {
            CourseCode = request.CourseCode,
            CourseName = request.CourseName,
            LectureCredit = request.LectureCredit,
            LabCredit = request.LabCredit
        };

        try
        {
            await context.Courses.AddAsync(courseEf, cancellationToken);
            await context.SaveChangesAsync(cancellationToken);
            return courseEf.CourseCode;
        }
        catch (UniqueConstraintException ex)
        {
            if (ex.InnerException?.Message.Contains("pk") ?? false)
            {
                throw new DuplicateException($"Mã khóa học {request.CourseCode} đã tồn tại");
            }

            if (ex.InnerException?.Message.Contains("uq") ?? false)
            {
                throw new DuplicateException($"Tên khóa học {request.CourseName} đã tồn tại");
            }

            throw;
        }
    }
}