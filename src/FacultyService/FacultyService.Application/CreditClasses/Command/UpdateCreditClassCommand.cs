using FacultyService.Domain.ValueObject;
using MediatR;
using Shared.Domain.ValueObject;

namespace FacultyService.Application.CreditClasses.Command;

public record UpdateCreditClassCommand(
    int Id,
    LecturerCode LecturerCode,
    CourseCode CourseCode,
    GroupNumber GroupNumber,
    Semester Semester,
    ushort MinStudent,
    bool IsCancelled,
    AcademicYearCode AcademicYearCode
) : IRequest<int>;