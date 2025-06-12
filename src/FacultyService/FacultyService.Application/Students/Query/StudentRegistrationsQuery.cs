using Arch.EntityFrameworkCore.UnitOfWork.Collections;
using FacultyService.Application.Registrations.Response;
using Gridify;
using MediatR;
using Shared.Domain.ValueObject;

namespace FacultyService.Application.Students.Query;

public record StudentRegistrationsQuery(StudentCode StudentCode, GridifyQuery GridifyQuery)
    : IRequest<IPagedList<RegistrationBasicResponse>>
{
}