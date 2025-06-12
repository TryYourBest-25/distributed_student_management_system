using FluentResults;
using MediatR;
using Shared.Domain.ValueObject;

namespace FacultyService.Application.Registrations.Command;

public record StudentRegisterCreditClassCommand(
    int CreditClassId,
    StudentCode StudentCode,
    bool IsCancelled) : IRequest<int>;