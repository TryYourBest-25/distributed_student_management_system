using AcademicService.Domain.ValueObject;
using MediatR;

namespace AcademicService.Application.Course.Command;

public record DeleteCourseByIdsCommand(List<CourseCode> CourseCodes) : IRequest<int>;