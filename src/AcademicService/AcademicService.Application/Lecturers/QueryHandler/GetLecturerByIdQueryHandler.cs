using AcademicService.Application.DbContext;
using AcademicService.Application.Lecturers.Query;
using AcademicService.Application.Lecturers.Response;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AcademicService.Application.Lecturers.QueryHandler;

public class GetLecturerByIdQueryHandler(AcademicDbContext context)
    : IRequestHandler<LecturerByIdQuery, LecturerResponse?>
{
    public async Task<LecturerResponse?> Handle(LecturerByIdQuery request, CancellationToken cancellationToken)
    {
        var lecturer = await context.Lecturers
            .AsNoTracking()
            .Where(l => l.LecturerCode == request.LecturerCode.Value)
            .Select(l => new LecturerResponse
            {
                LecturerCode = l.LecturerCode,
                FirstName = l.FirstName,
                LastName = l.LastName,
                Degree = l.Degree,
                AcademicRank = l.AcademicRank,
                Specialization = l.Specialization,
                FacultyCode = l.FacultyCode
            })
            .FirstOrDefaultAsync(cancellationToken);

        return lecturer;
    }
}