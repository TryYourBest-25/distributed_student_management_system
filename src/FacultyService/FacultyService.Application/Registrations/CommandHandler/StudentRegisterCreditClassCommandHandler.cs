using EntityFramework.Exceptions.Common;
using FacultyService.Application.Registrations.Command;
using FacultyService.Domain.Entity;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Shared.Exception;

namespace FacultyService.Application.Registrations.CommandHandler;

public class StudentRegisterCreditClassCommandHandler(
    FacultyDbContext dbContext,
    ILogger<StudentRegisterCreditClassCommandHandler> logger)
    : IRequestHandler<StudentRegisterCreditClassCommand, int>
{
    public async Task<int> Handle(StudentRegisterCreditClassCommand request, CancellationToken cancellationToken)
    {
        var studentIsSuspended = await dbContext.Students
            .Where(s => s.StudentCode == request.StudentCode.Value && s.IsSuspended == true)
            .Select(s => s.IsSuspended)
            .FirstOrDefaultAsync(cancellationToken);

        if (studentIsSuspended)
            throw new BusinessException(
                $"Sinh viên {request.StudentCode} đã bị đình chỉ học tập, không thể đăng ký lớp tín chỉ");

        var existRegistration = await dbContext.Registrations
            .Where(r => r.CreditClassId == request.CreditClassId && r.StudentCode == request.StudentCode.Value)
            .FirstOrDefaultAsync(cancellationToken);

        if (existRegistration is null)
        {
            var registration = new Registration
            {
                CreditClassId = request.CreditClassId,
                StudentCode = request.StudentCode.Value,
                FacultyCode = dbContext.TenantInfo.Id,
                IsCancelled = false
            };

            try
            {
                var entry = await dbContext.Registrations.AddAsync(registration, cancellationToken);
                await dbContext.SaveChangesAsync(cancellationToken);

                return entry.Entity.CreditClassId;
            }
            catch (UniqueConstraintException e)
            {
                logger.LogError(e, "Lỗi khi thêm lớp học mới");
                if (e.InnerException?.Message.Contains("pk") ?? false)
                {
                    throw new DuplicateException($"Sinh viên {request.StudentCode} đã đăng ký lớp tín chỉ này", e);
                }

                throw;
            }
        }

        existRegistration.IsCancelled = request.IsCancelled;

        try
        {
            dbContext.Registrations.Update(existRegistration);
            await dbContext.SaveChangesAsync(cancellationToken);
            return existRegistration.CreditClassId;
        }
        catch (UniqueConstraintException e)
        {
            logger.LogError(e, "Lỗi khi cập nhật lớp học mới");
            if (e.InnerException?.Message.Contains("pk") ?? false)
            {
                throw new DuplicateException($"Sinh viên {request.StudentCode} đã đăng ký lớp tín chỉ này", e);
            }

            throw;
        }
    }
}