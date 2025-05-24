using EntityFramework.Exceptions.Common;
using FacultyService.Application.CreditClasses.Command;
using FacultyService.Domain.Entity;
using MediatR;
using Microsoft.Extensions.Logging;
using Shared.Exception;

namespace FacultyService.Application.CreditClasses.CommandHandler;

public class CreateCreditClassCommandHandler(FacultyDbContext dbContext, ILogger logger)
    : IRequestHandler<CreateCreditClassCommand, int>
{
    public async Task<int> Handle(CreateCreditClassCommand request, CancellationToken cancellationToken)
    {
        var creditClass = new CreditClass
        {
            GroupNumber = request.GroupNumber,
            MinStudent = (short)request.MinStudent,
            AcademicYear = request.AcademicYearCode,
            FacultyCode = dbContext.TenantInfo.Id,
            Semester = 1,
            CourseCode = request.CourseCode,
            IsCancelled = false,
        };

        try
        {
            var entry = await dbContext.CreditClasses.AddAsync(creditClass, cancellationToken);
            await dbContext.SaveChangesAsync(cancellationToken);

            return entry.Entity.CreditClassId;
        }
        catch (UniqueConstraintException e)
        {
            logger.LogError(e, "Lỗi khi thêm lớp học mới");
            if (e.Message.Contains("PRIMARY"))
            {
                throw new DuplicateException(
                    $"Lớp học với nhóm {request.GroupNumber} mã môn {request.CourseCode} trong học kỳ {1} niên khóa {request.AcademicYearCode} đã tồn tại",
                    e);
            }

            throw;
        }
    }
}