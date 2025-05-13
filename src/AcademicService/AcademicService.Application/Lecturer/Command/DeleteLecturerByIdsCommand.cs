using AcademicService.Domain.ValueObject;
using FluentResults;
using MediatR;

namespace AcademicService.Application.Lecturer.Command;

public record DeleteLecturerByIdsCommand(IEnumerable<LecturerCode> LecturerCodes)
    : IRequest<Result<Tuple<string, int>>>; 