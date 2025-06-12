using MediatR;
using Shared.Domain.ValueObject;

namespace FacultyService.Application.Students.Notification
{
    public record UpdateStudentEvent(StudentCode OldStudentCode, StudentCode? NewStudentCode) : INotification;
}