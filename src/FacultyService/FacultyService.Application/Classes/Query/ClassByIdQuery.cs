using FacultyService.Application.Classes.Response;
using MediatR;
using Shared.Domain.ValueObject;

namespace FacultyService.Application.Classes.Query;

public record ClassByIdQuery(ClassCode ClassCode) : IRequest<ClassBasicResponse?>;