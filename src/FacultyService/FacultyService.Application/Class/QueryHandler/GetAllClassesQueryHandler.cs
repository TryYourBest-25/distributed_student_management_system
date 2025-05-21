using Arch.EntityFrameworkCore.UnitOfWork.Collections;
using FacultyService.Application.Class.Query;
using FacultyService.Application.Class.Response;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FacultyService.Application.Class.QueryHandler;

public class GetAllClassesQueryHandler(FacultyDbContext dbContext) : IRequestHandler<DefaultClassQuery, IPagedList<ClassResponse>>
{
    public async Task<IPagedList<ClassResponse>> Handle(DefaultClassQuery request, CancellationToken cancellationToken)
    {
        var classes = await dbContext.Classes
            .Include(c => c.Students)
            .Include(c => c.FacultyCodeNavigation)
            .AsNoTracking()
            .Select(c => new ClassResponse
            {
                ClassCode = c.ClassCode,
                ClassName = c.ClassName,
                FacultyCode = c.FacultyCode,
                StudentCount = c.Students.Count,
                FacultyName = c.FacultyCodeNavigation.FacultyName
            })
            .OrderBy(c => c.ClassCode)
            .ToPagedListAsync(request.Page, request.Size, cancellationToken: cancellationToken);
        return classes;
    }
}