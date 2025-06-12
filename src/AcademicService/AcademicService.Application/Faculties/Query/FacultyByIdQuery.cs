using AcademicService.Application.Faculties.Response;
using MediatR;
using Shared.Domain.ValueObject;

namespace AcademicService.Application.Faculties.Query;

public record FacultyByIdQuery(FacultyCode FacultyCode) : IRequest<FacultyBasicResponse?>;