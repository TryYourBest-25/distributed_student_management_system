using FacultyService.Domain.ValueObject;
using MediatR;
using Shared.Domain.ValueObject;

namespace FacultyService.Application.CreditClasses.Query;

public record ExportStudentScoreInCreditClassQuery(
    AcademicYearCode AcademicYearCode,
    Semester Semester,
    CourseCode CourseCode,
    GroupNumber GroupNumber) : IRequest<Stream>;