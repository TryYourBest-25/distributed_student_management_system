using AcademicService.Application.Course.Command;
using AcademicService.Application.DbContext;
using EntityFramework.Exceptions.Common;
using FluentResults;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Shared.Domain.ValueObject;
using Shared.Exception;

namespace AcademicService.Application.Course.CommandHandler;

public class UpdateCourseCommandHandler : IRequestHandler<UpdateCourseCommand, Result<CourseCode>>
{
    private readonly AcademicDbContext _context;

    public UpdateCourseCommandHandler(AcademicDbContext context)
    {
        _context = context;
    }

    public async Task<Result<CourseCode>> Handle(UpdateCourseCommand request, CancellationToken cancellationToken)
    {
        var courseEf = await _context.Courses.FindAsync(request.OldCourseCode.Value, cancellationToken) ?? throw new ResourceNotFoundException($"Khóa học với mã {request.CourseCode} không tồn tại");
        
        var newCourse = new Domain.Aggregate.CourseAg(courseCode: request.CourseCode)
        {
            CourseName = request.CourseName,
            LectureCredit = request.LectureCredit,
            LabCredit = request.LabCredit
        };
        
        courseEf.CourseName = newCourse.CourseName;
        courseEf.LectureCredit = newCourse.LectureCredit;
        courseEf.LabCredit = newCourse.LabCredit;
        courseEf.CourseCode = newCourse.Id;

        try
        {
            _context.Courses.Update(courseEf);
            await _context.SaveChangesAsync(cancellationToken);
            return Result.Ok(newCourse.Id);
        }catch (UniqueConstraintException ex)
        {
            if (ex.Message.Contains("course_code"))
            {
                throw new DuplicateException($"Mã khóa học {courseEf.CourseCode} đã tồn tại");
            }

            if (ex.Message.Contains("course_name"))
            {
                throw new DuplicateException($"Tên khóa học {courseEf.CourseName} đã tồn tại");
            }
        }
        
        return Result.Ok();

        
    }
}