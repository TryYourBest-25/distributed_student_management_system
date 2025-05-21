using FacultyService.Domain.ValueObject;
using FluentResults;
using MediatR;
using Shared.Domain.ValueObject;

namespace FacultyService.Application.CreditClass.Command;

public record CreateCreditClassCommand(
    ClassName ClassName,
    CourseCode CourseCode,
    GroupNumber GroupNumber,
    ushort MinStudent,
    AcademicYearCode AcademicYearCode
) : IRequest<Result<int>>;