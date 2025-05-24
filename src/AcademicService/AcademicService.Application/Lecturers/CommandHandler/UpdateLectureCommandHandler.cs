using AcademicService.Application.DbContext;
using AcademicService.Application.Lecturers.Command;
using EntityFramework.Exceptions.Common;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Shared.Domain.ValueObject;
using Shared.Exception;
using Microsoft.Extensions.Logging;

namespace AcademicService.Application.Lecturers.CommandHandler;

public class UpdateLectureCommandHandler(AcademicDbContext dbContext, ILogger logger)
    : IRequestHandler<UpdateLectureCommand, LecturerCode>
{
    public async Task<LecturerCode> Handle(UpdateLectureCommand request, CancellationToken cancellationToken)
    {
        var lecture = await dbContext.Lecturers.Where(l => l.LecturerCode == request.LecturerCode.Value)
                          .FirstOrDefaultAsync(cancellationToken)
                      ?? throw new ResourceNotFoundException($"Giảng viên với mã {request.LecturerCode} không tồn tại");

        lecture.AcademicRank = request.AcademicRank;
        lecture.Degree = request.Degree;
        lecture.FirstName = request.FirstName;
        lecture.LastName = request.LastName;
        lecture.Specialization = request.Specialization;
        lecture.FacultyCode = request.FacultyCode;

        try
        {
            dbContext.Lecturers.Update(lecture);
            await dbContext.SaveChangesAsync(cancellationToken);
            return request.LecturerCode;
        }
        catch (UniqueConstraintException ex)
        {
            if (ex.Message.Contains("lecturer_code"))
            {
                throw new DuplicateException($"Mã giảng viên đã tồn tại");
            }

            if (ex.Message.Contains("lecturer_name"))
            {
                throw new DuplicateException($"Tên giảng viên đã tồn tại");
            }

            logger.LogError(ex, "Lỗi khi cập nhật giảng viên {LecturerCode}", request.LecturerCode);
            throw new BadInputException("Không thể cập nhật giảng viên");
        }
    }
}