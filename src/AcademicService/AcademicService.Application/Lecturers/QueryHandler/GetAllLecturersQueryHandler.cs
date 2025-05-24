using AcademicService.Application.DbContext;
using AcademicService.Application.Lecturers.Query;
using AcademicService.Application.Lecturers.Response;
using Arch.EntityFrameworkCore.UnitOfWork.Collections;
using Gridify;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AcademicService.Application.Lecturers.QueryHandler;

public class GetAllLecturersQueryHandler(AcademicDbContext context)
    : IRequestHandler<DefaultLecturerQuery, IPagedList<LecturerResponse>>
{
    public async Task<IPagedList<LecturerResponse>> Handle(DefaultLecturerQuery request,
        CancellationToken cancellationToken)
    {
        var query = await context.Lecturers
            .AsNoTracking()
            .ApplyOrdering(request.GridifyQuery)
            .Select(l => new LecturerResponse
            {
                LecturerCode = l.LecturerCode,
                FirstName = l.FirstName,
                LastName = l.LastName,
                Degree = l.Degree,
                AcademicRank = l.AcademicRank,
                Specialization = l.Specialization,
                FacultyCode = l.FacultyCode
            }).ToPagedListAsync(request.GridifyQuery.Page, request.GridifyQuery.PageSize,
                cancellationToken: cancellationToken);

        return query;
    }
}