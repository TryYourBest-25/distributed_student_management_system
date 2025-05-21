using FacultyService.Application.Class.Response;
using FacultyService.Domain.ValueObject;
using MediatR;
using Shared.Domain.ValueObject;

namespace FacultyService.Application.Class.Query;

public record ClassByIdQuery(ClassCode ClassCode) : IRequest<ClassResponse>; 