using AcademicService.Application.Faculty.Response;
using MediatR;
using Shared.Domain.ValueObject;

namespace AcademicService.Application.Faculty.Query;

public record FacultyByIdQuery(FacultyCode FacultyCode) : IRequest<FacultyResponse?>; 