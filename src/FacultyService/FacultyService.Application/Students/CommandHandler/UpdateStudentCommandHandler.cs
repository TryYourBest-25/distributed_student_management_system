using FacultyService.Application.Students.Command;
using FacultyService.Application.Students.Notification;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Shared.Domain.ValueObject;
using Shared.Exception;

namespace FacultyService.Application.Students.CommandHandler;

public class UpdateStudentCommandHandler(FacultyDbContext facultyDbContext, IPublisher publisher)
    : IRequestHandler<UpdateStudentCommand, StudentCode>
{
    public async Task<StudentCode> Handle(UpdateStudentCommand request, CancellationToken cancellationToken)
    {
        var student =
            await facultyDbContext.Students.AsNoTracking().FirstOrDefaultAsync(
                s => s.StudentCode == request.OldStudentCode.Value,
                cancellationToken) ??
            throw new ResourceNotFoundException($"Không tìm thấy sinh viên với mã {request.OldStudentCode}");

        if (request.NewStudentCode is not null && request.NewStudentCode.Value != request.OldStudentCode.Value)
        {
            if (!new ClassCode(student.ClassCode).IsValid(request.NewStudentCode))
            {
                throw new BadInputException(
                    $"Mã sinh viên không hợp lệ. Mã sinh viên phải có cùng niên khóa và khối ngành với mã lớp.");
            }

            await using var transaction = await facultyDbContext.Database.BeginTransactionAsync(cancellationToken);

            await facultyDbContext.GlobalStudentCodes.Where(g => g.StudentCode == request.OldStudentCode.Value)
                .ExecuteUpdateAsync(x => x.SetProperty(g => g.StudentCode, request.NewStudentCode.Value),
                    cancellationToken);

            if (await facultyDbContext.GlobalStudentCodes.AsNoTracking()
                    .AnyAsync(s => s.StudentCode == request.NewStudentCode.Value, cancellationToken) is false)
            {
                await transaction.RollbackAsync(cancellationToken);
                throw new BadInputException($"Không thể cập nhật mã sinh viên.");
            }

            await facultyDbContext.Students.Where(s => s.StudentCode == request.NewStudentCode.Value)
                .ExecuteUpdateAsync(
                    x => x.SetProperty(s => s.FirstName, request.FirstName.Value)
                        .SetProperty(s => s.LastName, request.LastName.Value)
                        .SetProperty(s => s.BirthDate, request.BirthDate).SetProperty(s => s.Address, request.Address)
                        .SetProperty(s => s.IsSuspended, request.IsSuspended)
                        .SetProperty(s => s.Gender, request.Gender.ToBoolean()), cancellationToken: cancellationToken);

            await transaction.CommitAsync(cancellationToken);
        }

        await facultyDbContext.Students.Where(s => s.StudentCode == request.OldStudentCode.Value).ExecuteUpdateAsync(
            x => x.SetProperty(s => s.FirstName, request.FirstName.Value)
                .SetProperty(s => s.LastName, request.LastName.Value).SetProperty(s => s.BirthDate, request.BirthDate)
                .SetProperty(s => s.Address, request.Address).SetProperty(s => s.IsSuspended, request.IsSuspended)
                .SetProperty(s => s.Gender, request.Gender.ToBoolean()), cancellationToken: cancellationToken);

        await publisher.Publish(new UpdateStudentEvent(request.OldStudentCode, request.NewStudentCode),
            cancellationToken);

        return new StudentCode(request.NewStudentCode ?? request.OldStudentCode.Value);
    }
}