using FacultyService.Application.Registration.Command;
using FacultyService.Domain.ValueObject;
using FluentResults;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Shared.Exception;

namespace FacultyService.Application.Registration.CommandHandler;

public class LecturerUpdateScoreCommandHandler(FacultyDbContext dbContext, ILogger logger)
    : IRequestHandler<LecturerUpdateScoreCommand, Result<StudentCode>>
{
    public async Task<Result<StudentCode>> Handle(LecturerUpdateScoreCommand request, CancellationToken cancellationToken)
    {
        var registration = await dbContext.Registrations
            .Include(r => r.CreditClass)
            .Where(r => r.CreditClassId == request.CreditClassId && r.StudentCode == request.StudentCode.Value)
            .FirstOrDefaultAsync(cancellationToken) ?? throw new ResourceNotFoundException($"Không tìm thấy đăng ký tín chỉ cho sinh viên {request.StudentCode}");
        
        if(registration.IsCancelled) 
            throw new BusinessException($"Sinh viên {request.StudentCode} đã hủy đăng ký tín chỉ, không thể cập nhật điểm");
        
        if(registration.CreditClass.IsCancelled) 
            throw new BusinessException($"Lớp tín chỉ {request.CreditClassId} đã bị hủy, không thể cập nhật điểm");
        
        registration.AttendanceScore = request.Scores.AttendanceScore;
        registration.MidtermScore = request.Scores.MidtermScore;
        registration.FinalScore = request.Scores.FinalScore;
        
        dbContext.Registrations.Update(registration);
        try
        {
            await dbContext.SaveChangesAsync(cancellationToken);
            return Result.Ok((StudentCode)registration.StudentCode);
        }
        catch (DbUpdateConcurrencyException e)
        {
            logger.LogError(e, "Lỗi khi cập nhật điểm cho sinh viên {StudentCode}", request.StudentCode);
            throw;
        }
    }
}