using FacultyService.Domain.ValueObject;
using MediatR;
using Shared.Domain.ValueObject;

namespace FacultyService.Application.Classes.Command;

public record UpdateClassCommand(
    ClassCode ClassCode,
    ClassName ClassName,
    AcademicYearCode AcademicYearCode
) : IRequest<ClassCode>;