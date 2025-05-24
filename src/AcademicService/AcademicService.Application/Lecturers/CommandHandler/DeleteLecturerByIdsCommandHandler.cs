using AcademicService.Application.DbContext;
using AcademicService.Application.Lecturers.Command;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AcademicService.Application.Lecturers.CommandHandler;

public class DeleteLecturerByIdsCommandHandler(AcademicDbContext context)
    : IRequestHandler<DeleteLecturerByIdsCommand, int>
{
    public async Task<int> Handle(DeleteLecturerByIdsCommand request, CancellationToken cancellationToken)
    {
        var lecturers = await context.Lecturers
            .Where(l => request.LecturerCodes.Any(c => c == l.LecturerCode))
            .ExecuteDeleteAsync(cancellationToken: cancellationToken);

        return lecturers;
    }
}