using FacultyService.Domain.ValueObject;
using FluentResults;
using MediatR;
using Shared.Domain.ValueObject;

namespace FacultyService.Application.Registration.Command;

public record LecturerUpdateScoreCommand(int CreditClassId,
    StudentCode StudentCode,
    Scores Scores) : IRequest<Result<StudentCode>>;