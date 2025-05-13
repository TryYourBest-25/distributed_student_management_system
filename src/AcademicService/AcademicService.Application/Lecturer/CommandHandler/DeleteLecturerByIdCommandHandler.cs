using AcademicService.Application.DbContext;
using AcademicService.Application.Lecturer.Command;
using FluentResults;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Shared.Exception;

namespace AcademicService.Application.Lecturer.CommandHandler;

public class DeleteLecturerByIdCommandHandler(AcademicDbContext context) : IRequestHandler<DeleteLecturerByIdCommand, Result>
{
    public async Task<Result> Handle(DeleteLecturerByIdCommand request, CancellationToken cancellationToken)
    {
        var lecturer = await context.Lecturers.FindAsync(request.LecturerCode.Value, cancellationToken) 
            ?? throw new ResourceNotFoundException($"Giảng viên với mã {request.LecturerCode.Value} không tồn tại");

        context.Lecturers.Remove(lecturer);
        var result = await context.SaveChangesAsync(cancellationToken);

        return result > 0 ? Result.Ok() : Result.Fail(new Error("Không thể xóa giảng viên"));
    }
} 