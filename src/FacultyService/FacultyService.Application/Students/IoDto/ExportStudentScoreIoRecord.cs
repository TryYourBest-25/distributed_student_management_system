using Shared.Domain.ValueObject;

namespace FacultyService.Application.Students.IoDto;

public record ExportStudentScoreIoRecord
{
    public StudentCode StudentCode { get; init; }

    public ClassCode ClassCode { get; init; }

    public LastName LastName { get; init; }

    public FirstName FirstName { get; init; }

    public FacultyName FacultyName { get; init; }

    public AcademicYearCode AcademicYearCode { get; init; }

    public IList<ExportStudentScoreInCourseIoRecord> ExportStudentScoreInCourseIoRecords { get; init; }
}

public record ExportStudentScoreInCourseIoRecord
{
    public CourseName CourseName { get; init; }
    public float FinalScore { get; init; }
}