using FluentResults;
using MediatR;
using Shared.Domain.ValueObject;

namespace AcademicService.Application.Lecturer.Command;

public record DeleteLecturerByIdsCommand(IEnumerable<LecturerCode> LecturerCodes)
    : IRequest<Result<Tuple<string, int>>>; 