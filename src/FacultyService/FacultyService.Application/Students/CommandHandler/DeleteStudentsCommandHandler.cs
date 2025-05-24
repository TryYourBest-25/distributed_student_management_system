using System.Data;
using FacultyService.Application.Students.Command;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Shared.Exception;

namespace FacultyService.Application.Students.CommandHandler;

public class DeleteStudentsCommandHandler(FacultyDbContext context, ILogger logger)
    : IRequestHandler<DeleteStudentsCommand, int>
{
    public async Task<int> Handle(DeleteStudentsCommand request, CancellationToken cancellationToken)
    {
        await using var transaction =
            await context.Database.BeginTransactionAsync(IsolationLevel.ReadCommitted, cancellationToken);

        try
        {
            var total = await context.GlobalStudentCodes.Where(s => request.StudentCodes.Contains(s.StudentCode))
                .ExecuteDeleteAsync(cancellationToken);
            await transaction.CommitAsync(cancellationToken);
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