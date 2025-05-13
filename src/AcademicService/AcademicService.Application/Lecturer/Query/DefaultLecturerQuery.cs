using AcademicService.Application.Lecturer.Response;
using Arch.EntityFrameworkCore.UnitOfWork.Collections;
using MediatR;
using Shared.Api;

namespace AcademicService.Application.Lecturer.Query;

public record DefaultLecturerQuery(string? OrderBy, bool Desc = false, int Page = 0, int Size = 10) 
    : OrderableParamRequest(OrderBy, Desc, Page, Size), IRequest<IPagedList<LecturerResponse>>; 