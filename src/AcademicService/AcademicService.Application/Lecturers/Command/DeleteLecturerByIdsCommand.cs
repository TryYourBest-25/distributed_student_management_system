using FluentResults;
using MediatR;
using Shared.Domain.ValueObject;

namespace AcademicService.Application.Lecturers.Command;

public record DeleteLecturerByIdsCommand(IEnumerable<LecturerCode> LecturerCodes) : IRequest<int>;