using AcademicService.Application.DbContext;
using AcademicService.Application.Lecturers.Command;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace AcademicService.Application.Lecturers.CommandHandler;

public class DeleteLecturerByIdsCommandHandler(
    AcademicDbContext context,
    ILogger<DeleteLecturerByIdsCommandHandler> logger)
    : IRequestHandler<DeleteLecturerByIdsCommand, int>
{
    public async Task<int> Handle(DeleteLecturerByIdsCommand request, CancellationToken cancellationToken)
    {
        logger.LogInformation("Deleting lecturers {LecturerCodes}", request.LecturerCodes);

        var lecturers = await context.Lecturers
            .Where(l => request.LecturerCodes.Any(c => c == l.LecturerCode))
            .ExecuteDeleteAsync(cancellationToken: cancellationToken);

        return lecturers;
    }
}