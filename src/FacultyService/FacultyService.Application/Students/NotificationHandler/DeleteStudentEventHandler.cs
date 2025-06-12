using FacultyService.Application.Students.Notification;
using FacultyService.Domain.Port;
using MediatR;

namespace FacultyService.Application.Students.NotificationHandler
{
    public class DeleteStudentEventHandler(IStudentAccountPort studentPort) : INotificationHandler<DeleteStudentEvent>
    {
        public async Task Handle(DeleteStudentEvent notification, CancellationToken cancellationToken)
        {
            await studentPort.DeleteAccountAsync(notification.StudentCode, cancellationToken);
        }
    }
}