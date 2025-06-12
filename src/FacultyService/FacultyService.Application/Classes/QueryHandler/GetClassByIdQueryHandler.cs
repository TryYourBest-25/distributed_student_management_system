using Arch.EntityFrameworkCore.UnitOfWork.Collections;
using FacultyService.Application.Classes.Query;
using FacultyService.Application.Classes.Response;
using FacultyService.Application.Students.Response;
using Gridify;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FacultyService.Application.Classes.QueryHandler;

public class GetClassByIdQueryHandler(FacultyDbContext context)
    : IRequestHandler<ClassByIdQuery, ClassDetailResponse?>
{
    public async Task<ClassDetailResponse?> Handle(ClassByIdQuery request, CancellationToken cancellationToken)
    {
        var classData = await context.Classes
            .Where(c => c.ClassCode == request.ClassCode.Value)
            .Select(c => new ClassDetailResponse()
            {
                ClassCode = c.ClassCode,
                ClassName = c.ClassName,
                FacultyCode = c.FacultyCode,
                StudentCount = c.Students.Count,
                FacultyName = c.FacultyCodeNavigation.FacultyName,
                AcademicYearCode = c.AcademicYearCode
            })
            .FirstOrDefaultAsync(cancellationToken);

        return classData;
    }
}