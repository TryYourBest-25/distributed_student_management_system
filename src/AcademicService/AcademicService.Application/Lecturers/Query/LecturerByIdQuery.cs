using AcademicService.Application.Lecturers.Response;
using MediatR;
using Shared.Domain.ValueObject;

namespace AcademicService.Application.Lecturers.Query;

public record LecturerByIdQuery(LecturerCode LecturerCode) : IRequest<LecturerResponse?>;