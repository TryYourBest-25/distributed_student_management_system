using FacultyService.Domain.ValueObject;
using MediatR;
using Shared.Domain.ValueObject;

namespace FacultyService.Application.Classes.Command;

public record CreateClassCommand(
    ClassName ClassName,
    ClassCode ClassCode,
    AcademicYearCode AcademicYearCode
) : IRequest<ClassCode>;