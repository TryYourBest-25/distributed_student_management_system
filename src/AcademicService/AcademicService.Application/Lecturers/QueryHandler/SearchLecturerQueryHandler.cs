using AcademicService.Application.DbContext;
using AcademicService.Application.Lecturers.Query;
using AcademicService.Application.Lecturers.Response;
using Gridify;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Shared.Exception;
using Shared.Infra.Entity;

namespace AcademicService.Application.Lecturers.QueryHandler;

public class SearchLecturerQueryHandler(AcademicDbContext context)
    : IRequestHandler<SearchLecturerQuery, Paging<LecturerResponse>>
{
    public async Task<Paging<LecturerResponse>> Handle(SearchLecturerQuery request, CancellationToken cancellationToken)
    {
        var mapper = new GridifyMapper<Lecturer>().GenerateMappings();

        if (!request.GridifyQuery.IsValid<Lecturer>(mapper))
        {
            throw new BadInputException("Chuỗi tìm kiếm không hợp lệ");
        }

        var lecturers = await context.Lecturers
            .AsNoTracking()
            .ApplyFiltering(request.GridifyQuery, mapper)
            .Select(l => new LecturerResponse
            {
                LecturerCode = l.LecturerCode,
                FirstName = l.FirstName,
                LastName = l.LastName,
                Degree = l.Degree,
                AcademicRank = l.AcademicRank,
                Specialization = l.Specialization,
                FacultyCode = l.FacultyCode
            }).ToListAsync(cancellationToken);

        return new Paging<LecturerResponse>
        {
            Count = lecturers.Count,
            Data = lecturers
        };
    }
}