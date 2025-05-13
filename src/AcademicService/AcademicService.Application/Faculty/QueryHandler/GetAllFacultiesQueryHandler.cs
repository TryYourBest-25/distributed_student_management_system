using AcademicService.Application.DbContext;
using AcademicService.Application.Faculty.Query;
using AcademicService.Application.Faculty.Response;
using Arch.EntityFrameworkCore.UnitOfWork.Collections;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AcademicService.Application.Faculty.QueryHandler;

public class GetAllFacultiesQueryHandler : IRequestHandler<DefaultFacultyQuery, IPagedList<FacultyResponse>>
{
    private readonly AcademicDbContext _context;

    public GetAllFacultiesQueryHandler(AcademicDbContext context)
    {
        _context = context;
    }

    public async Task<IPagedList<FacultyResponse>> Handle(DefaultFacultyQuery request,
        CancellationToken cancellationToken)
    {
        var query = _context.Faculties
            .AsNoTracking()
            .Select(f => new FacultyResponse
            {
                FacultyCode = f.FacultyCode,
                FacultyName = f.FacultyName
            });

        // Xử lý sắp xếp
        if (!string.IsNullOrEmpty(request.OrderBy))
        {
            query = request.OrderBy.ToLower() switch
            {
                "facultycode" => request.Desc
                    ? query.OrderByDescending(f => f.FacultyCode)
                    : query.OrderBy(f => f.FacultyCode),
                "facultyname" => request.Desc
                    ? query.OrderByDescending(f => f.FacultyName)
                    : query.OrderBy(f => f.FacultyName),
                _ => query.OrderBy(f => f.FacultyCode)
            };
        }
        else
        {
            query = query.OrderBy(f => f.FacultyCode);
        }

        // Lấy dữ liệu có phân trang
        return await query.ToPagedListAsync(request.Page, request.Size, cancellationToken: cancellationToken);
    }
} 