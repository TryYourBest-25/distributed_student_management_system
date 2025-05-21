using System.Data;
using EntityFramework.Exceptions.Common;
using FacultyService.Application.Student.Command;
using FacultyService.Domain.Aggregate;
using FacultyService.Domain.Entity;
using FacultyService.Domain.Generator;
using FacultyService.Domain.ValueObject;
using FluentResults;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Shared.Exception;

namespace FacultyService.Application.Student.CommandHandler;

public class CreateStudentCommandHandler(FacultyDbContext facultyDbContext, IStudentIdGenerator studentIdGenerator, ILogger logger)
    : IRequestHandler<CreateStudentCommand, Result<StudentCode>>
{
    public async Task<Result<StudentCode>> Handle(CreateStudentCommand request, CancellationToken cancellationToken)
    {
        await using var transaction =
            await facultyDbContext.Database.BeginTransactionAsync(IsolationLevel.ReadCommitted, cancellationToken);

        if (facultyDbContext.Classes.AsNoTracking().Any(c => c.ClassCode == request.ClassCode.Value) is false)
        {
            throw new ResourceNotFoundException(
                $"Không tồn tại lớp học ${request.ClassCode.Value} trong khoa ${facultyDbContext.TenantInfo.Name}");
        }

        StudentId studentId = null;
        Domain.Entity.Student student;
        var idGenerated = false;
        var retryCount = 0;
        const int maxRetry = 3;

        while (!idGenerated && retryCount < maxRetry)
        {
            studentId = studentIdGenerator.Generate(request.ClassCode);

            var studentAg = new StudentAg(studentId)
            {
                FirstName = request.FirstName,
                LastName = request.LastName,
                ClassCode = request.ClassCode,
                Address = request.Address,
                Birthdate = request.BirthDate,
                IsSuspended = request.IsSuspended,
            };

            student = new Domain.Entity.Student
            {
                StudentCode = studentAg.Id.StudentCode,
                FacultyCode = studentAg.Id.FacultyCode,
                FirstName = studentAg.FirstName,
                LastName = studentAg.LastName,
                ClassCode = studentAg.ClassCode,
                Address = studentAg.Address,
                BirthDate = request.BirthDate,
                IsSuspended = request.IsSuspended,
            };

            try
            {
                await facultyDbContext.GlobalStudentCodes.AddAsync(
                    new GlobalStudentCode { StudentCode = studentId.StudentCode }, cancellationToken);

                await facultyDbContext.Students.AddAsync(student, cancellationToken);
                
                await facultyDbContext.SaveChangesAsync(cancellationToken);
                
                await transaction.CommitAsync(cancellationToken);
                
                idGenerated = true;
                
            }
            catch (DbUpdateException e)
            {
                logger.LogWarning("Error when creating student {StudentIdStudentCode}: {EMessage}", studentId.StudentCode, e.Message);
                if (facultyDbContext.Entry(student).State == EntityState.Added)
                {
                    facultyDbContext.Entry(student).State = EntityState.Detached;
                }

                var globalEntry = facultyDbContext.GlobalStudentCodes.Local.FirstOrDefault(g =>
                    g.StudentCode == studentId.StudentCode.Value);
                if (globalEntry != null)
                {
                    facultyDbContext.Entry(globalEntry).State = EntityState.Detached;
                }
                
                if (e is UniqueConstraintException )
                {
                    logger.LogWarning("Unique constraint exception when creating student {StudentIdStudentCode}: {EMessage}", studentId.StudentCode, e.Message);
                    retryCount++;
                    logger.LogWarning("Retrying to create student {StudentIdStudentCode} ({RetryCount}/{MaxRetry})", studentId.StudentCode, retryCount, maxRetry);
                    if (retryCount >= maxRetry)
                    {
                        await transaction.RollbackAsync(cancellationToken);
                        throw new BusinessException($"Hệ thống không thể tạo mã sinh viên, vui lòng thử lại");
                    }
                }
                else
                {
                    await transaction.RollbackAsync(cancellationToken);
                    logger.LogError("Error when creating student {StudentIdStudentCode}: {EMessage}", studentId.StudentCode, e.Message);
                    throw;
                }
            }
        }

        if (idGenerated) return Result.Ok(studentId.StudentCode);
        await transaction.RollbackAsync(cancellationToken);
        throw new BusinessException($"Hệ thống không thể tạo mã sinh viên, vui lòng thử lại");

    }
}