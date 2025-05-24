using Arch.EntityFrameworkCore.UnitOfWork.Collections;
using FacultyService.Application.Classes.Query;
using FacultyService.Application.Classes.Response;
using Gridify;
using MediatR;

namespace FacultyService.Application.Classes.QueryHandler;

public class GetAllClassesQueryHandler(FacultyDbContext dbContext)
    : IRequestHandler<DefaultClassQuery, IPagedList<ClassBasicResponse>>
{
    public async Task<IPagedList<ClassBasicResponse>> Handle(DefaultClassQuery request,
        CancellationToken cancellationToken)
    {
        var classes = await dbContext.Classes
            .ApplyOrdering(request.GridifyQuery)
            .Select(c => new ClassBasicResponse
            {
                ClassCode = c.ClassCode,
                ClassName = c.ClassName,
                FacultyCode = c.FacultyCode,
                StudentCount = c.Students.Count,
                FacultyName = c.FacultyCodeNavigation.FacultyName
            })
            .ToPagedListAsync(request.GridifyQuery.Page, request.GridifyQuery.PageSize,
                cancellationToken: cancellationToken);
        return classes;
    }
}