using AcademicService.Application.DbContext;
using AcademicService.Application.Faculties.Query;
using AcademicService.Application.Faculties.Response;
using Arch.EntityFrameworkCore.UnitOfWork.Collections;
using Gridify;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AcademicService.Application.Faculties.QueryHandler;

public class GetAllFacultiesQueryHandler(AcademicDbContext context)
    : IRequestHandler<DefaultFacultyQuery, IPagedList<FacultyBasicResponse>>
{
    public async Task<IPagedList<FacultyBasicResponse>> Handle(DefaultFacultyQuery request,
        CancellationToken cancellationToken)
    {
        var query = await context.Faculties
            .AsNoTracking()
            .ApplyOrdering(request.GridifyQuery)
            .Select(f => new FacultyBasicResponse
            {
                FacultyCode = f.FacultyCode,
                FacultyName = f.FacultyName
            }).ToPagedListAsync(request.GridifyQuery.Page, request.GridifyQuery.PageSize,
                cancellationToken: cancellationToken);

        return query;
    }
}