using System.Data;
using FacultyService.Application.Student.Command;
using FacultyService.Application.Student.StudentReader;
using FacultyService.Domain.Entity;
using FacultyService.Domain.Generator;
using FacultyService.Domain.StudentExporter;
using FluentResults;
using MediatR;
using Microsoft.Extensions.Logging;
using Microsoft.EntityFrameworkCore;

namespace FacultyService.Application.Student.CommandHandler;

public class CreteStudentsCommandHandler(
    FacultyDbContext context,
    ILogger logger,
    IReadWriteFileFactory<StudentRecord> provider,
    IStudentIdGenerator studentIdGenerator) : IRequestHandler<CreateStudentsCommand, Result<int>>
{
    public async Task<Result<int>> Handle(CreateStudentsCommand request, CancellationToken cancellationToken)
    {
        
        var fileType = FileTypeSupportExtensions.FromString(Path.GetExtension(request.File.FileName));
        
        var reader = provider.Create(fileType);
        
        var records = await reader.ReadFromFileAsync(request.File, cancellationToken);
        
        await using var transaction =
            await context.Database.BeginTransactionAsync(IsolationLevel.ReadCommitted, cancellationToken);

        var ids = studentIdGenerator.Generate(request.ClassCode, records.Records.Count)
            .Select(id => new GlobalStudentCode { StudentCode = id.StudentCode }).ToList();

        var students = records.Records.OrderBy(record => record.FirstName)
            .Select((record, index) => new Domain.Entity.Student
            {
                StudentCode = ids[index].StudentCode,
                FacultyCode = context.TenantInfo.Id,
                FirstName = record.FirstName,
                LastName = record.LastName,
                ClassCode = request.ClassCode,
                Address = record.Address,
                BirthDate = record.BirthDate,
                IsSuspended = record.IsSuspended,
            }).ToList();

        try
        {
            await context.GlobalStudentCodes.AddRangeAsync(ids, cancellationToken);
            await context.Students.AddRangeAsync(students, cancellationToken);
            await context.SaveChangesAsync(cancellationToken);
            await transaction.CommitAsync(cancellationToken);
            return Result.Ok(students.Count);
        }
        catch (DbUpdateConcurrencyException e)
        {
            logger.LogError(e, "Error saving students");
            await transaction.RollbackAsync(cancellationToken);
            return Result.Fail(new Error("Không thể thêm sinh viên vào lớp học, hãy thử lại"));
        }
        catch (DbUpdateException e)
        {
            logger.LogError(e, "Error saving students");
            await transaction.RollbackAsync(cancellationToken);
            return Result.Fail(new Error("Không thể thêm sinh viên vào lớp học, hãy thử lại"));
        }
        catch (Exception e)
        {
            logger.LogError(e, "Error saving students");
            await transaction.RollbackAsync(cancellationToken);
            return Result.Fail(new Error("Không thể thêm sinh viên vào lớp học, hãy thử lại"));
        }
    }
}