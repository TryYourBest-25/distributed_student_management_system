using FacultyService.Application.Students.Response;
using MediatR;
using Shared.Domain.ValueObject;

namespace FacultyService.Application.Students.Query;

public record StudentByIdQuery(StudentCode StudentCode) : IRequest<StudentDetailReponse?>;