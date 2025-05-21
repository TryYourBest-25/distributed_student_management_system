using FacultyService.Domain.ValueObject;
using FluentResults;
using MediatR;

namespace FacultyService.Application.Class.Command;

public record UpdateClassCommand(
    ClassCode ClassCode,
    ClassName ClassName,
    AcademicYearCode AcademicYearCode
) : IRequest<Result<ClassCode>>;