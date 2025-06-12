using System.Data;
using EntityFramework.Exceptions.Common;
using FacultyService.Application.Students.Command;
using FacultyService.Application.Students.Notification;
using FacultyService.Domain.Entity;
using FacultyService.Domain.Generator;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Shared.Domain.ValueObject;
using Shared.Exception;

namespace FacultyService.Application.Students.CommandHandler;

public class CreateStudentCommandHandler(
    FacultyDbContext facultyDbContext,
    IStudentIdGenerator studentIdGenerator,
    ILogger<CreateStudentCommandHandler> logger,
    IPublisher publisher)
    : IRequestHandler<CreateStudentCommand, StudentCode>
{
    public async Task<StudentCode> Handle(CreateStudentCommand request, CancellationToken cancellationToken)
    {
        await using var transaction =
            await facultyDbContext.Database.BeginTransactionAsync(IsolationLevel.ReadCommitted, cancellationToken);

        if (facultyDbContext.Classes.AsNoTracking().Any(c => c.ClassCode == request.ClassCode.Value) is false)
        {
            throw new ResourceNotFoundException(
                $"Không tồn tại lớp học ${request.ClassCode.Value} trong khoa ${facultyDbContext.TenantInfo.Name}");
        }

        StudentCode? studentCode = null;
        var idGenerated = false;
        var retryCount = 0;
        const int maxRetry = 3;

        while (!idGenerated && retryCount < maxRetry)
        {
            studentCode = await studentIdGenerator.Generate(request.ClassCode);
            var student = new Student
            {
                StudentCode = studentCode,
                FacultyCode = facultyDbContext.TenantInfo.Id,
                FirstName = request.FirstName,
                LastName = request.LastName,
                ClassCode = request.ClassCode,
                Address = request.Address,
                BirthDate = request.BirthDate,
                IsSuspended = request.IsSuspended ?? false,
            };

            try
            {
                await facultyDbContext.GlobalStudentCodes.AddAsync(
                    new GlobalStudentCode { StudentCode = studentCode }, cancellationToken);


                await facultyDbContext.Students.AddAsync(student, cancellationToken);

                await facultyDbContext.SaveChangesAsync(cancellationToken);

                await transaction.CommitAsync(cancellationToken);

                idGenerated = true;
            }
            catch (DbUpdateException e)
            {
                logger.LogWarning("Error when creating student {StudentIdStudentCode}: {EMessage}", studentCode,
                    e.Message);
                if (facultyDbContext.Entry(student).State == EntityState.Added)
                {
                    facultyDbContext.Entry(student).State = EntityState.Detached;
                }

                var globalEntry = facultyDbContext.GlobalStudentCodes.Local.FirstOrDefault(g =>
                    g.StudentCode == studentCode);
                if (globalEntry != null)
                {
                    facultyDbContext.Entry(globalEntry).State = EntityState.Detached;
                }

                if (e is UniqueConstraintException)
                {
                    logger.LogWarning(
                        "Unique constraint exception when creating student {StudentIdStudentCode}: {EMessage}",
                        studentCode, e.Message);
                    retryCount++;
                    logger.LogWarning("Retrying to create student {StudentIdStudentCode} ({RetryCount}/{MaxRetry})",
                        studentCode, retryCount, maxRetry);
                    if (retryCount >= maxRetry)
                    {
                        await transaction.RollbackAsync(cancellationToken);
                        throw new BusinessException($"Hệ thống không thể tạo mã sinh viên, vui lòng thử lại");
                    }
                }
                else
                {
                    await transaction.RollbackAsync(cancellationToken);
                    logger.LogError("Error when creating student {StudentIdStudentCode}: {EMessage}", studentCode,
                        e.Message);
                    throw;
                }
            }
        }

        if (idGenerated)
        {
            await publisher.Publish(new CreateStudentEvent(studentCode), cancellationToken);
            return studentCode;
        }

        await transaction.RollbackAsync(cancellationToken);
        throw new BusinessException($"Hệ thống không thể tạo mã sinh viên, vui lòng thử lại");
    }
}