using AcademicService.Domain.ValueObject;
using FluentResults;
using MediatR;

namespace AcademicService.Application.Course.Command;

public record UpdateCourseCommand(
    CourseCode OldCourseCode,
    CourseCode CourseCode,
    CourseName CourseName,
    LectureCredit LectureCredit,
    LabCredit LabCredit) : IRequest<Result<CourseCode>>; // Trả về true nếu thành công