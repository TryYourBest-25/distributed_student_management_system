using System.Collections.Immutable;
using FacultyService.Domain.ValueObject;
using Shared.Domain.ValueObject;

namespace FacultyService.Application.CreditClasses.IoDto;

public record ExportStudentInCreditClassIoRecord
{
    public int Id { get; init; }

    public FacultyName FacultyName { get; init; }

    public AcademicYearCode AcademicYearCode { get; init; }

    public Semester Semester { get; init; }

    public CourseName CourseName { get; init; }

    public GroupNumber GroupNumber { get; init; }

    public int TotalStudent { get; init; }

    public IList<StudentInCreditClassIoRecord> Students { get; init; }
}

public record StudentInCreditClassIoRecord
{
    public StudentCode StudentCode { get; init; }


    public LastName LastName { get; init; }

    public FirstName FirstName { get; init; }

    public ClassCode ClassCode { get; init; }

    public Gender Gender { get; init; }
}