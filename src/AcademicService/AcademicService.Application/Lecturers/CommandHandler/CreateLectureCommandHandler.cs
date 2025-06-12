using AcademicService.Application.DbContext;
using AcademicService.Application.Lecturers.Command;
using EntityFramework.Exceptions.Common;
using MediatR;
using Shared.Exception;
using Shared.Domain.ValueObject;
using Shared.Infra.Entity;
using Microsoft.Extensions.Logging;

namespace AcademicService.Application.Lecturers.CommandHandler;

public class CreateLectureCommandHandler(AcademicDbContext dbContext, ILogger<CreateLectureCommandHandler> logger)
    : IRequestHandler<CreateLectureCommand, LecturerCode>
{
    public async Task<LecturerCode> Handle(CreateLectureCommand request, CancellationToken cancellationToken)
    {
        logger.LogInformation("Creating lecturer {LecturerCode} with name {FirstName} {LastName}", request.LecturerCode,
            request.FirstName, request.LastName);

        var lecture = new Lecturer
        {
            LecturerCode = request.LecturerCode,
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
            if (ex.InnerException?.Message.Contains("pk") ?? false)
            {
                throw new DuplicateException($"Mã giảng viên {lecture.LecturerCode} đã tồn tại");
            }

            if (ex.InnerException?.Message.Contains("uq") ?? false)
            {
                throw new DuplicateException($"Tên giảng viên {lecture.FirstName} {lecture.LastName} đã tồn tại");
            }

            logger.LogError(ex, "Lỗi khi tạo giảng viên {LecturerCode}", request.LecturerCode);
            throw new BadInputException("Không thể tạo giảng viên");
        }
    }
}