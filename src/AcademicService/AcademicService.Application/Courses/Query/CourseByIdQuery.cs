using AcademicService.Application.Courses.Response;
using MediatR;
using Shared.Domain.ValueObject;

namespace AcademicService.Application.Courses.Query;

public record CourseByIdQuery(CourseCode CourseCode) : IRequest<CourseBasicResponse?>;