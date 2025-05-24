using FacultyService.Application.Students.Query;
using FacultyService.Application.Students.Response;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FacultyService.Application.Students.QueryHandler;

public class GetStudentByIdQueryHandler(FacultyDbContext dbContext)
    : IRequestHandler<StudentByIdQuery, StudentBasicResponse?>
{
    public async Task<StudentBasicResponse?> Handle(StudentByIdQuery request, CancellationToken cancellationToken)
    {
        var student = await dbContext.Students
            .Where(s => s.StudentCode == request.StudentCode)
            .Select(s => new StudentBasicResponse
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