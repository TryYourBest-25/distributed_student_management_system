using AcademicService.Application.DbContext;
using AcademicService.Application.Faculty.Query;
using AcademicService.Application.Faculty.Response;
using Gridify;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Shared.Infra.Entity;

namespace AcademicService.Application.Faculty.QueryHandler;

public class SearchFacultyQueryHandler : IRequestHandler<SearchFacultyQuery, Paging<FacultyResponse>>
{
    private readonly AcademicDbContext _context;
    
    public SearchFacultyQueryHandler(AcademicDbContext context)
    {
        _context = context;
    }
    
    public async Task<Paging<FacultyResponse>> Handle(SearchFacultyQuery request, CancellationToken cancellationToken)
    {
        
        var mapper = new GridifyMapper<FacultyEf>().GenerateMappings();
        

        var faculties = await _context.Faculties
            .AsNoTracking()
            .ApplyFiltering(request.GridifyQuery, mapper)
            .Select(f => new FacultyResponse
            {
                FacultyCode = f.FacultyCode,
                FacultyName = f.FacultyName,
            }).ToListAsync(cancellationToken);

        return new Paging<FacultyResponse>
        {
            Count = faculties.Count,
            Data = faculties
        };
    }
} 