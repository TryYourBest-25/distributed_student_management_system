using Arch.EntityFrameworkCore.UnitOfWork.Collections;
using FacultyService.Application.Students.Query;
using FacultyService.Application.Students.Response;
using Gridify;
using MediatR;
using Shared.Domain.ValueObject;

namespace FacultyService.Application.Students.QueryHandler;

public class StudentInCreditClassQueryHandler(FacultyDbContext context)
    : IRequestHandler<StudentInCreditClassQuery, IPagedList<StudentBasicResponse>>
{
    public async Task<IPagedList<StudentBasicResponse>> Handle(StudentInCreditClassQuery request,
        CancellationToken cancellationToken)
    {
        var query = await context.Students
            .ApplyOrdering(request.GridifyQuery.OrderBy ?? "StudentCode")
            .Where(s => s.Registrations.Any(r => r.CreditClassId == request.CreditClassId))
            .Select(s => new StudentBasicResponse
            {
                StudentCode = s.StudentCode, FirstName = s.FirstName, LastName = s.LastName,
                Gender = GenderExtensions.FromBoolean(s.Gender ?? false), BirthDate = s.BirthDate, Address = s.Address,
                IsSuspended = s.IsSuspended, ClassCode = s.ClassCode, FacultyCode = s.FacultyCode
            }).ToPagedListAsync(request.GridifyQuery.Page, request.GridifyQuery.PageSize,
                cancellationToken: cancellationToken);
        return query;
    }
}