using FluentResults;
using MediatR;
using Shared.Domain.ValueObject;

namespace FacultyService.Application.Registrations.Command;

public record UpdateScoreCommand(
    int CreditClassId,
    StudentCode StudentCode,
    Scores Scores) : IRequest<StudentCode>;