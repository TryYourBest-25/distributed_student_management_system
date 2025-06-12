using FacultyService.Application.CreditClasses.Command;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Shared.Exception;

namespace FacultyService.Application.CreditClasses.CommandHandler;

public class DeleteCreditClassesCommandHandler(FacultyDbContext dbContext)
    : IRequestHandler<DeleteCreditClassesCommand, int>
{
    public async Task<int> Handle(DeleteCreditClassesCommand request, CancellationToken cancellationToken)
    {
        await using var transaction = await dbContext.Database.BeginTransactionAsync(cancellationToken);
        try
        {
            var creditClasses = await dbContext.CreditClasses
                .Where(x => request.CreditClassIds.Contains(x.CreditClassId)).ExecuteDeleteAsync(cancellationToken);
            await transaction.CommitAsync(cancellationToken);
            return creditClasses;
        }
        catch (DbUpdateException e)
        {
            await transaction.RollbackAsync(cancellationToken);
            throw new BusinessException($"Lỗi khi xóa lớp tín chỉ: {e.Message}", e);
        }
    }
}