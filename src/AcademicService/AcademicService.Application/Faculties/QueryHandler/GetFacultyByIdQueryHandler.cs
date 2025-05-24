using AcademicService.Application.DbContext;
using AcademicService.Application.Faculties.Query;
using AcademicService.Application.Faculties.Response;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AcademicService.Application.Faculties.QueryHandler;

public class GetFacultyByIdQueryHandler(AcademicDbContext context)
    : IRequestHandler<FacultyByIdQuery, FacultyBasicResponse?>
{
    public async Task<FacultyBasicResponse?> Handle(FacultyByIdQuery request, CancellationToken cancellationToken)
    {
        var faculty = await context.Faculties
            .AsNoTracking()
            .Where(f => f.FacultyCode == request.FacultyCode.Value)
            .Select(f => new FacultyBasicResponse
            {
                FacultyCode = f.FacultyCode,
                FacultyName = f.FacultyName,
            })
            .FirstOrDefaultAsync(cancellationToken);

        return faculty;
    }
}