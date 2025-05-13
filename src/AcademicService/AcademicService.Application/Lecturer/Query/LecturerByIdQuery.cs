using AcademicService.Application.Lecturer.Response;
using AcademicService.Domain.ValueObject;
using MediatR;

namespace AcademicService.Application.Lecturer.Query;

public record LecturerByIdQuery(LecturerCode LecturerCode) : IRequest<LecturerResponse?>; 