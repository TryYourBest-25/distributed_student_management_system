using EntityFramework.Exceptions.Common;
using FacultyService.Application.CreditClass.Command;
using FacultyService.Application.Registration.Command;
using FluentResults;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Shared.Exception;

namespace FacultyService.Application.Registration.CommandHandler;

public class StudentRegisterCreditClassCommandHandler(FacultyDbContext dbContext, ILogger logger) : IRequestHandler<StudentRegisterCreditClassCommand, Result<int>>
{
    public async Task<Result<int>> Handle(StudentRegisterCreditClassCommand request, CancellationToken cancellationToken)
    {
        var existRegistration = await dbContext.Registrations
            .FindAsync([request.CreditClassId, request.StudentCode], cancellationToken);

        if (existRegistration is null)
        {
            var registration = new Domain.Entity.Registration
            {
                CreditClassId = request.CreditClassId,
                StudentCode = request.StudentCode,
                IsCancelled = request.IsCancelled
            };
            
            try
            {
                var entry = await dbContext.Registrations.AddAsync(registration, cancellationToken);
                await dbContext.SaveChangesAsync(cancellationToken);

                return Result.Ok(entry.Entity.CreditClassId);
            }
            catch (DbUpdateException e)
            {
                logger.LogError(e, "Lỗi khi thêm lớp học mới");
                if(e.InnerException is UniqueConstraintException uniqueConstraintException)
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
            return Result.Ok(existRegistration.CreditClassId);
        }
        catch (DbUpdateException e)
        {
            logger.LogError(e, "Lỗi khi cập nhật lớp học mới");
            if(e.InnerException is UniqueConstraintException uniqueConstraintException)
            {
                throw new DuplicateException($"Sinh viên {request.StudentCode} đã đăng ký lớp tín chỉ này", e);
            }
            throw;
        }
    }
}