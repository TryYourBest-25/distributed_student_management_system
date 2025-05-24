using FacultyService.Application.CreditClasses.Query;
using FacultyService.Application.CreditClasses.Response;
using FacultyService.Application.Students.Response;
using MediatR;
using Shared.Domain.ValueObject;
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
                Id = c.CreditClassId,
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
                Students = c.Registrations.Select(r => new StudentBasicResponse
                {
                    StudentCode = r.StudentCode,
                    FirstName = r.Student.FirstName,
                    LastName = r.Student.LastName,
                    Gender = GenderExtensions.FromBoolean(r.Student.Gender ?? false),
                    BirthDate = r.Student.BirthDate,
                    Address = r.Student.Address,
                    IsSuspended = r.Student.IsSuspended,
                    ClassCode = r.Student.ClassCode,
                    FacultyCode = r.Student.FacultyCode,
                }).ToList(),
            }).FirstOrDefaultAsync(cancellationToken);

        return creditClass;
    }
}