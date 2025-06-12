using Arch.EntityFrameworkCore.UnitOfWork.Collections;
using FacultyService.Application.Students.Query;
using FacultyService.Application.Students.Response;
using Gridify;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Shared.Domain.ValueObject;

namespace FacultyService.Application.Students.QueryHandler;

public class StudentInClassQueryHandler(FacultyDbContext context)
    : IRequestHandler<StudentInClassQuery, IPagedList<StudentBasicResponse>>
{
    public async Task<IPagedList<StudentBasicResponse>> Handle(StudentInClassQuery request,
        CancellationToken cancellationToken)
    {
        if (request.GridifyQuery.OrderBy is null)
        {
            request.GridifyQuery.OrderBy = "StudentCode";
        }

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