using AcademicService.Application.Course.Query;
using AcademicService.Application.Course.Response;
using AcademicService.Application.DbContext;
using Arch.EntityFrameworkCore.UnitOfWork.Collections;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace AcademicService.Application.Course.QueryHandler;

public class GetAllCoursesQueryHandler : IRequestHandler<DefaultCourseQuery, IPagedList<CourseResponse>>
{
    private readonly AcademicDbContext _context;

    public GetAllCoursesQueryHandler(AcademicDbContext context)
    {
        _context = context;
    }

    public async Task<IPagedList<CourseResponse>> Handle(DefaultCourseQuery request,
        CancellationToken cancellationToken)
    {
        var query = _context.Courses
            .AsNoTracking()
            .Select(c => new CourseResponse
            {
                CourseCode = c.CourseCode,
                CourseName = c.CourseName,
                LectureCredit = c.LectureCredit,
                LabCredit = c.LabCredit
            });

        // Xử lý sắp xếp
        if (!string.IsNullOrEmpty(request.OrderBy))
        {
            query = request.OrderBy.ToLower() switch
            {
                "coursecode" => request.Desc
                    ? query.OrderByDescending(c => c.CourseCode)
                    : query.OrderBy(c => c.CourseCode),
                "coursename" => request.Desc
                    ? query.OrderByDescending(c => c.CourseName)
                    : query.OrderBy(c => c.CourseName),
                "lecturecredit" => request.Desc
                    ? query.OrderByDescending(c => c.LectureCredit)
                    : query.OrderBy(c => c.LectureCredit),
                "labcredit" => request.Desc
                    ? query.OrderByDescending(c => c.LabCredit)
                    : query.OrderBy(c => c.LabCredit),
                _ => query.OrderBy(c => c.CourseCode)
            };
        }
        else
        {
            query = query.OrderBy(c => c.CourseCode);
        }

        // Lấy dữ liệu có phân trang
        return await query.ToPagedListAsync(request.Page, request.Size, cancellationToken: cancellationToken);
    }
}