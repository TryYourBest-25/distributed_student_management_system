using FacultyService.Domain.ValueObject;
using Shared.Domain.ValueObject;

namespace FacultyService.Application.CreditClasses.IoDto;

public record ExportCreditClassIoRecord
{
    public FacultyName FacultyName { get; init; }

    public AcademicYearCode AcademicYearCode { get; init; }

    public Semester Semester { get; init; }

    public IList<CreditClassIoRecord> CreditClasses { get; init; }
}

public record CreditClassIoRecord
{
    public CourseName CourseName { get; init; }
    public GroupNumber GroupNumber { get; init; }
    public LastName LastNameLecturer { get; init; }
    public FirstName FirstNameLecturer { get; init; }
    public ushort MinStudent { get; init; }
    public int TotalStudent { get; init; }
}