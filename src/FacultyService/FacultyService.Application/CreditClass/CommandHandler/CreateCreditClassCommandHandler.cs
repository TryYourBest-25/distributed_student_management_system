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

public class CreateCreditClassCommandHandler (FacultyDbContext dbContext, ILogger logger) : IRequestHandler<CreateCreditClassCommand, Result<int>>
{
    public async Task<Result<int>> Handle(CreateCreditClassCommand request, CancellationToken cancellationToken)
    {
        var creditClassAg = new CreditClassAg(new CreditClassId(null, dbContext.TenantInfo.Id))
        {
            CourseCode = request.CourseCode,
            GroupNumber = request.GroupNumber,
            MinStudent = request.MinStudent,
            AcademicYear= request.AcademicYearCode,
            IsCancelled = false,
            Semester = 1
        };
        
        var creditClass = new Domain.Entity.CreditClass
        {
            GroupNumber = creditClassAg.GroupNumber,
            MinStudent = (short) creditClassAg.MinStudent,
            AcademicYear = creditClassAg.AcademicYear,
            FacultyCode = dbContext.TenantInfo.Id,
            Semester = creditClassAg.Semester,
            CourseCode = creditClassAg.CourseCode,
            IsCancelled = creditClassAg.IsCancelled,
        };

        try
        {
            var entry = await dbContext.CreditClasses.AddAsync(creditClass, cancellationToken);
            await dbContext.SaveChangesAsync(cancellationToken);

            return Result.Ok(entry.Entity.CreditClassId);
        }catch (DbUpdateException e)
        {
            logger.LogError(e, "Lỗi khi thêm lớp học mới");
            if (e.InnerException is UniqueConstraintException uniqueConstraintException)
            {
                throw new DuplicateException($"Lớp học với nhóm ${creditClassAg.GroupNumber} mã môn {creditClassAg.CourseCode} trong học kỳ {creditClassAg.Semester} niên khóa {creditClassAg.AcademicYear} đã tồn tại", e);
            }
            throw;
        }
    }
}