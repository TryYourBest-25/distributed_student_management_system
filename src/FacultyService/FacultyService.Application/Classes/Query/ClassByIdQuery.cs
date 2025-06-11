using FacultyService.Application.Classes.Response;
using Gridify;
using MediatR;
using Shared.Domain.ValueObject;

namespace FacultyService.Application.Classes.Query;

public record ClassByIdQuery(ClassCode ClassCode, GridifyQuery GridifyQuery) : IRequest<ClassDetailResponse?>;