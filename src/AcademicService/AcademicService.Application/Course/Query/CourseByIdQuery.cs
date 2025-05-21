using AcademicService.Application.Course.Response;
using MediatR;
using Shared.Domain.ValueObject;

namespace AcademicService.Application.Course.Query;

public record CourseByIdQuery(CourseCode CourseCode) : IRequest<CourseResponse?>; 