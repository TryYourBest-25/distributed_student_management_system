using AcademicService.Application.Courses.Command;
using AcademicService.Application.DbContext;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Shared.Domain.ValueObject;
using Shared.Exception;

namespace AcademicService.Application.Courses.CommandHandler;

public class DeleteCourseByIdCommandHandler(AcademicDbContext context, ILogger logger)
    : IRequestHandler<DeleteCourseByIdCommand, CourseCode>
{
    public async Task<CourseCode> Handle(DeleteCourseByIdCommand request, CancellationToken cancellationToken)
    {
        var course =
            await context.Courses.Where(c => c.CourseCode == request.CourseCode.Value)
                .FirstOrDefaultAsync(cancellationToken) ??
            throw new ResourceNotFoundException($"Khóa học với mã {request.CourseCode} không tồn tại");

        context.Courses.Remove(course);
        await context.SaveChangesAsync(cancellationToken);
        return request.CourseCode;
    }
}