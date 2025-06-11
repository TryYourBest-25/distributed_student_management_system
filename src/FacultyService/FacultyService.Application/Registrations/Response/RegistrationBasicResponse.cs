using FacultyService.Application.CreditClasses.Response;

namespace FacultyService.Application.Registrations.Response;

public record RegistrationBasicResponse : CreditClassBasicResponse
{
    public bool IsCancelled { get; set; }
}