using AcademicService.Application.Course.Command;
using AcademicService.Application.DbContext;
using EntityFramework.Exceptions.Common;
using FluentResults;
using MediatR;
using Shared.Domain.ValueObject;
using Shared.Exception;
using Shared.Infra.Entity;

namespace AcademicService.Application.Course.CommandHandler;

public class CreateCourseCommandHandler : IRequestHandler<CreateCourseCommand, Result<CourseCode>>
{
    private readonly AcademicDbContext _context;

    public CreateCourseCommandHandler(AcademicDbContext context)
    {
        _context = context;
    }

    public async Task<Result<CourseCode>> Handle(CreateCourseCommand request, CancellationToken cancellationToken)
    {
        var course = new Domain.Aggregate.CourseAg(courseCode: request.CourseCode)
        {
            CourseName = request.CourseName,
            LectureCredit = request.LectureCredit,
            LabCredit = request.LabCredit
        };
        
        var courseEf = new CourseEf
        {
            CourseCode = course.Id,
            CourseName = course.CourseName,
            LectureCredit = course.LectureCredit,
            LabCredit = course.LabCredit
        };

        try
        {
            _context.Courses.Add(courseEf);
            await _context.SaveChangesAsync(cancellationToken);
            return Result.Ok(course.Id);
        }catch (UniqueConstraintException ex)
        {
            if (ex.GetBaseException().Message.Contains("PRIMARY"))
            {
                throw new DuplicateException($"Mã khóa học {course.Id} đã tồn tại");
            }

            if (ex.Message.Contains("course_name"))
            {
                throw new DuplicateException($"Tên khóa học {course.CourseName} đã tồn tại");
            }
        }
        
        return Result.Fail(new Error("Không thể tạo khóa học"));
    }
}