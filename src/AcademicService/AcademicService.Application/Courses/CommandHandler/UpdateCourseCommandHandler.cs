using AcademicService.Application.Courses.Command;
using AcademicService.Application.DbContext;
using EntityFramework.Exceptions.Common;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Shared.Domain.ValueObject;
using Shared.Exception;

namespace AcademicService.Application.Courses.CommandHandler;

public class UpdateCourseCommandHandler(AcademicDbContext context, ILogger logger)
    : IRequestHandler<UpdateCourseCommand, CourseCode>
{
    public async Task<CourseCode> Handle(UpdateCourseCommand request, CancellationToken cancellationToken)
    {
        var course = await context.Courses.Where(c => c.CourseCode == request.OldCourseCode.Value)
                         .FirstOrDefaultAsync(cancellationToken) ??
                     throw new ResourceNotFoundException($"Khóa học với mã {request.CourseCode} không tồn tại");

        course.CourseName = request.CourseName;
        course.LectureCredit = request.LectureCredit;
        course.LabCredit = request.LabCredit;
        course.CourseCode = request.CourseCode;

        try
        {
            context.Courses.Update(course);
            await context.SaveChangesAsync(cancellationToken);
            return course.CourseCode;
        }
        catch (UniqueConstraintException ex)
        {
            if (ex.Message.Contains("course_code"))
            {
                throw new DuplicateException($"Mã khóa học {course.CourseCode} đã tồn tại");
            }

            if (ex.Message.Contains("course_name"))
            {
                throw new DuplicateException($"Tên khóa học {course.CourseName} đã tồn tại");
            }

            logger.LogError(ex, "Lỗi khi cập nhật khóa học");
            throw;
        }
    }
}