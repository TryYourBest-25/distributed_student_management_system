using FacultyService.Application.CreditClass.Command;
using FacultyService.Domain.ValueObject;
using FluentResults;
using MediatR;
using Microsoft.Extensions.Logging;

namespace FacultyService.Application.Registration.Command;

public record StudentRegisterCreditClassCommand(int CreditClassId, StudentCode StudentCode, bool IsCancelled) : IRequest<Result<int>>;