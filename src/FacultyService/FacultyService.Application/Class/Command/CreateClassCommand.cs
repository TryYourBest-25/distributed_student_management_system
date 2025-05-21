using FacultyService.Domain.ValueObject;
using FluentResults;
using MediatR;

namespace FacultyService.Application.Class.Command;

public record CreateClassCommand(
    ClassName ClassName,
    ClassCode ClassCode,
    AcademicYearCode AcademicYearCode
) : IRequest<Result<ClassCode>>;
