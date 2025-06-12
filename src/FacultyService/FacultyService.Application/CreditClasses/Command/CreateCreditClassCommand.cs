using FacultyService.Domain.ValueObject;
using FluentResults;
using MediatR;
using Shared.Domain.ValueObject;

namespace FacultyService.Application.CreditClasses.Command;

public record CreateCreditClassCommand(
    LecturerCode LecturerCode,
    CourseCode CourseCode,
    GroupNumber GroupNumber,
    ushort MinStudent,
    AcademicYearCode AcademicYearCode,
    Semester Semester
) : IRequest<int>;