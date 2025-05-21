using FacultyService.Application.Student.Query;
using FacultyService.Application.Student.Response;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FacultyService.Application.Student.QueryHandler;

public class GetStudentByIdQueryHandler (FacultyDbContext dbContext): IRequestHandler<StudentByIdQuery, StudentResponse?>
{

    public async Task<StudentResponse?> Handle(StudentByIdQuery request, CancellationToken cancellationToken)
    {
        var student = await dbContext.Students
            .AsNoTracking()
            .Where(s => s.StudentCode == request.StudentCode)
            .Select(s => new StudentResponse
            {
                StudentCode = s.StudentCode,
                FirstName = s.FirstName,
                LastName = s.LastName,
                BirthDate = s.BirthDate,
                Address = s.Address,
                IsSuspended = s.IsSuspended,
                ClassCode = s.ClassCode,
                FacultyCode = s.FacultyCode
            })
            .FirstOrDefaultAsync(cancellationToken);

        return student;
    }
}