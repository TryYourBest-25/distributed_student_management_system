using System;
using Arch.EntityFrameworkCore.UnitOfWork.Collections;
using FacultyService.Application.CreditClasses.Query;
using FacultyService.Application.CreditClasses.Response;
using Gridify;
using MediatR;

namespace FacultyService.Application.CreditClasses.QueryHandler;

public class GetAllCreditClassQueryHandler(FacultyDbContext dbContext)
    : IRequestHandler<DefaultCreditClassQuery, IPagedList<CreditClassBasicResponse>>
{
    public async Task<IPagedList<CreditClassBasicResponse>> Handle(DefaultCreditClassQuery request,
        CancellationToken cancellationToken)
    {
        var creditClasses = await dbContext.CreditClasses
            .ApplyOrdering(request.GridifyQuery)
            .Select(c => new CreditClassBasicResponse
            {
                Id = c.CreditClassId,
                CourseCode = c.CourseCode,
                GroupNumber = c.GroupNumber,
                CurrentStudent = c.Registrations.Count,
                MinStudent = c.MinStudent,
                AcademicYear = c.AcademicYear,
                Semester = c.Semester,
            })
            .ToPagedListAsync(request.GridifyQuery.Page, request.GridifyQuery.PageSize,
                cancellationToken: cancellationToken);

        return creditClasses;
    }
}