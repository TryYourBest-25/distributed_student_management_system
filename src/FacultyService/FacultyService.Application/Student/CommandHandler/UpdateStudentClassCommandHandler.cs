using System.Data;
using FacultyService.Application.Student.Command;
using FacultyService.Application.Student.Response;
using FacultyService.Domain.Aggregate;
using FacultyService.Domain.Repository;
using FacultyService.Domain.ValueObject;
using FluentResults;
using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Shared.Exception;

namespace FacultyService.Application.Student.CommandHandler;

public class UpdateStudentClassCommandHandler(FacultyDbContext context, ILogger logger, IStudentAgRepository studentAgRepository)
    : IRequestHandler<UpdateStudentClassCommand, Result<StudentResponse>>
{
    public async Task<Result<StudentResponse>> Handle(UpdateStudentClassCommand request,
        CancellationToken cancellationToken)
    {
        var student = await context.Students.Where(s => s.StudentCode == request.StudentCode.Value)
            .FirstOrDefaultAsync(cancellationToken) ?? throw new ResourceNotFoundException(
            $"Không tồn tại sinh viên {request.StudentCode.Value} trong khoa {context.TenantInfo.Name}");
        if (context.Classes.AsNoTracking().Any(c => c.ClassCode == request.ClassCode.Value))
        {
            student.ClassCode = request.ClassCode;
            context.Students.Update(student);
            await context.SaveChangesAsync(cancellationToken);
            return Result.Ok(new StudentResponse
            {
                StudentCode = student.StudentCode,
                ClassCode = student.ClassCode,
                FacultyCode = student.FacultyCode,
                FirstName = student.FirstName,
                LastName = student.LastName,
                BirthDate = student.BirthDate,
                Address = student.Address
            });
        }

        await using var transaction =
            await context.Database.BeginTransactionAsync(IsolationLevel.ReadCommitted, cancellationToken);


        try
        {
            var studentAg = new StudentAg(new StudentId(request.StudentCode, request.FacultyCode))
            {
                ClassCode = request.ClassCode,
                FirstName = student.FirstName,
                LastName = student.LastName,
                Birthdate = student.BirthDate,
                Address = student.Address
            };

            var result = await studentAgRepository.CreateStudentAsync(studentAg);
            if (result.IsFailed)
            {
                return Result.Fail(result.Errors);
            }
            
            context.Students.Remove(student);
            await context.SaveChangesAsync(cancellationToken);
            await transaction.CommitAsync(cancellationToken);
            return Result.Ok(new StudentResponse
            {
                StudentCode = result.Value.Id.StudentCode,
                ClassCode = result.Value.ClassCode,
                FacultyCode = result.Value.Id.FacultyCode,
                FirstName = result.Value.FirstName,
                LastName = result.Value.LastName,
                BirthDate = result.Value.Birthdate,
                Address = result.Value.Address
            });
        }
        catch (Exception e)
        {
            // giao tác bù trừ
            await transaction.RollbackAsync(cancellationToken);
            
            var letDelete = await studentAgRepository.DeleteStudentAsync(new StudentId(request.StudentCode, request.FacultyCode));
            
            if (letDelete.IsFailed)
            {
                logger.LogError(letDelete.Errors.FirstOrDefault()?.Message);
            }
            
            
            logger.LogError(e, "Error updating student class");
            throw;
        }

    }
}