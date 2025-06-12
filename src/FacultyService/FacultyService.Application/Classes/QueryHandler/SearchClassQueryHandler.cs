using FacultyService.Application.Classes.Query;
using FacultyService.Application.Classes.Response;
using Gridify;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Shared.Exception;

namespace FacultyService.Application.Classes.QueryHandler;

public class SearchClassQueryHandler(FacultyDbContext context)
    : IRequestHandler<SearchClassQuery, Paging<ClassBasicResponse>>
{
    public async Task<Paging<ClassBasicResponse>> Handle(SearchClassQuery request, CancellationToken cancellationToken)
    {
        var mapper = new GridifyMapper<Domain.Entity.Class>()
            .GenerateMappings();

        if (!request.GridifyQuery.IsValid(mapper))
        {
            throw new BadInputException("Chuỗi truy vấn không hợp lệ");
        }

        var classResponses = await context.Classes
            .AsNoTracking()
            .ApplyFiltering(request.GridifyQuery, mapper)
            .Select(c => new ClassBasicResponse
            {
                ClassCode = c.ClassCode,
                ClassName = c.ClassName,
                FacultyCode = c.FacultyCode,
                StudentCount = c.Students.Count,
                FacultyName = c.FacultyCodeNavigation.FacultyName
            })
            .ToListAsync(cancellationToken);

        return
            new Paging<ClassBasicResponse>(classResponses.Count,
                classResponses); // count từ GridifyAsync có thể không chính xác sau Select projection
    }
}