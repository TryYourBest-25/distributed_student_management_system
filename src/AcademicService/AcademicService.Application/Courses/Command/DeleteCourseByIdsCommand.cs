using MediatR;
using Shared.Domain.ValueObject;

namespace AcademicService.Application.Courses.Command;

public record DeleteCourseByIdsCommand(List<CourseCode> CourseCodes) : IRequest<int>;