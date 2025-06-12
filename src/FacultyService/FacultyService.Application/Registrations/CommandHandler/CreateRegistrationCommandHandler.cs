using EntityFramework.Exceptions.Common;
using FacultyService.Application.Registrations.Command;
using FacultyService.Domain.Entity;
using MediatR;
using Microsoft.Extensions.Logging;
using Shared.Exception;

namespace FacultyService.Application.Registrations.CommandHandler;

public class CreateRegistrationCommandHandler(
    FacultyDbContext dbContext,
    ILogger<CreateRegistrationCommandHandler> logger)
    : IRequestHandler<CreateRegistrationCommand, int>
{
    public async Task<int> Handle(CreateRegistrationCommand request, CancellationToken cancellationToken)
    {
        var registration = new Registration
        {
            CreditClassId = request.CreditClassId,
            StudentCode = request.StudentCode,
            IsCancelled = false,
        };
        try
        {
            await dbContext.Registrations.AddAsync(registration, cancellationToken);
            await dbContext.SaveChangesAsync(cancellationToken);
            return registration.CreditClassId;
        }
        catch (UniqueConstraintException ex)
        {
            if (ex.ConstraintName.Contains("PRIMARY"))
            {
                throw new BadInputException("Đã đăng ký lớp học này");
            }

            throw;
        }
    }
}