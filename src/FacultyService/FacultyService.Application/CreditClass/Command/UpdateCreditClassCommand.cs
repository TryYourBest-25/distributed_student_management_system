using FacultyService.Domain.ValueObject;
using FluentResults;
using MediatR;
using Shared.Domain.ValueObject;

namespace FacultyService.Application.CreditClass.Command;

public record UpdateCreditClassCommand(
    int Id,
    ClassName ClassName,
    CourseCode CourseCode,
    GroupNumber GroupNumber,
    ushort MinStudent,
    bool IsCancelled,
    AcademicYearCode AcademicYearCode
) : IRequest<Result<int>>;