using MediatR;
using Shared.Domain.ValueObject;

namespace AcademicService.Application.Course.Command;

public record DeleteCourseByIdsCommand(List<CourseCode> CourseCodes) : IRequest<int>;