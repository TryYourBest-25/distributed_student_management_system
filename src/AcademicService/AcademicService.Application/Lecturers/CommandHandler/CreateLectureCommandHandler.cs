using AcademicService.Application.DbContext;
using AcademicService.Application.Lecturers.Command;
using EntityFramework.Exceptions.Common;
using MediatR;
using Shared.Exception;
using Shared.Domain.ValueObject;
using Shared.Infra.Entity;
using Microsoft.Extensions.Logging;

namespace AcademicService.Application.Lecturers.CommandHandler;

public class CreateLectureCommandHandler(AcademicDbContext dbContext, ILogger logger)
    : IRequestHandler<CreateLectureCommand, LecturerCode>
{
    public async Task<LecturerCode> Handle(CreateLectureCommand request, CancellationToken cancellationToken)
    {
        var lecture = new Lecturer
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
            await dbContext.Lecturers.AddAsync(lecture, cancellationToken);
            await dbContext.SaveChangesAsync(cancellationToken);
            return request.LecturerCode;
        }
        catch (UniqueConstraintException ex)
        {
            if (ex.Message.Contains("PRIMARY"))
            {
                throw new DuplicateException($"Mã giảng viên {lecture.LecturerCode} đã tồn tại");
            }

            if (ex.Message.Contains("lecturer_name"))
            {
                throw new DuplicateException($"Tên giảng viên {lecture.FirstName} {lecture.LastName} đã tồn tại");
            }

            logger.LogError(ex, "Lỗi khi tạo giảng viên {LecturerCode}", request.LecturerCode);
            throw new BadInputException("Không thể tạo giảng viên");
        }
    }
}