using FluentResults;
using MediatR;
using Shared.Domain.ValueObject;

namespace AcademicService.Application.Lecturer.Command;

public record DeleteLecturerByIdCommand(LecturerCode LecturerCode) : IRequest<Result>;