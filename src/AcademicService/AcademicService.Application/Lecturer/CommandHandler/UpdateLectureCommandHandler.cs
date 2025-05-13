using AcademicService.Application.DbContext;
using AcademicService.Application.Lecturer.Command;
using AcademicService.Domain.Aggregate;
using AcademicService.Domain.ValueObject;
using FluentResults;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Shared.Exception;

namespace AcademicService.Application.Lecturer.CommandHandler;

public class UpdateLectureCommandHandler (AcademicDbContext dbContext) : IRequestHandler<UpdateLectureCommand, Result<LecturerCode>>
{
    public async Task<Result<LecturerCode>> Handle(UpdateLectureCommand request, CancellationToken cancellationToken)
    {
        var lecture = await dbContext.Lecturers.FindAsync(request.OldLecturerCode, cancellationToken) 
            ?? throw new ResourceNotFoundException($"Giảng viên với mã {request.LecturerCode} không tồn tại");

        var newLecture = new LecturerAg(request.LecturerCode)
        {
            AcademicRank = request.AcademicRank,
            Degree = request.Degree,
            FirstName = request.FirstName,
            LastName = request.LastName,
            Specialization = request.Specialization,
            FacultyCode = request.FacultyCode
        };
        
        lecture.AcademicRank = newLecture.AcademicRank;
        lecture.Degree = newLecture.Degree;
        lecture.FirstName = newLecture.FirstName;
        lecture.LastName = newLecture.LastName;
        lecture.Specialization = newLecture.Specialization;
        lecture.FacultyCode = newLecture.FacultyCode;
        lecture.LecturerCode = newLecture.Id;
        
        try
        {
            dbContext.Lecturers.Update(lecture);
            await dbContext.SaveChangesAsync(cancellationToken);
            return Result.Ok(newLecture.Id);
        }
        catch (DbUpdateException ex)
        {
            if (ex.InnerException?.Message.Contains("lecturer_code") == true)
            {
                throw new DuplicateException($"Mã giảng viên đã tồn tại");
            }
            
            if (ex.InnerException?.Message.Contains("lecturer_name") == true)
            {
                throw new DuplicateException($"Tên giảng viên đã tồn tại");
            }
        }
        
        return Result.Fail(new Error("Không thể cập nhật giảng viên"));
    }
}