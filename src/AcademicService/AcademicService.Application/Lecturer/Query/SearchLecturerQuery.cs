using AcademicService.Application.Lecturer.Response;
using Gridify;
using MediatR;

namespace AcademicService.Application.Lecturer.Query;

public record SearchLecturerQuery(GridifyQuery GridifyQuery) : IRequest<Paging<LecturerResponse>>; 