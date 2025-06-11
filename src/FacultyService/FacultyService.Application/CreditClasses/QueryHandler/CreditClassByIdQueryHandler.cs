using FacultyService.Application.CreditClasses.Query;
using FacultyService.Application.CreditClasses.Response;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FacultyService.Application.CreditClasses.QueryHandler;

public class CreditClassByIdQueryHandler(FacultyDbContext dbContext)
    : IRequestHandler<CreditClassByIdQuery, CreditClassDetailResponse?>
{
    public async Task<CreditClassDetailResponse?> Handle(CreditClassByIdQuery request,
        CancellationToken cancellationToken)
    {
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
                LecturerName = c.LecturerCodeNavigation.FirstName + " " + c.LecturerCodeNavigation.LastName,
                LecturerCode = c.LecturerCode,
                CourseName = c.CourseCodeNavigation.CourseName,
                LectureCredit = c.CourseCodeNavigation.LectureCredit,
                LabCredit = c.CourseCodeNavigation.LabCredit,
                IsCancelled = c.IsCancelled
            }).FirstOrDefaultAsync(cancellationToken);

        return creditClass;
    }
}