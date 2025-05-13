using AcademicService.Application.DbContext;
using AcademicService.Application.Faculty.Query;
using AcademicService.Application.Faculty.Response;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AcademicService.Application.Faculty.QueryHandler;

public class GetFacultyByIdQueryHandler(AcademicDbContext context)
    : IRequestHandler<FacultyByIdQuery, FacultyResponse?>
{
    public async Task<FacultyResponse?> Handle(FacultyByIdQuery request, CancellationToken cancellationToken)
    {
        var faculty = await context.Faculties
            .AsNoTracking()
            .Where(f => f.FacultyCode == request.FacultyCode.Value)
            .Select(f => new FacultyResponse
            {
                FacultyCode = f.FacultyCode,
                FacultyName = f.FacultyName,
            })
            .FirstOrDefaultAsync(cancellationToken);

        return faculty;
    }
} 