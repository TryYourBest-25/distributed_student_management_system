using FacultyService.Application.Class.Response;
using Arch.EntityFrameworkCore.UnitOfWork.Collections;
using MediatR;
using Shared.Api;

namespace FacultyService.Application.Class.Query;

public record DefaultClassQuery(string? OrderBy, bool Desc = false, int Page = 0, int Size = 10) : OrderableParamRequest(OrderBy, Desc, Page, Size), IRequest<IPagedList<ClassResponse>>; 