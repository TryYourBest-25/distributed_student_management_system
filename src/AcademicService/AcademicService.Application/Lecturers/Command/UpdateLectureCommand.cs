using MediatR;
using Shared.Domain.ValueObject;

namespace AcademicService.Application.Lecturers.Command;

public record UpdateLectureCommand(
    LecturerCode OldLecturerCode,
    LecturerCode LecturerCode,
    FirstName FirstName,
    LastName LastName,
    string? Degree,
    string? AcademicRank,
    string? Specialization,
    FacultyCode FacultyCode) : IRequest<LecturerCode>;