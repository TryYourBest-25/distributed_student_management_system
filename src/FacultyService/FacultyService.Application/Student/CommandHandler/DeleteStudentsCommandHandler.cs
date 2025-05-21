using System.Data;
using FacultyService.Application.Student.Command;
using FluentResults;
using MediatR;
using Microsoft.Extensions.Logging;
using Microsoft.EntityFrameworkCore;

namespace FacultyService.Application.Student.CommandHandler;

public class DeleteStudentsCommandHandler(FacultyDbContext context, ILogger logger)
    : IRequestHandler<DeleteStudentsCommand, Result<int>>
{
    public async Task<Result<int>> Handle(DeleteStudentsCommand request, CancellationToken cancellationToken)
    {
        await using var transaction =
            await context.Database.BeginTransactionAsync(IsolationLevel.ReadCommitted, cancellationToken);

        try
        {
            var total = await context.Students.Where(s => request.StudentCodes.Contains(s.StudentCode))
                .ExecuteDeleteAsync(cancellationToken);
            await transaction.CommitAsync(cancellationToken);
            return Result.Ok(total);
        }
        catch (DbUpdateConcurrencyException e)
        {
            logger.LogError(e, "Error deleting students");
            await transaction.RollbackAsync(cancellationToken);
            return Result.Fail(new Error("Không thể xóa sinh viên, hãy thử lại"));
        }
        catch (DbUpdateException e)
        {
            logger.LogError(e, "Error deleting students");
            await transaction.RollbackAsync(cancellationToken);
            return Result.Fail(new Error("Không thể xóa sinh viên, hãy thử lại"));
        }
        catch (Exception e)
        {
            logger.LogError(e, "Error deleting students");
            await transaction.RollbackAsync(cancellationToken);
            return Result.Fail(new Error("Không thể xóa sinh viên, hãy thử lại"));
        }
    }
}