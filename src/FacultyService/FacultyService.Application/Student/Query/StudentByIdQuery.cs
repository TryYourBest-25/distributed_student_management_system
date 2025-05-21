using FacultyService.Application.Student.Response;
using FacultyService.Domain.ValueObject;
using MediatR;
using Shared.Domain.ValueObject;

namespace FacultyService.Application.Student.Query;

public record StudentByIdQuery(StudentCode StudentCode) : IRequest<StudentResponse?>; 