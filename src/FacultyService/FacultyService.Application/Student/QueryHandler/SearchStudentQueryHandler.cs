using Arch.EntityFrameworkCore.UnitOfWork.Collections;
using FacultyService.Application.Student.Query;
using FacultyService.Application.Student.Response;
using Gridify;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Shared.Domain.ValueObject;
using Shared.Exception;
using Shared.Infra.Entity; // Giả sử StudentEf nằm trong đây

namespace FacultyService.Application.Student.QueryHandler;

public class SearchStudentQueryHandler(FacultyDbContext context)
    : IRequestHandler<SearchStudentQuery, Paging<StudentResponse>>
{
    public async Task<Paging<StudentResponse>> Handle(SearchStudentQuery request, CancellationToken cancellationToken)
    {
        var mapper = new GridifyMapper<Domain.Entity.Student>()
            .AddMap("classname", s => s.Class.ClassName) // Ánh xạ tùy chỉnh cho ClassName
            .GenerateMappings();

        if (!request.GridifyQuery.IsValid(mapper))
        {
            throw new BadInputException("Chuỗi truy vấn không hợp lệ");
        }

        var studentResponses = await context.Students
            .ApplyFilteringOrderingPaging(request.GridifyQuery, mapper)
            .Select(s => new StudentResponse
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

        return new Paging<StudentResponse>(studentResponses.Count, studentResponses);
    }
} 