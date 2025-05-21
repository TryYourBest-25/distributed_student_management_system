using FluentResults;
using MediatR;
using Shared.Domain.ValueObject;

namespace AcademicService.Application.Course.Command;

public record DeleteCourseByIdCommand(CourseCode CourseCode) : IRequest<Result>; // Trả về true nếu thành công 