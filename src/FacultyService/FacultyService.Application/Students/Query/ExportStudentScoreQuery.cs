using MediatR;
using Shared.Domain.ValueObject;

namespace FacultyService.Application.Students.Query;

public record ExportStudentScoreQuery(StudentCode StudentCode) : IRequest<Stream>
{
}