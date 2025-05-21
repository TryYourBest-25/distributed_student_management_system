using FacultyService.Application.Class.Query;
using FacultyService.Application.Class.Response;
using Gridify;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Shared.Exception;

namespace FacultyService.Application.Class.QueryHandler;

public class SearchClassQueryHandler(FacultyDbContext context)
    : IRequestHandler<SearchClassQuery, Paging<ClassResponse>>
{
    public async Task<Paging<ClassResponse>> Handle(SearchClassQuery request, CancellationToken cancellationToken)
    {

        var mapper = new GridifyMapper<Domain.Entity.Class>()
            .GenerateMappings();

        if (!request.GridifyQuery.IsValid(mapper))
        {
            throw new BadInputException("Chuỗi truy vấn không hợp lệ");
        }

        var classResponses = await context.Classes
            .AsNoTracking()
            .ApplyFilteringOrderingPaging(request.GridifyQuery, mapper)
            .Select(c => new ClassResponse
            {
                ClassCode = c.ClassCode,
                ClassName = c.ClassName,
                FacultyCode = c.FacultyCode,
                StudentCount = c.Students.Count,
                FacultyName = c.FacultyCodeNavigation.FacultyName
            })
            .ToListAsync(cancellationToken);
        
        return new Paging<ClassResponse>(classResponses.Count, classResponses); // count từ GridifyAsync có thể không chính xác sau Select projection
    }
} 