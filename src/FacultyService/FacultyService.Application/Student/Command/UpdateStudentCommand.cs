using FacultyService.Domain.ValueObject;
using FluentResults;
using MediatR;
using Shared.Domain.ValueObject;

namespace FacultyService.Application.Student.Command;

public record UpdateStudentCommand(
    StudentCode StudentCode,
    LastName LastName,
    FirstName FirstName,
    DateOnly? BirthDate,
    string? Address,
    bool IsSuspended,
    Gender Gender) : IRequest<Result<StudentCode>>;