using FluentResults;
using MediatR;
using Shared.Domain.ValueObject;

namespace AcademicService.Application.Lecturer.Command;

public record UpdateLectureCommand : IRequest<Result<LecturerCode>>
{
    public LecturerCode LecturerCode { get; set; } = null!;
    
    public LecturerCode OldLecturerCode { get; set; } = null!;
    public FirstName FirstName { get; set; } = null!;
    public LastName LastName { get; set; } = null!;
    public string? Degree { get; set; }
    public string? AcademicRank { get; set; }
    public string? Specialization { get; set; }
    public FacultyCode FacultyCode { get; set; } = null!;
    
}