using FacultyService.Application.Student.Query;
using Arch.EntityFrameworkCore.UnitOfWork.Collections;
using FacultyService.Application.Student.Response;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Shared.Domain.ValueObject;

namespace FacultyService.Application.Student.QueryHandler;

public class GetAllStudentsQueryHandler(FacultyDbContext context)
    : IRequestHandler<DefaultStudentQuery, IPagedList<StudentResponse>>
{
    public async Task<IPagedList<StudentResponse>> Handle(DefaultStudentQuery request,
        CancellationToken cancellationToken)
    {
        var query = context.Students
            .AsNoTracking()
            .Include(s => s.Class) // Giả sử có navigation property 'Class'
            .Select(s => new StudentResponse
            {
                StudentCode = s.StudentCode,
                FirstName = s.FirstName,
                LastName = s.LastName,
                Gender = GenderExtensions.FromBoolean(s.Gender ?? false),
                BirthDate = s.BirthDate,
                Address = s.Address,
                IsSuspended = s.IsSuspended,
                ClassCode = s.ClassCode,
                FacultyCode = s.FacultyCode,
            });

        // Xử lý sắp xếp
        if (!string.IsNullOrEmpty(request.OrderBy))
        {
            query = request.OrderBy.ToLower() switch
            {
                "studentcode" => request.Desc
                    ? query.OrderByDescending(s => s.StudentCode)
                    : query.OrderBy(s => s.StudentCode),
                "firstname" => request.Desc
                    ? query.OrderByDescending(s => s.FirstName)
                    : query.OrderBy(s => s.FirstName),
                "lastname" => request.Desc
                    ? query.OrderByDescending(s => s.LastName)
                    : query.OrderBy(s => s.LastName),
                "birthdate" => request.Desc
                    ? query.OrderByDescending(s => s.BirthDate)
                    : query.OrderBy(s => s.BirthDate),
                _ => request.Desc
                    ? query.OrderByDescending(s => s.StudentCode)
                    : query.OrderBy(s => s.StudentCode)
            };
        }
        else
        {
            query = query.OrderBy(s => s.StudentCode);
        }

        // Lấy dữ liệu có phân trang
        return await query.ToPagedListAsync(request.Page, request.Size, cancellationToken: cancellationToken);
    }
} 