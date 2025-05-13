using AcademicService.Domain.ValueObject;
using FluentResults;
using MediatR;

namespace AcademicService.Application.Lecturer.Command;

public record CreateLectureCommand : IRequest<Result<LecturerCode>>
{
    public LecturerCode LecturerCode { set; get; } = null!;
    public FirstName FirstName { set; get; } = null!;
    public LastName LastName { set; get; } = null!;
    public string? Degree { get; set; }
    public string? AcademicRank { get; set; }
    public string? Specialization { get; set; }
    public FacultyCode FacultyCode { get; set; } = null!;

}