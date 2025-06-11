using FacultyService.Application.Registrations.Command;
using FluentResults;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Shared.Domain.ValueObject;
using Shared.Exception;

namespace FacultyService.Application.Registrations.CommandHandler;

public class UpdateScoreCommandHandler(FacultyDbContext dbContext, ILogger<UpdateScoreCommandHandler> logger)
    : IRequestHandler<UpdateScoreCommand, StudentCode>
{
    public async Task<StudentCode> Handle(UpdateScoreCommand request, CancellationToken cancellationToken)
    {
        var registration = await dbContext.Registrations
                               .Where(r => r.CreditClassId == request.CreditClassId &&
                                           r.StudentCode == request.StudentCode.Value)
                               .FirstOrDefaultAsync(cancellationToken) ??
                           throw new ResourceNotFoundException(
                               $"Không tìm thấy đăng ký tín chỉ cho sinh viên {request.StudentCode}");

        if (registration.IsCancelled)
            throw new BusinessException(
                $"Sinh viên {request.StudentCode} đã hủy đăng ký tín chỉ, không thể cập nhật điểm");

        if (registration.CreditClass.IsCancelled)
            throw new BusinessException($"Lớp tín chỉ {request.CreditClassId} đã bị hủy, không thể cập nhật điểm");

        registration.AttendanceScore = request.Scores.AttendanceScore;
        registration.MidtermScore = request.Scores.MidtermScore;
        registration.FinalScore = request.Scores.FinalScore;

        dbContext.Registrations.Update(registration);
        try
        {
            await dbContext.SaveChangesAsync(cancellationToken);
            return registration.StudentCode;
        }
        catch (Exception e)
        {
            logger.LogError(e, "Lỗi khi cập nhật điểm cho sinh viên {StudentCode}", request.StudentCode);
            throw;
        }
    }
}