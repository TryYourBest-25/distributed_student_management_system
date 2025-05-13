using AcademicService.Application.DbContext;
using AcademicService.Application.Lecturer.Command;
using AcademicService.Domain.Aggregate;
using AcademicService.Domain.ValueObject;
using FluentResults;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Shared.Exception;
using Shared.Infra.Entity;

namespace AcademicService.Application.Lecturer.CommandHandler;

public class CreateLectureCommandHandler(AcademicDbContext dbContext) : IRequestHandler<CreateLectureCommand, Result<LecturerCode>>
{
    public async Task<Result<LecturerCode>> Handle(CreateLectureCommand request, CancellationToken cancellationToken)
    {
        var lecture = new LecturerAg( request.LecturerCode)
        {
            FirstName = request.FirstName,
            LastName = request.LastName,
            Degree = request.Degree,
            AcademicRank = request.AcademicRank,
            Specialization = request.Specialization,
            FacultyCode = request.FacultyCode
        };

        var lectureEf = new LecturerEf
        {
            FirstName = request.FirstName,
            LastName = request.LastName,
            Degree = request.Degree,
            AcademicRank = request.AcademicRank,
            Specialization = request.Specialization,
            FacultyCode = request.FacultyCode
        };

        try
        {
            dbContext.Lecturers.Add(lectureEf);
            await dbContext.SaveChangesAsync(cancellationToken);
            return Result.Ok(lecture.Id);
        }
        catch (DbUpdateException ex)
        {
            if (ex.InnerException?.Message.Contains("PRIMARY") == true)
            {
                throw new DuplicateException($"Mã giảng viên {lecture.Id} đã tồn tại");
            }

            if (ex.InnerException?.Message.Contains("lecturer_name") == true)
            {
                throw new DuplicateException($"Tên giảng viên {lecture.FirstName} {lecture.LastName} đã tồn tại");
            }
        }
        
        return Result.Fail(new Error("Không thể tạo giảng viên"));
    }
}