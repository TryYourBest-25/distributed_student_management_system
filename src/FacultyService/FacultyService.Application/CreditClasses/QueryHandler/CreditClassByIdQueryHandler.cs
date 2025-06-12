using FacultyService.Application.CreditClasses.Query;
using FacultyService.Application.CreditClasses.Response;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace FacultyService.Application.CreditClasses.QueryHandler;

public class CreditClassByIdQueryHandler(FacultyDbContext dbContext, ILogger<CreditClassByIdQueryHandler> logger)
    : IRequestHandler<CreditClassByIdQuery, CreditClassDetailResponse?>
{
    public async Task<CreditClassDetailResponse?> Handle(CreditClassByIdQuery request,
        CancellationToken cancellationToken)
    {
        logger.LogInformation("(///) Querying credit class {CreditClassId} for tenant {TenantId}",
            request.Id, dbContext.TenantInfo.Id);

        var creditClass = await dbContext.CreditClasses
            .Where(c => c.CreditClassId == request.Id)
            .Select(c => new CreditClassDetailResponse
            {
                CreditClassId = c.CreditClassId,
                CourseCode = c.CourseCode,
                GroupNumber = c.GroupNumber,
                CurrentStudent = c.Registrations.Count,
                MinStudent = c.MinStudent,
                AcademicYear = c.AcademicYear,
                Semester = c.Semester,
                LecturerName = dbContext.Lecturers
                    .IgnoreQueryFilters()
                    .Where(l => l.LecturerCode == c.LecturerCode)
                    .Select(l => l.FirstName + " " + l.LastName)
                    .FirstOrDefault() ?? "Unknown Lecturer",
                LecturerCode = c.LecturerCode,
                CourseName = c.CourseCodeNavigation.CourseName,
                LectureCredit = c.CourseCodeNavigation.LectureCredit,
                LabCredit = c.CourseCodeNavigation.LabCredit,
                IsCancelled = c.IsCancelled
            }).FirstOrDefaultAsync(cancellationToken);

        logger.LogInformation("(///) Credit class found: {Found}", creditClass != null);

        return creditClass;
    }
}