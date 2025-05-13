using AcademicService.Domain.ValueObject;
using FluentResults;
using MediatR;

namespace AcademicService.Application.Lecturer.Command;

public record DeleteLecturerByIdCommand(LecturerCode LecturerCode) : IRequest<Result>;