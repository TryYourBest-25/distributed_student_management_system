using System;
using FacultyService.Application.Classes.Command;
using MediatR;
using Shared.Domain.ValueObject;
using Microsoft.EntityFrameworkCore;
using Shared.Exception;

namespace FacultyService.Application.Classes.CommandHandler;

public class DeleteClassByIdCommandHandler(FacultyDbContext dbContext)
    : IRequestHandler<DeleteClassByIdCommand, ClassCode>
{
    public async Task<ClassCode> Handle(DeleteClassByIdCommand request, CancellationToken cancellationToken)
    {
        var globalClass =
            await dbContext.GlobalClassCodes.Where(c => c.ClassCode == request.ClassCode)
                .FirstOrDefaultAsync(cancellationToken) ?? throw new ResourceNotFoundException("Class not found");

        dbContext.GlobalClassCodes.Remove(globalClass);
        await dbContext.SaveChangesAsync(cancellationToken);
        return request.ClassCode;
    }
}