using AcademicService.Application.Courses.Command;
using AcademicService.Application.DbContext;
using EntityFramework.Exceptions.Common;
using MediatR;
using Microsoft.Extensions.Logging;
using Shared.Domain.ValueObject;
using Shared.Exception;
using Shared.Infra.Entity;

namespace AcademicService.Application.Courses.CommandHandler;

public class CreateCourseCommandHandler(AcademicDbContext context, ILogger logger)
    : IRequestHandler<CreateCourseCommand, CourseCode>
{
    public async Task<CourseCode> Handle(CreateCourseCommand request, CancellationToken cancellationToken)
    {
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
            if (ex.Message.Contains("PRIMARY"))
            {
                throw new DuplicateException($"Mã khóa học {request.CourseCode} đã tồn tại");
            }

            if (ex.Message.Contains("course_name"))
            {
                throw new DuplicateException($"Tên khóa học {request.CourseName} đã tồn tại");
            }

            throw;
        }
    }
}