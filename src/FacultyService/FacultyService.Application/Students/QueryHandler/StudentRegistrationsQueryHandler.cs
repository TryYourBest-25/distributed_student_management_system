using Arch.EntityFrameworkCore.UnitOfWork.Collections;
using FacultyService.Application.Registrations.Response;
using FacultyService.Application.Students.Query;
using Gridify;
using MediatR;

namespace FacultyService.Application.Students.QueryHandler;

public class StudentRegistrationsQueryHandler(FacultyDbContext dbContext)
    : IRequestHandler<StudentRegistrationsQuery, IPagedList<RegistrationBasicResponse>>
{
    public async Task<IPagedList<RegistrationBasicResponse>> Handle(StudentRegistrationsQuery request,
        CancellationToken cancellationToken)
    {
        var query = await dbContext.Registrations
            .Where(r => r.StudentCode == request.StudentCode.Value)
            .ApplyOrdering(request.GridifyQuery.OrderBy ?? "CreditClassId")
            .Select(r => new RegistrationBasicResponse
            {
                CreditClassId = r.CreditClassId,
                CourseCode = r.CreditClass.CourseCode,
                GroupNumber = r.CreditClass.GroupNumber,
                CurrentStudent = r.CreditClass.Registrations.Count,
                MinStudent = r.CreditClass.MinStudent,
                AcademicYear = r.CreditClass.AcademicYear,
                Semester = r.CreditClass.Semester,
                IsCancelled = r.IsCancelled
            }).ToPagedListAsync(request.GridifyQuery.Page, request.GridifyQuery.PageSize,
                cancellationToken: cancellationToken);

        return query;
    }
}