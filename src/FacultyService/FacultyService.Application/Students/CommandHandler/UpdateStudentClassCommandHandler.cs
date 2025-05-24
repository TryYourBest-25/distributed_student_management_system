using System.Data;
using FacultyService.Application.Students.Command;
using FacultyService.Application.Students.Response;
using FacultyService.Domain.Port;
using FluentResults;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Shared.Exception;

namespace FacultyService.Application.Students.CommandHandler;

public class UpdateStudentClassCommandHandler(FacultyDbContext context, ILogger logger, IStudentPort studentPort)
    : IRequestHandler<UpdateStudentClassCommand, StudentBasicResponse>
{
    public async Task<StudentBasicResponse> Handle(UpdateStudentClassCommand request,
        CancellationToken cancellationToken)
    {
        var student = await context.Students.Include(s => s.StudentCodeNavigation)
            .Where(s => s.StudentCode == request.StudentCode.Value)
            .FirstOrDefaultAsync(cancellationToken) ?? throw new ResourceNotFoundException(
            $"Không tồn tại sinh viên {request.StudentCode.Value} trong khoa {context.TenantInfo.Name}");
        if (context.Classes.AsNoTracking().Any(c => c.ClassCode == request.ClassCode.Value))
        {
            student.ClassCode = request.ClassCode;
            context.Students.Update(student);
            await context.SaveChangesAsync(cancellationToken);
            return new StudentBasicResponse
            {
                StudentCode = student.StudentCode,
                ClassCode = student.ClassCode,
                FacultyCode = student.FacultyCode,
                FirstName = student.FirstName,
                LastName = student.LastName,
                BirthDate = student.BirthDate,
                Address = student.Address
            };
        }

        await using var transaction =
            await context.Database.BeginTransactionAsync(IsolationLevel.ReadCommitted, cancellationToken);


        try
        {
            var result = await studentPort.CreateStudentAsync(student);
            if (result.IsFailed)
            {
                throw new BusinessException(result.Errors.FirstOrDefault()?.Message ??
                                            "Không thể tạo sinh viên mới, hãy thử lại");
            }

            context.GlobalStudentCodes.Remove(student.StudentCodeNavigation);
            await context.SaveChangesAsync(cancellationToken);

            // xóa account
            await transaction.CommitAsync(cancellationToken);
            return new StudentBasicResponse
            {
                StudentCode = result.Value.StudentCode,
                ClassCode = result.Value.ClassCode,
                FacultyCode = result.Value.FacultyCode,
                FirstName = result.Value.FirstName,
                LastName = result.Value.LastName,
                BirthDate = result.Value.BirthDate,
                Address = result.Value.Address
            };
        }
        catch (Exception e)
        {
            // giao tác bù trừ
            await transaction.RollbackAsync(cancellationToken);

            var letDelete = await studentPort.DeleteStudentAsync(request.StudentCode, request.FacultyCode);

            if (letDelete.IsFailed)
            {
                logger.LogError(letDelete.Errors.FirstOrDefault()?.Message);
            }


            logger.LogError(e, "Error updating student class");
            throw;
        }
    }
}