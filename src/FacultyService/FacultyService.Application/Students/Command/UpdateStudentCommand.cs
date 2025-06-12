using FluentResults;
using MediatR;
using Shared.Domain.ValueObject;

namespace FacultyService.Application.Students.Command;

public record UpdateStudentCommand(
    StudentCode OldStudentCode,
    StudentCode? NewStudentCode,
    LastName LastName,
    FirstName FirstName,
    DateOnly? BirthDate,
    Gender Gender,
    string? Address,
    bool? IsSuspended
) : IRequest<StudentCode>;