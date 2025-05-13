using AcademicService.Domain.ValueObject;
using FluentResults;
using MediatR;

namespace AcademicService.Application.Course.Command;

public record DeleteCourseByIdCommand(CourseCode CourseCode) : IRequest<Result>; // Trả về true nếu thành công 