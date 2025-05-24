using FacultyService.Application.Classes.Query;
using FacultyService.Application.Classes.Response;
using FacultyService.Application.Students.Response;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FacultyService.Application.Classes.QueryHandler;

public class GetClassByIdQueryHandler(FacultyDbContext context)
    : IRequestHandler<ClassByIdQuery, ClassBasicResponse?>
{
    public async Task<ClassBasicResponse?> Handle(ClassByIdQuery request, CancellationToken cancellationToken)
    {
        var classEntity = await context.Classes
            .Where(c => c.ClassCode == request.ClassCode)
            .Select(c => new ClassDetailResponse()
            {
                ClassCode = c.ClassCode,
                ClassName = c.ClassName,
                FacultyCode = c.FacultyCode,
                StudentCount = c.Students.Count,
                Students = c.Students.Select(s => new StudentBasicResponse()
                {
                    StudentCode = s.StudentCode,
                    FirstName = s.FirstName,
                    LastName = s.LastName,
                    BirthDate = s.BirthDate,
                    Address = s.Address,
                    IsSuspended = s.IsSuspended,
                    ClassCode = s.ClassCode,
                    FacultyCode = s.FacultyCode,
                }).ToList()
            })
            .FirstOrDefaultAsync(cancellationToken);

        return classEntity;
    }
}