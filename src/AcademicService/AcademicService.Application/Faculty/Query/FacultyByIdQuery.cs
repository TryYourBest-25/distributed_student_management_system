using AcademicService.Application.Faculty.Response;
using AcademicService.Domain.ValueObject;
using MediatR;

namespace AcademicService.Application.Faculty.Query;

public record FacultyByIdQuery(FacultyCode FacultyCode) : IRequest<FacultyResponse?>; 