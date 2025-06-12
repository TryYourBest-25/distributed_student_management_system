using FluentResults;
using MediatR;
using Shared.Domain.ValueObject;

namespace AcademicService.Application.Courses.Command;

public record CreateCourseCommand(
    CourseCode CourseCode,
    CourseName CourseName,
    LectureCredit LectureCredit,
    LabCredit LabCredit) : IRequest<CourseCode>; // Trả về true nếu thành công