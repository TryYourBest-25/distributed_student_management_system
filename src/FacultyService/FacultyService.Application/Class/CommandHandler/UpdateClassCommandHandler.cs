using EntityFramework.Exceptions.Common;
using FacultyService.Application.Class.Command;
using FacultyService.Domain.ValueObject;
using FluentResults;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Shared.Exception;

namespace FacultyService.Application.Class.CommandHandler;

public class UpdateClassCommandHandler(FacultyDbContext facultyDbContext)
    : IRequestHandler<UpdateClassCommand, Result<ClassCode>>
{
    public async Task<Result<ClassCode>> Handle(UpdateClassCommand request, CancellationToken cancellationToken)
    {
        var classEntity = await facultyDbContext.Classes.FirstOrDefaultAsync(x => x.ClassCode == request.ClassCode.Value, cancellationToken);

        if (classEntity is null)
        {
            throw new ResourceNotFoundException($"Không tìm thấy lớp học với mã lớp {request.ClassCode.Value}");
        }

        classEntity.ClassName = request.ClassName;
        classEntity.AcademicYearCode = request.AcademicYearCode;

        try
        {
            await facultyDbContext.SaveChangesAsync(cancellationToken);
            return Result.Ok(request.ClassCode);
        }
        catch (DbUpdateException e)
        {
            if (e.InnerException is UniqueConstraintException)
            {
                throw new DuplicateException($"Lớp học với mã lớp {request.ClassCode.Value} đã tồn tại", e);
            }
            throw;
        }
    }
}