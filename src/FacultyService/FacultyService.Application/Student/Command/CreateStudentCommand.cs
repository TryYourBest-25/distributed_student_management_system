using FacultyService.Domain.ValueObject;
using FluentResults;
using MediatR;
using Shared.Domain.ValueObject;

namespace FacultyService.Application.Student.Command;

public record CreateStudentCommand(
    StudentCode? StudentCode,
    LastName LastName,
    FirstName FirstName,
    ClassCode ClassCode,
    Gender? Gender,
    DateOnly? BirthDate,
    string? Address,
    bool? IsSuspended
    ): IRequest<Result<StudentCode>>;