using FacultyService.Application.Students.Command;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Shared.Domain.ValueObject;
using Shared.Exception;

namespace FacultyService.Application.Students.CommandHandler;

public class UpdateStudentCommandHandler(FacultyDbContext facultyDbContext)
    : IRequestHandler<UpdateStudentCommand, StudentCode>
{
    public async Task<StudentCode> Handle(UpdateStudentCommand request, CancellationToken cancellationToken)
    {
        var student =
            await facultyDbContext.Students.FirstOrDefaultAsync(s => s.StudentCode == request.StudentCode,
                cancellationToken) ??
            throw new ResourceNotFoundException($"Không tìm thấy sinh viên với mã {request.StudentCode}");

        student.LastName = request.LastName;
        student.FirstName = request.FirstName;
        student.BirthDate = request.BirthDate;
        student.Address = request.Address;
        student.IsSuspended = request.IsSuspended;
        student.Gender = request.Gender.ToBoolean();

        await facultyDbContext.SaveChangesAsync(cancellationToken);

        return new StudentCode(student.StudentCode);
    }
}