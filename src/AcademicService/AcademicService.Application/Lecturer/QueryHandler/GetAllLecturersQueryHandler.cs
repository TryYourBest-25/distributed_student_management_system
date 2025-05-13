using AcademicService.Application.DbContext;
using AcademicService.Application.Lecturer.Query;
using AcademicService.Application.Lecturer.Response;
using Arch.EntityFrameworkCore.UnitOfWork.Collections;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AcademicService.Application.Lecturer.QueryHandler;

public class GetAllLecturersQueryHandler : IRequestHandler<DefaultLecturerQuery, IPagedList<LecturerResponse>>
{
    private readonly AcademicDbContext _context;

    public GetAllLecturersQueryHandler(AcademicDbContext context)
    {
        _context = context;
    }

    public async Task<IPagedList<LecturerResponse>> Handle(DefaultLecturerQuery request,
        CancellationToken cancellationToken)
    {
        var query = _context.Lecturers
            .AsNoTracking()
            .Select(l => new LecturerResponse
            {
                LecturerCode = l.LecturerCode,
                FirstName = l.FirstName,
                LastName = l.LastName,
                Degree = l.Degree,
                AcademicRank = l.AcademicRank,
                Specialization = l.Specialization,
                FacultyCode = l.FacultyCode
            });

        // Xử lý sắp xếp
        if (!string.IsNullOrEmpty(request.OrderBy))
        {
            query = request.OrderBy.ToLower() switch
            {
                "lecturercode" => request.Desc
                    ? query.OrderByDescending(l => l.LecturerCode)
                    : query.OrderBy(l => l.LecturerCode),
                "firstname" => request.Desc
                    ? query.OrderByDescending(l => l.FirstName)
                    : query.OrderBy(l => l.FirstName),
                "lastname" => request.Desc
                    ? query.OrderByDescending(l => l.LastName)
                    : query.OrderBy(l => l.LastName),
                "facultycode" => request.Desc
                    ? query.OrderByDescending(l => l.FacultyCode)
                    : query.OrderBy(l => l.FacultyCode),
                _ => query.OrderBy(l => l.LecturerCode)
            };
        }
        else
        {
            query = query.OrderBy(l => l.LecturerCode);
        }

        // Lấy dữ liệu có phân trang
        return await query.ToPagedListAsync(request.Page, request.Size, cancellationToken: cancellationToken);
    }
} 