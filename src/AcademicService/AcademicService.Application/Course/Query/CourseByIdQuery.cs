using AcademicService.Application.Course.Response;
using AcademicService.Domain.ValueObject;
using MediatR;

namespace AcademicService.Application.Course.Query;

public record CourseByIdQuery(CourseCode CourseCode) : IRequest<CourseResponse?>; 