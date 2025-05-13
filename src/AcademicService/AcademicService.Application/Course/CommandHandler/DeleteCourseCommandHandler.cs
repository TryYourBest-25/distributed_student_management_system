using AcademicService.Application.Course.Command;
using AcademicService.Application.DbContext;
using FluentResults;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Shared.Exception;

namespace AcademicService.Application.Course.CommandHandler;

public class DeleteCourseCommandHandler(AcademicDbContext context) : IRequestHandler<DeleteCourseByIdCommand, Result   >
{
    public async Task<Result> Handle(DeleteCourseByIdCommand request, CancellationToken cancellationToken)
    {
        var course = await context.Courses.FindAsync(request.CourseCode.Value, cancellationToken) ?? throw new ResourceNotFoundException($"Khóa học với mã {request.CourseCode} không tồn tại");

        context.Courses.Remove(course);
        var result = await context.SaveChangesAsync(cancellationToken);

        return result > 0 ? Result.Ok() : Result.Fail(new Error("Không thể xóa khóa học"));
    }
} 