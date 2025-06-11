using System;
using FacultyService.Application.CreditClasses.Query;
using FacultyService.Application.CreditClasses.Response;
using FacultyService.Domain.Entity;
using Gridify;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Shared.Exception;

namespace FacultyService.Application.CreditClasses.QueryHandler;

public class SearchCreditClassQueryHandler(FacultyDbContext dbContext)
    : IRequestHandler<SearchCreditClassQuery, Paging<CreditClassBasicResponse>>
{
    public async Task<Paging<CreditClassBasicResponse>> Handle(SearchCreditClassQuery request,
        CancellationToken cancellationToken)
    {
        var queryMapper = new GridifyMapper<CreditClass>().AddMap("current_student", c => c.Registrations.Count)
            .AddMap("lecture_credit", c => c.CourseCodeNavigation.LectureCredit)
            .AddMap("lab_credit", c => c.CourseCodeNavigation.LabCredit)
            .AddMap("lecturer_name", c => c.LecturerCodeNavigation.FirstName + " " + c.LecturerCodeNavigation.LastName)
            .GenerateMappings();

        if (request.GridifyQuery.IsValid(queryMapper))
        {
            throw new BadInputException("Chuỗi truy vấn không hợp lệ");
        }

        var creditClasses = await dbContext.CreditClasses
            .ApplyFiltering(request.GridifyQuery, queryMapper)
            .Select(c => new CreditClassBasicResponse
            {
                CreditClassId = c.CreditClassId,
                CourseCode = c.CourseCode,
                GroupNumber = c.GroupNumber,
                CurrentStudent = c.Registrations.Count,
                MinStudent = c.MinStudent,
                AcademicYear = c.AcademicYear,
                Semester = c.Semester,
            }).ToListAsync(cancellationToken);

        return new Paging<CreditClassBasicResponse>(
            creditClasses.Count,
            creditClasses
        );
    }
}