using EntityFramework.Exceptions.Common;
using FacultyService.Application.CreditClasses.Command;
using FluentResults;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Shared.Exception;

namespace FacultyService.Application.CreditClasses.CommandHandler;

public class UpdateCreditClassCommandHandler(
    FacultyDbContext dbContext,
    ILogger<UpdateCreditClassCommandHandler> logger)
    : IRequestHandler<UpdateCreditClassCommand, int>
{
    public async Task<int> Handle(UpdateCreditClassCommand request, CancellationToken cancellationToken)
    {
        var credit = await dbContext.CreditClasses
                         .Where(x => x.CreditClassId == request.Id)
                         .FirstOrDefaultAsync(cancellationToken) ??
                     throw new ResourceNotFoundException($"Không tìm thấy lớp tín chỉ");

        credit.GroupNumber = request.GroupNumber.Value;
        credit.MinStudent = (short)request.MinStudent;
        credit.AcademicYear = request.AcademicYearCode.Value;
        credit.IsCancelled = request.IsCancelled;
        credit.Semester = request.Semester.Value;
        credit.CourseCode = request.CourseCode.Value;
        credit.LecturerCode = request.LecturerCode.Value;


        try
        {
            dbContext.CreditClasses.Update(credit);
            await dbContext.SaveChangesAsync(cancellationToken);
            return request.Id;
        }
        catch (UniqueConstraintException e)
        {
            logger.LogError(e, "Lỗi khi cập nhật lớp học");
            if (e.InnerException?.Message.Contains("pk") ?? false)
            {
                throw new DuplicateException(
                    $"Lớp học với nhóm {request.GroupNumber} mã môn {request.CourseCode} trong học kỳ {request.Semester} niên khóa {request.AcademicYearCode} đã tồn tại",
                    e);
            }

            throw;
        }
    }
}