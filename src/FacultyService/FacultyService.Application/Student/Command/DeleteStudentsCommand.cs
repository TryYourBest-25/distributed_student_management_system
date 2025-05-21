using System.Collections.Immutable;
using FacultyService.Domain.ValueObject;
using FluentResults;
using MediatR;

namespace FacultyService.Application.Student.Command;

public record DeleteStudentsCommand (ImmutableList<StudentCode> StudentCodes) : IRequest<Result<int>>
{
}