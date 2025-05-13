using AcademicService.Application.DbContext;
using AcademicService.Application.Lecturer.Command;
using FluentResults;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AcademicService.Application.Lecturer.CommandHandler;

public class DeleteLecturerByIdsCommandHandler(AcademicDbContext context) : IRequestHandler<DeleteLecturerByIdsCommand, Result<Tuple<string, int>>>

{
    public async Task<Result<Tuple<string, int>>> Handle(DeleteLecturerByIdsCommand request, CancellationToken cancellationToken)
    {
        var lecturerCodes = request.LecturerCodes.Select(c => c.Value).ToList();
        var lecturers = await context.Lecturers
            .Where(l => lecturerCodes.Contains(l.LecturerCode))
            .ExecuteDeleteAsync(cancellationToken: cancellationToken);
        
        return lecturers > 0 ? Result.Ok(new Tuple<string, int>("Total", lecturers)) : Result.Fail(new Error("Không tìm thấy giảng viên nào để xóa"));
    }
} 