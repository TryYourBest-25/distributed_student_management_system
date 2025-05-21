using FacultyService.Application.CreditClass.Query;
using FacultyService.Application.CreditClass.Response;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FacultyService.Application.CreditClass.QueryHandler;

public class CreditClassOpeningQueryHandler(FacultyDbContext dbContext) : IRequestHandler<CreditClassOpening, IList<CreditClassResponse>>
{
    public async Task<IList<CreditClassResponse>> Handle(CreditClassOpening request, CancellationToken cancellationToken)
    {
        var students = await dbContext.CreditClasses
            .AsNoTracking()
            .Where(s => s.AcademicYear == request.AcademicYearCode.Value && s.Semester == request.Semester.Value && s.IsCancelled)
            .Select(s => new CreditClassResponse
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