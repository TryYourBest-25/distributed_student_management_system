using FluentResults;
using MediatR;
using Shared.Domain.ValueObject;

namespace FacultyService.Application.Students.Command;

public record CreateStudentCommand(
    LastName LastName,
    FirstName FirstName,
    ClassCode ClassCode,
    Gender? Gender,
    DateOnly? BirthDate,
    string? Address,
    bool? IsSuspended
) : IRequest<StudentCode>;