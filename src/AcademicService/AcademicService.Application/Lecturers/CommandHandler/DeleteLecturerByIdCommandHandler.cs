using AcademicService.Application.DbContext;
using AcademicService.Application.Lecturers.Command;
using FluentResults;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Shared.Domain.ValueObject;
using Shared.Exception;

namespace AcademicService.Application.Lecturers.CommandHandler;

public class DeleteLecturerByIdCommandHandler(AcademicDbContext context)
    : IRequestHandler<DeleteLecturerByIdCommand, LecturerCode>
{
    public async Task<LecturerCode> Handle(DeleteLecturerByIdCommand request, CancellationToken cancellationToken)
    {
        var lecturer = await context.Lecturers.Where(l => l.LecturerCode == request.LecturerCode.Value)
                           .FirstOrDefaultAsync(cancellationToken)
                       ?? throw new ResourceNotFoundException(
                           $"Giảng viên với mã {request.LecturerCode.Value} không tồn tại");

        context.Lecturers.Remove(lecturer);
        await context.SaveChangesAsync(cancellationToken);

        return request.LecturerCode;
    }
}