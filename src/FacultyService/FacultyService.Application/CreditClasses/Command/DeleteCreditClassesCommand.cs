using MediatR;

namespace FacultyService.Application.CreditClasses.Command;

public record DeleteCreditClassesCommand(List<int> CreditClassIds) : IRequest<int>;