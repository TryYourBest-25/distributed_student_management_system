using AcademicService.Application.DbContext;
using AcademicService.Application.Faculties.Query;
using AcademicService.Application.Faculties.Response;
using Gridify;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Shared.Infra.Entity;

namespace AcademicService.Application.Faculties.QueryHandler;

public class SearchFacultyQueryHandler : IRequestHandler<SearchFacultyQuery, Paging<FacultyBasicResponse>>
{
    private readonly AcademicDbContext _context;

    public SearchFacultyQueryHandler(AcademicDbContext context)
    {
        _context = context;
    }

    public async Task<Paging<FacultyBasicResponse>> Handle(SearchFacultyQuery request,
        CancellationToken cancellationToken)
    {
        var mapper = new GridifyMapper<Faculty>().GenerateMappings();


        var faculties = await _context.Faculties
            .AsNoTracking()
            .ApplyFiltering(request.GridifyQuery, mapper)
            .Select(f => new FacultyBasicResponse
            {
                FacultyCode = f.FacultyCode,
                FacultyName = f.FacultyName,
            }).ToListAsync(cancellationToken);

        return new Paging<FacultyBasicResponse>
        {
            Count = faculties.Count,
            Data = faculties
        };
    }
}