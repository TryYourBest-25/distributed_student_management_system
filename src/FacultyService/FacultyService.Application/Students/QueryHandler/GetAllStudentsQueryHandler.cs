using Arch.EntityFrameworkCore.UnitOfWork.Collections;
using FacultyService.Application.Students.Query;
using FacultyService.Application.Students.Response;
using Gridify;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Shared.Domain.ValueObject;

namespace FacultyService.Application.Students.QueryHandler;

public class GetAllStudentsQueryHandler(FacultyDbContext context)
    : IRequestHandler<DefaultStudentQuery, IPagedList<StudentBasicResponse>>
{
    public async Task<IPagedList<StudentBasicResponse>> Handle(DefaultStudentQuery request,
        CancellationToken cancellationToken)
    {
        var query = await context.Students
            .ApplyOrdering(request.GridifyQuery)
            .Select(s => new StudentBasicResponse
            {
                StudentCode = s.StudentCode,
                FirstName = s.FirstName,
                LastName = s.LastName,
                Gender = GenderExtensions.FromBoolean(s.Gender ?? false),
                BirthDate = s.BirthDate,
                Address = s.Address,
                IsSuspended = s.IsSuspended,
                ClassCode = s.ClassCode,
                FacultyCode = s.FacultyCode,
            }).ToPagedListAsync(request.GridifyQuery.Page, request.GridifyQuery.PageSize,
                cancellationToken: cancellationToken);


        return query;
    }
}