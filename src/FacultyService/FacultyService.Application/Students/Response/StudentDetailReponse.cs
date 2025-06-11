using System;
using FacultyService.Application.Registrations.Response;
using FacultyService.Application.CreditClasses.Response;

namespace FacultyService.Application.Students.Response;

public record StudentDetailReponse : StudentBasicResponse
{
    public IList<RegistrationBasicResponse> Registrations { get; set; } = new List<RegistrationBasicResponse>();
}