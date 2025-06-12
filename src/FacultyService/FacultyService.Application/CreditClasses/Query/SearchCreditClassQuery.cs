using System;
using FacultyService.Application.CreditClasses.Response;
using Gridify;
using MediatR;

namespace FacultyService.Application.CreditClasses.Query;

public record SearchCreditClassQuery(GridifyQuery GridifyQuery) : IRequest<Paging<CreditClassBasicResponse>>;