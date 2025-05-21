using FacultyService.Application.Class.Query;
using FacultyService.Application.Class.Response;
using FacultyService.Application.Student.Response;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FacultyService.Application.Class.QueryHandler;

public class GetClassByIdQueryHandler(FacultyDbContext context)
    : IRequestHandler<ClassByIdQuery, ClassResponse?>
{
    public async Task<ClassResponse?> Handle(ClassByIdQuery request, CancellationToken cancellationToken)
    {
        var classEntity = await context.Classes
            .AsNoTracking()
            .Include(c => c.Students)
            .Where(c => c.ClassCode == request.ClassCode)
            .Select(c => new ClassDetailResponse()
            {
                ClassCode = c.ClassCode,
                ClassName = c.ClassName,
                FacultyCode = c.FacultyCode,
                StudentCount = c.Students.Count,
                Students = c.Students.Select(s => new StudentResponse()
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