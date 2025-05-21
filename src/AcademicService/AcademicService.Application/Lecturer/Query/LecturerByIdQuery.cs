using AcademicService.Application.Lecturer.Response;
using MediatR;
using Shared.Domain.ValueObject;

namespace AcademicService.Application.Lecturer.Query;

public record LecturerByIdQuery(LecturerCode LecturerCode) : IRequest<LecturerResponse?>; 