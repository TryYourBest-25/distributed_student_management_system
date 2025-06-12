using MediatR;
using Shared.Domain.ValueObject;

namespace FacultyService.Application.Students.Command;

public record DeleteStudentsCommand(IList<StudentCode> StudentCodes) : IRequest<int>;