using System.Data;
using FacultyService.Application.Students.Command;
using FacultyService.Application.Students.IoDto;
using FacultyService.Domain.Entity;
using FacultyService.Domain.Generator;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Shared.Exception;
using Shared.FileHelper;

namespace FacultyService.Application.Students.CommandHandler;

public class CreateStudentsCommandHandler(
    FacultyDbContext context,
    ILogger<CreateStudentsCommandHandler> logger,
    IReadWriteFileFactory<StudentRecord> provider,
    IStudentIdGenerator studentIdGenerator) : IRequestHandler<CreateStudentsCommand, int>
{
    public async Task<int> Handle(CreateStudentsCommand request, CancellationToken cancellationToken)
    {
        var fileType = FileTypeSupportExtensions.FromString(Path.GetExtension(request.File.FileName));

        var reader = provider.Create(fileType);

        var records = await reader.ReadFromFileAsync(request.File, cancellationToken);

        await using var transaction =
            await context.Database.BeginTransactionAsync(IsolationLevel.ReadCommitted, cancellationToken);

        var ids = studentIdGenerator.Generate(request.ClassCode, records.Records.Count)
            .Select(id => new GlobalStudentCode { StudentCode = id.Value }).ToList();

        var students = records.Records.OrderBy(record => record.FirstName)
            .Select((record, index) => new Student
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
            return students.Count;
        }
        catch (DbUpdateException e)
        {
            logger.LogError(e, "Error saving students");
            await transaction.RollbackAsync(cancellationToken);
            throw new BusinessException("Không thể thêm sinh viên vào lớp học, hãy thử lại");
        }
        catch (Exception e)
        {
            logger.LogError(e, "Error saving students");
            await transaction.RollbackAsync(cancellationToken);
            throw new BusinessException("Không thể thêm sinh viên vào lớp học, hãy thử lại");
        }
    }
}