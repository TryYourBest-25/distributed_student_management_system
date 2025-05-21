using System.Data;
using EntityFramework.Exceptions.Common;
using FacultyService.Application.Class.Command;
using FacultyService.Domain.Aggregate;
using FacultyService.Domain.Entity;
using FacultyService.Domain.ValueObject;
using FluentResults;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Shared.Exception;

namespace FacultyService.Application.Class.CommandHandler;

public class CreateClassCommandHandler(FacultyDbContext facultyDbContext, ILogger logger)
    : IRequestHandler<CreateClassCommand, Result<ClassCode>>
{
    public async Task<Result<ClassCode>> Handle(CreateClassCommand request, CancellationToken cancellationToken)
    {
        await using var transaction =
            await facultyDbContext.Database.BeginTransactionAsync(IsolationLevel.ReadCommitted, cancellationToken);

        var classId = new ClassId(request.ClassCode, facultyDbContext.TenantInfo.Id);

        var classAg = new ClassAg(classId)
        {
            ClassName = request.ClassName,
            AcademicYear = request.AcademicYearCode
        };

        try
        {
            await facultyDbContext.GlobalClassCodes.AddAsync(new GlobalClassCode
            {
                ClassCode = request.ClassCode.Value,
                ClassName = request.ClassName.Value
            }, cancellationToken);

            var classEn = new Domain.Entity.Class
            {
                ClassCode = classAg.Id.ClassCode,
                ClassName = classAg.ClassName,
                AcademicYearCode = classAg.AcademicYear,
                FacultyCode = facultyDbContext.TenantInfo.Id
            };

            await facultyDbContext.Classes.AddAsync(classEn, cancellationToken);

            await facultyDbContext.SaveChangesAsync(cancellationToken);

            await transaction.CommitAsync(cancellationToken);

            return Result.Ok(classAg.Id.ClassCode);
        }
        catch (DbUpdateException e)
        {
            if (e.InnerException is UniqueConstraintException uniqueConstraintException)
            {
                logger.LogError("{Message}", uniqueConstraintException.Message);
                await transaction.RollbackAsync(cancellationToken);
                if (uniqueConstraintException.Message.Contains("class_code"))
                {
                    throw new DuplicateException($"Mã lớp học {classAg.Id.ClassCode} đã tồn tại");
                }

                if (uniqueConstraintException.Message.Contains("class_name"))
                {
                    throw new DuplicateException($"Tên lớp học {classAg.ClassName} đã tồn tại");
                }
            }

            logger.LogError("{Message}", e.InnerException?.Message);
            await transaction.RollbackAsync(cancellationToken);
            throw;
        }
    }
}