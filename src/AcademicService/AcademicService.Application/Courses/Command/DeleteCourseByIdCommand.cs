using MediatR;
using Shared.Domain.ValueObject;

namespace AcademicService.Application.Courses.Command;

public record DeleteCourseByIdCommand(CourseCode CourseCode) : IRequest<CourseCode>;