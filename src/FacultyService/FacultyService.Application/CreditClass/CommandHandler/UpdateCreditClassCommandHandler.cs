using EntityFramework.Exceptions.Common;
using FacultyService.Application.CreditClass.Command;
using FacultyService.Domain.Aggregate;
using FacultyService.Domain.ValueObject;
using FluentResults;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Shared.Exception;

namespace FacultyService.Application.CreditClass.CommandHandler;

public class UpdateCreditClassCommandHandler(FacultyDbContext dbContext, ILogger logger) : IRequestHandler<UpdateCreditClassCommand, Result<int>>
{
    public async Task<Result<int>> Handle(UpdateCreditClassCommand request, CancellationToken cancellationToken)
    {
        var creditClassAg = new CreditClassAg(new CreditClassId(request.Id, dbContext.TenantInfo.Id))
        {
            CourseCode = request.CourseCode,
            GroupNumber = request.GroupNumber,
            MinStudent = request.MinStudent,
            AcademicYear= request.AcademicYearCode,
            IsCancelled = request.IsCancelled,
            Semester = 1
        };
        
        var credit = await dbContext.CreditClasses
            .Where(x => x.CreditClassId == request.Id)
            .FirstOrDefaultAsync(cancellationToken) ?? throw new ResourceNotFoundException($"Không tìm thấy lớp tín chỉ");
        
        credit.GroupNumber = creditClassAg.GroupNumber;
        credit.MinStudent = (short) creditClassAg.MinStudent;
        credit.AcademicYear = creditClassAg.AcademicYear;
        credit.IsCancelled = creditClassAg.IsCancelled;
        credit.Semester = creditClassAg.Semester;
        credit.CourseCode = creditClassAg.CourseCode;
        
        try
        {
            dbContext.CreditClasses.Update(credit);
            await dbContext.SaveChangesAsync(cancellationToken);
            return Result.Ok(credit.CreditClassId);
        }
        catch (DbUpdateException e)
        {
            logger.LogError(e, "Lỗi khi cập nhật lớp học");
            if (e.InnerException is UniqueConstraintException uniqueConstraintException)
            {
                throw new DuplicateException($"Lớp học với nhóm ${creditClassAg.GroupNumber} mã môn {creditClassAg.CourseCode} trong học kỳ {creditClassAg.Semester} niên khóa {creditClassAg.AcademicYear} đã tồn tại", e);
            }
            throw;
        }
        
    }
}