using FacultyService.Application.Students.Notification;
using FacultyService.Domain.Port;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FacultyService.Application.Students.NotificationHandler;

public class CreateStudentEventHandler(FacultyDbContext dbContext, IStudentAccountPort studentPort)
    : INotificationHandler<CreateStudentEvent>
{
    public async Task Handle(CreateStudentEvent notification, CancellationToken cancellationToken)
    {
        var student = await dbContext.Students.FirstOrDefaultAsync(s => s.StudentCode == notification.StudentCode.Value,
            cancellationToken: cancellationToken);
        if (student == null)
        {
            return;
        }

        await studentPort.CreateOrUpdateAccountAsync(student, cancellationToken);
    }
}