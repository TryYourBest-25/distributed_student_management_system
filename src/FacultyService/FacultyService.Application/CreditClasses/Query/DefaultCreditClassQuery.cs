using Arch.EntityFrameworkCore.UnitOfWork.Collections;
using FacultyService.Application.CreditClasses.Response;
using Gridify;
using MediatR;

namespace FacultyService.Application.CreditClasses.Query;

public record class DefaultCreditClassQuery(GridifyQuery GridifyQuery) : IRequest<IPagedList<CreditClassBasicResponse>>;