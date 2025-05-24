using EntityFramework.Exceptions.Common;
using FacultyService.Application.Classes.Command;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Shared.Domain.ValueObject;
using Shared.Exception;

namespace FacultyService.Application.Classes.CommandHandler;

public class UpdateClassCommandHandler(FacultyDbContext facultyDbContext, ILogger logger)
    : IRequestHandler<UpdateClassCommand, ClassCode>
{
    public async Task<ClassCode> Handle(UpdateClassCommand request, CancellationToken cancellationToken)
    {
        var classEntity =
            await facultyDbContext.Classes.FirstOrDefaultAsync(x => x.ClassCode == request.ClassCode.Value,
                cancellationToken) ??
            throw new ResourceNotFoundException($"Không tìm thấy lớp học với mã lớp {request.ClassCode.Value}");

        //classEntity.ClassName = request.ClassName;
        classEntity.AcademicYearCode = request.AcademicYearCode;

        try
        {
            await facultyDbContext.SaveChangesAsync(cancellationToken);
            return request.ClassCode;
        }
        catch (UniqueConstraintException e)
        {
            if (e.Message.Contains("class_code"))
            {
                logger.LogError("{Message}", e.Message);
                throw new DuplicateException($"Mã lớp học {request.ClassCode} đã tồn tại");
            }

            logger.LogError("{Message}", e.Message);
            throw;
        }
    }
}