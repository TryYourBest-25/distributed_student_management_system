using FacultyService.Application.CreditClasses.Query;
using FacultyService.Application.CreditClasses.Response;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FacultyService.Application.CreditClasses.QueryHandler;

public class CreditClassOpeningQueryHandler(FacultyDbContext dbContext)
    : IRequestHandler<CreditClassOpening, IList<CreditClassForStudentResponse>>
{
    public async Task<IList<CreditClassForStudentResponse>> Handle(CreditClassOpening request,
        CancellationToken cancellationToken)
    {
        var students = await dbContext.CreditClasses
            .AsNoTracking()
            .Where(s => s.AcademicYear == request.AcademicYearCode.Value && s.Semester == request.Semester.Value &&
                        s.IsCancelled)
            .Select(s => new CreditClassForStudentResponse
            {
                Id = s.CreditClassId,
                CourseCode = s.CourseCodeNavigation.CourseCode,
                LectureCredit = s.CourseCodeNavigation.LectureCredit,
                LabCredit = s.CourseCodeNavigation.LabCredit,
                GroupNumber = s.GroupNumber,
                CurrentStudent = s.Registrations.Count,
                MinStudent = s.MinStudent,
                AcademicYear = s.AcademicYear,
                Semester = s.Semester,
                IsRegistered = s.Registrations.Any(r => r.StudentCode == request.StudentCode.Value),
            })
            .OrderBy(s => s.LectureCredit)
            .ToListAsync(cancellationToken);

        return students;
        throw new NotImplementedException();
    }
}