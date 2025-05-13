using AcademicService.Application.Faculty.Response;
using Arch.EntityFrameworkCore.UnitOfWork.Collections;
using MediatR;
using Shared.Api;

namespace AcademicService.Application.Faculty.Query;

public record DefaultFacultyQuery(string? OrderBy, bool Desc = false, int Page = 0, int Size = 10) 
    : OrderableParamRequest(OrderBy, Desc, Page, Size), IRequest<IPagedList<FacultyResponse>>; 