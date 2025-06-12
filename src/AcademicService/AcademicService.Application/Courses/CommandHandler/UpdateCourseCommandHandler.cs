using AcademicService.Application.Courses.Command;
using AcademicService.Application.DbContext;
using EntityFramework.Exceptions.Common;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Shared.Domain.ValueObject;
using Shared.Exception;

namespace AcademicService.Application.Courses.CommandHandler;

public class UpdateCourseCommandHandler(AcademicDbContext context, ILogger<UpdateCourseCommandHandler> logger)
    : IRequestHandler<UpdateCourseCommand, CourseCode>
{
    public async Task<CourseCode> Handle(UpdateCourseCommand request, CancellationToken cancellationToken)
    {
        logger.LogInformation("Updating course {OldCourseCode} to {NewCourseCode}", request.OldCourseCode,
            request.CourseCode);

        try
        {
            var result = await context.Courses.Where(c => c.CourseCode == request.OldCourseCode.Value)
                .ExecuteUpdateAsync(c => c.SetProperty(p => p.CourseCode, request.CourseCode.Value)
                    .SetProperty(p => p.CourseName, request.CourseName.Value)
                    .SetProperty(p => p.LectureCredit, request.LectureCredit.Value)
                    .SetProperty(p => p.LabCredit, request.LabCredit.Value), cancellationToken);

            return result > 0
                ? request.CourseCode
                : throw new ResourceNotFoundException("Không tìm thấy khóa học với mã {request.OldCourseCode}");
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

            logger.LogError(ex, "Lỗi khi cập nhật khóa học");
            throw;
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Lỗi khi cập nhật khóa học");
            throw;
        }
    }
}