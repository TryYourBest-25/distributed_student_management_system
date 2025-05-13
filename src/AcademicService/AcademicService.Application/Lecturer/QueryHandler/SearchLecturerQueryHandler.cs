using AcademicService.Application.DbContext;
using AcademicService.Application.Lecturer.Query;
using AcademicService.Application.Lecturer.Response;
using Gridify;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Shared.Infra.Entity;

namespace AcademicService.Application.Lecturer.QueryHandler;

public class SearchLecturerQueryHandler : IRequestHandler<SearchLecturerQuery, Paging<LecturerResponse>>
{
    private readonly AcademicDbContext _context;
    
    public SearchLecturerQueryHandler(AcademicDbContext context)
    {
        _context = context;
    }
    
    public async Task<Paging<LecturerResponse>> Handle(SearchLecturerQuery request, CancellationToken cancellationToken)
    {
        var mapper = new GridifyMapper<LecturerEf>().GenerateMappings();

        var lecturers = await _context.Lecturers
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