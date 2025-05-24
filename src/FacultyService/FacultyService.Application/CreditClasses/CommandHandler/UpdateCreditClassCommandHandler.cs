using EntityFramework.Exceptions.Common;
using FacultyService.Application.CreditClasses.Command;
using FluentResults;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Shared.Exception;

namespace FacultyService.Application.CreditClasses.CommandHandler;

public class UpdateCreditClassCommandHandler(FacultyDbContext dbContext, ILogger logger)
    : IRequestHandler<UpdateCreditClassCommand, int>
{
    public async Task<int> Handle(UpdateCreditClassCommand request, CancellationToken cancellationToken)
    {
        var credit = await dbContext.CreditClasses
                         .Where(x => x.CreditClassId == request.Id)
                         .FirstOrDefaultAsync(cancellationToken) ??
                     throw new ResourceNotFoundException($"Không tìm thấy lớp tín chỉ");

        credit.GroupNumber = request.GroupNumber;
        credit.MinStudent = (short)request.MinStudent;
        credit.AcademicYear = request.AcademicYearCode;
        credit.IsCancelled = request.IsCancelled;
        credit.Semester = request.Semester;
        credit.CourseCode = request.CourseCode;

        try
        {
            dbContext.CreditClasses.Update(credit);
            await dbContext.SaveChangesAsync(cancellationToken);
            return credit.CreditClassId;
        }
        catch (UniqueConstraintException e)
        {
            logger.LogError(e, "Lỗi khi cập nhật lớp học");
            if (e.Message.Contains("PRIMARY"))
            {
                throw new DuplicateException(
                    $"Lớp học với nhóm {request.GroupNumber} mã môn {request.CourseCode} trong học kỳ {request.Semester} niên khóa {request.AcademicYearCode} đã tồn tại",
                    e);
            }

            throw;
        }
    }
}