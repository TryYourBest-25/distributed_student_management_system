using FacultyService.Application.Student.Response;
using Arch.EntityFrameworkCore.UnitOfWork.Collections;
using MediatR;
using Shared.Api;

namespace FacultyService.Application.Student.Query;

public record DefaultStudentQuery(string? OrderBy, bool Desc = false, int Page = 0, int Size = 10) : OrderableParamRequest(OrderBy, Desc, Page, Size), IRequest<IPagedList<StudentResponse>>; 