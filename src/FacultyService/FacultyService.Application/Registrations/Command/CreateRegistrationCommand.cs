using MediatR;
using Shared.Domain.ValueObject;

namespace FacultyService.Application.Registrations.Command;

public record CreateRegistrationCommand(
    int CreditClassId,
    StudentCode StudentCode
) : IRequest<int>;