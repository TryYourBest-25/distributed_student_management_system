using FacultyService.Application.CreditClasses.Response;
using MediatR;
using Shared.Domain.ValueObject;

namespace FacultyService.Application.CreditClasses.Query;

public record CreditClassOpening(AcademicYearCode AcademicYearCode, Semester Semester, StudentCode StudentCode)
    : IRequest<IList<CreditClassForStudentResponse>>;