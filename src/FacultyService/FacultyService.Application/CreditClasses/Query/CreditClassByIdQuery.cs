using System;
using FacultyService.Application.CreditClasses.Response;
using MediatR;

namespace FacultyService.Application.CreditClasses.Query;

public record CreditClassByIdQuery(int Id) : IRequest<CreditClassDetailResponse?>;