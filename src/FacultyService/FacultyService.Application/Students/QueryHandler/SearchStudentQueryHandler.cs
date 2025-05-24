using FacultyService.Application.Students.Query;
using FacultyService.Application.Students.Response;
using Gridify;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Shared.Domain.ValueObject;
using Shared.Exception;

// Giả sử StudentEf nằm trong đây

namespace FacultyService.Application.Students.QueryHandler;

public class SearchStudentQueryHandler(FacultyDbContext context)
    : IRequestHandler<SearchStudentQuery, Paging<StudentBasicResponse>>
{
    public async Task<Paging<StudentBasicResponse>> Handle(SearchStudentQuery request,
        CancellationToken cancellationToken)
    {
        var mapper = new GridifyMapper<Domain.Entity.Student>()
            .AddMap("classname", s => s.Class.ClassName) // Ánh xạ tùy chỉnh cho ClassName
            .GenerateMappings();

        if (!request.GridifyQuery.IsValid(mapper))
        {
            throw new BadInputException("Chuỗi truy vấn không hợp lệ");
        }

        var studentResponses = await context.Students
            .ApplyFiltering(request.GridifyQuery, mapper)
            .Select(s => new StudentBasicResponse
            {
                StudentCode = s.StudentCode,
                FirstName = s.FirstName,
                LastName = s.LastName,
                BirthDate = s.BirthDate,
                Address = s.Address,
                IsSuspended = s.IsSuspended,
                ClassCode = s.ClassCode,
                FacultyCode = s.FacultyCode,
                Gender = GenderExtensions.FromBoolean(s.Gender ?? false),
            }).ToListAsync(cancellationToken);

        return new Paging<StudentBasicResponse>(studentResponses.Count, studentResponses);
    }
}