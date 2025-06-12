using FacultyService.Application.Students.Notification;
using FacultyService.Domain.Entity;
using FacultyService.Domain.Port;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace FacultyService.Application.Students.NotificationHandler
{
    public class UpdateStudentEventHandler(IStudentAccountPort studentPort, FacultyDbContext facultyDbContext)
        : INotificationHandler<UpdateStudentEvent>
    {
        public async Task Handle(UpdateStudentEvent notification, CancellationToken cancellationToken)
        {
            if (notification.NewStudentCode is not null)
            {
                await studentPort.DeleteAccountAsync(notification.OldStudentCode, cancellationToken);
                var newStudent = await facultyDbContext.Students
                    .Where(s => s.StudentCode == notification.NewStudentCode.Value)
                    .FirstOrDefaultAsync(cancellationToken);
                if (newStudent is not null)
                {
                    await studentPort.CreateOrUpdateAccountAsync(newStudent, cancellationToken);
                }

                return;
            }

            var student = await facultyDbContext.Students
                .Where(s => s.StudentCode == notification.OldStudentCode.Value)
                .FirstOrDefaultAsync(cancellationToken: cancellationToken);

            if (student is not null) await studentPort.CreateOrUpdateAccountAsync(student, cancellationToken);

            return;
        }
    }
}