using FacultyService.Domain.ValueObject;
using Shared.Domain.ValueObject;

namespace FacultyService.Application.CreditClasses.IoDto;

public record ExportStudentScoreInCreditClassIoRecord
{
    public FacultyName FacultyName { get; init; }

    public int CreditClassId { get; init; }

    public AcademicYearCode AcademicYearCode { get; init; }

    public Semester Semester { get; init; }

    public CourseName CourseName { get; init; }

    public GroupNumber GroupNumber { get; init; }

    public IList<StudentScoreInCreditClassIoRecord> Students { get; init; }
}

public record StudentScoreInCreditClassIoRecord
{
    public StudentCode StudentCode { get; init; }


    public LastName LastName { get; init; }

    public FirstName FirstName { get; init; }

    public Scores Scores { get; init; }
}