using AcademicService.Application.DbContext;
using AcademicService.Application.Lecturers.Command;
using EntityFramework.Exceptions.Common;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Shared.Domain.ValueObject;
using Shared.Exception;
using Microsoft.Extensions.Logging;

namespace AcademicService.Application.Lecturers.CommandHandler;

public class UpdateLectureCommandHandler(AcademicDbContext dbContext, ILogger<UpdateLectureCommandHandler> logger)
    : IRequestHandler<UpdateLectureCommand, LecturerCode>
{
    public async Task<LecturerCode> Handle(UpdateLectureCommand request, CancellationToken cancellationToken)
    {
        logger.LogInformation("Updating lecturer {LecturerCode} with name {FirstName} {LastName}", request.LecturerCode,
            request.FirstName, request.LastName);
        try
        {
            var result = await dbContext.Lecturers.Where(l => l.LecturerCode == request.OldLecturerCode.Value)
                .ExecuteUpdateAsync(l => l.SetProperty(l => l.LecturerCode, request.LecturerCode.Value)
                    .SetProperty(l => l.FirstName, request.FirstName.Value)
                    .SetProperty(l => l.LastName, request.LastName.Value)
                    .SetProperty(l => l.Degree, request.Degree)
                    .SetProperty(l => l.AcademicRank, request.AcademicRank)
                    .SetProperty(l => l.Specialization, request.Specialization)
                    .SetProperty(l => l.FacultyCode, request.FacultyCode.Value), cancellationToken);

            return result > 0
                ? request.LecturerCode
                : throw new ResourceNotFoundException($"Giảng viên với mã {request.LecturerCode} không tồn tại");
        }
        catch (UniqueConstraintException ex)
        {
            if (ex.InnerException?.Message.Contains("pk") ?? false)
            {
                throw new DuplicateException($"Mã giảng viên {request.LecturerCode} đã tồn tại");
            }

            if (ex.InnerException?.Message.Contains("uq") ?? false)
            {
                throw new DuplicateException($"Tên giảng viên {request.FirstName} {request.LastName} đã tồn tại");
            }

            logger.LogError(ex, "Lỗi khi cập nhật giảng viên {LecturerCode}", request.LecturerCode);
            throw;
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Lỗi khi cập nhật giảng viên {LecturerCode}", request.LecturerCode);
            throw;
        }
    }
}