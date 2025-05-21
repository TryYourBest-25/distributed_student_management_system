using FacultyService.Application.CreditClass.Response;
using FacultyService.Domain.ValueObject;
using MediatR;

namespace FacultyService.Application.CreditClass.Query;

public record CreditClassOpening(AcademicYearCode AcademicYearCode, Semester Semester, StudentCode StudentCode) : IRequest<IList<CreditClassResponse>>
{
    
}