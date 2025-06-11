using System.Data;
using EntityFramework.Exceptions.Common;
using FacultyService.Application.Classes.Command;
using FacultyService.Domain.Entity;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Shared.Domain.ValueObject;
using Shared.Exception;

namespace FacultyService.Application.Classes.CommandHandler;

public class CreateClassCommandHandler(FacultyDbContext facultyDbContext, ILogger<CreateClassCommandHandler> logger)
    : IRequestHandler<CreateClassCommand, ClassCode>
{
    public async Task<ClassCode> Handle(CreateClassCommand request, CancellationToken cancellationToken)
    {
        var newClass = new Class
        {
            ClassCode = request.ClassCode,
            ClassName = request.ClassName,
            AcademicYearCode = request.AcademicYearCode,
            FacultyCode = facultyDbContext.TenantInfo.Id
        };
        await using var transaction =
            await facultyDbContext.Database.BeginTransactionAsync(IsolationLevel.ReadCommitted, cancellationToken);


        try
        {
            await facultyDbContext.GlobalClassCodes.AddAsync(new GlobalClassCode
            {
                ClassCode = request.ClassCode.Value,
                ClassName = request.ClassName.Value
            }, cancellationToken);

            await facultyDbContext.Classes.AddAsync(newClass, cancellationToken);

            await facultyDbContext.SaveChangesAsync(cancellationToken);

            await transaction.CommitAsync(cancellationToken);

            return newClass.ClassCode;
        }
        catch (UniqueConstraintException e)
        {
            if (e.InnerException?.Message.Contains("pk") ?? false)
            {
                logger.LogError("{Message}", e.Message);
                await transaction.RollbackAsync(cancellationToken);
                throw new DuplicateException($"Mã lớp học {request.ClassCode} đã tồn tại");
            }

            if (e.InnerException?.Message.Contains("class_name") ?? false)
            {
                logger.LogError("{Message}", e.Message);
                await transaction.RollbackAsync(cancellationToken);
                throw new DuplicateException($"Tên lớp học {request.ClassName} đã tồn tại");
            }


            logger.LogError("{Message}", e.InnerException?.Message);
            await transaction.RollbackAsync(cancellationToken);
            throw;
        }
    }
}