using Shared.Domain.ValueObject;

namespace TuitionService.Domain.ValueObject;

public record class TuitionAgId
{
    public StudentCode StudentCode { get; init; }
    public AcademicYearCode AcademicYear { get; init; }
    public Semester Semester { get; init; }

    public TuitionAgId(StudentCode studentCode, AcademicYearCode academicYear, Semester semester)
    {
        StudentCode = studentCode;
        AcademicYear = academicYear;
        Semester = semester;
    }
}