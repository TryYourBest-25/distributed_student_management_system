using System;
using FacultyService.Application.CreditClasses.Command;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace FacultyService.Application.CreditClasses.CommandHandler;

public class DeleteRegistrationByStudentCodesCommandHandler(
    FacultyDbContext dbContext,
    ILogger<DeleteRegistrationByStudentCodesCommandHandler> logger)
    : IRequestHandler<DeleteRegistrationByStudentCodesCommand, int>
{
    public async Task<int> Handle(DeleteRegistrationByStudentCodesCommand request, CancellationToken cancellationToken)

    {
        await using var transaction = await dbContext.Database.BeginTransactionAsync(cancellationToken);

        try
        {
            var registrations = await dbContext.Registrations
                .Where(r => request.StudentCodes.Contains(r.StudentCode) && r.CreditClassId == request.CreditClassId)
                .ExecuteDeleteAsync(cancellationToken);

            await transaction.CommitAsync(cancellationToken);

            return registrations;
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync(cancellationToken);
            logger.LogError(ex, "Lỗi khi xóa sinh viên khỏi lớp học");
            throw;
        }
    }
}