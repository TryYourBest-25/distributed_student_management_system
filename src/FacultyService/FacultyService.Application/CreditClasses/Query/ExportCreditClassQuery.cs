using MediatR;
using Shared.Domain.ValueObject;

namespace FacultyService.Application.CreditClasses.Query;

public record ExportCreditClassQuery(AcademicYearCode AcademicYearCode, Semester Semester) : IRequest<Stream>;