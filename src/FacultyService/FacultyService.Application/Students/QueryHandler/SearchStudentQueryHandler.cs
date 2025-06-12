using Arch.EntityFrameworkCore.UnitOfWork.Collections;
using FacultyService.Application.Students.Query;
using FacultyService.Application.Students.Response;
using FacultyService.Domain.Entity;
using Gridify;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Shared.Domain.ValueObject;
using Shared.Exception;

namespace FacultyService.Application.Students.QueryHandler;

public class SearchStudentQueryHandler(FacultyDbContext context)
    : IRequestHandler<SearchStudentQuery, IPagedList<StudentBasicResponse>>
{
    public async Task<IPagedList<StudentBasicResponse>> Handle(SearchStudentQuery request,
        CancellationToken cancellationToken)
    {
        var mapper = new GridifyMapper<Student>().GenerateMappings();

        if (!request.GridifyQuery.IsValid(mapper))
        {
            throw new BadInputException("Chuỗi truy vấn không hợp lệ");
        }

        var studentResponses = await context.Students
            .ApplyFiltering(request.GridifyQuery, mapper)
            .ApplyOrdering(request.GridifyQuery.OrderBy ?? "StudentCode", mapper)
            .Select(s => new StudentBasicResponse
            {
                StudentCode = s.StudentCode,
                FirstName = s.FirstName,
                LastName = s.LastName,
                BirthDate = s.BirthDate,
                Address = s.Address,
                IsSuspended = s.IsSuspended,
                ClassCode = s.ClassCode,
                FacultyCode = s.FacultyCode,
                Gender = GenderExtensions.FromBoolean(s.Gender ?? false),
            }).ToPagedListAsync(request.GridifyQuery.Page, request.GridifyQuery.PageSize,
                cancellationToken: cancellationToken);

        return studentResponses;
    }
}