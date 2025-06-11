using MediatR;
using Shared.Domain.ValueObject;

namespace FacultyService.Application.Students.Notification
{
    public record DeleteStudentEvent(StudentCode StudentCode) : INotification;
}