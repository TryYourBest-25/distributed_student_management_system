using FluentResults;
using MediatR;
using Shared.Domain.ValueObject;

namespace AcademicService.Application.Lecturers.Command;

public record DeleteLecturerByIdCommand(LecturerCode LecturerCode) : IRequest<LecturerCode>;