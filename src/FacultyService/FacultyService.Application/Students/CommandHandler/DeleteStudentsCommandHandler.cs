using System.Data;
using FacultyService.Application.Students.Command;
using FacultyService.Application.Students.Notification;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Shared.Exception;

namespace FacultyService.Application.Students.CommandHandler;

public class DeleteStudentsCommandHandler(
    FacultyDbContext context,
    ILogger<DeleteStudentsCommandHandler> logger,
    IPublisher publisher)
    : IRequestHandler<DeleteStudentsCommand, int>
{
    public async Task<int> Handle(DeleteStudentsCommand request, CancellationToken cancellationToken)
    {
        var studentCodes = request.StudentCodes.Select(s => s.Value).ToList();
        await using var transaction =
            await context.Database.BeginTransactionAsync(IsolationLevel.ReadCommitted, cancellationToken);

        try
        {
            var total = await context.GlobalStudentCodes.Where(s => studentCodes.Contains(s.StudentCode))
                .ExecuteDeleteAsync(cancellationToken);
            await transaction.CommitAsync(cancellationToken);

            var deleteEvents = request.StudentCodes.Select(code => new DeleteStudentEvent(code));
            await Task.WhenAll(deleteEvents.Select(e => publisher.Publish(e, cancellationToken)));

            return total;
        }
        catch (DbUpdateException e)
        {
            logger.LogError(e, "Error deleting students");
            await transaction.RollbackAsync(cancellationToken);
            throw new BusinessException("Không thể xóa sinh viên, hãy thử lại");
        }
        catch (Exception e)
        {
            logger.LogError(e, "Error deleting students");
            await transaction.RollbackAsync(cancellationToken);
            throw new BusinessException("Không thể xóa sinh viên, hãy thử lại");
        }
    }
}