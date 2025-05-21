using FacultyService.Application.Student.Command;
using FacultyService.Domain.ValueObject;
using FluentResults;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Shared.Domain.ValueObject;
using Shared.Exception;

namespace FacultyService.Application.Student.CommandHandler;

public class UpdateStudentCommandHandler (FacultyDbContext facultyDbContext)
    : IRequestHandler<UpdateStudentCommand, Result<StudentCode>>
{
    public async Task<Result<StudentCode>> Handle(UpdateStudentCommand request, CancellationToken cancellationToken)
    {
        var student = await facultyDbContext.Students.FirstOrDefaultAsync(s => s.StudentCode == request.StudentCode, cancellationToken) ?? throw new ResourceNotFoundException($"Không tìm thấy sinh viên với mã {request.StudentCode}");
        
        student.LastName = request.LastName;
        student.FirstName = request.FirstName;
        student.BirthDate = request.BirthDate;
        student.Address = request.Address;
        student.IsSuspended = request.IsSuspended;
        student.Gender = request.Gender.ToBoolean();

        await facultyDbContext.SaveChangesAsync(cancellationToken);

        return Result.Ok(new StudentCode(student.StudentCode));
    }
}
