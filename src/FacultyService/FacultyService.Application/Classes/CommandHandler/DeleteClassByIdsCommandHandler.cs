using System;
using FacultyService.Application.Classes.Command;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace FacultyService.Application.Classes.CommandHandler;

public class DeleteClassByIdsCommandHandler(FacultyDbContext dbContext, ILogger<DeleteClassByIdsCommandHandler> logger)
    : IRequestHandler<DeleteClassByIdsCommand, int>
{
    public async Task<int> Handle(DeleteClassByIdsCommand request, CancellationToken cancellationToken)
    {
        await using var transaction = await dbContext.Database.BeginTransactionAsync(cancellationToken);
        try
        {
            var classCodes = request.ClassCodes.Select(c => c.Value).ToList();
            var total = await dbContext.GlobalClassCodes.Where(c => classCodes.Contains(c.ClassCode))
                .ExecuteDeleteAsync(cancellationToken);
            await transaction.CommitAsync(cancellationToken);
            return total;
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync(cancellationToken);
            logger.LogError(ex, "Error deleting class by ids");
            throw;
        }
    }
}