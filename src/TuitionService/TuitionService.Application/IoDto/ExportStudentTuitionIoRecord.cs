using Shared.Domain.ValueObject;

namespace TuitionService.Application.IoDto;

public record ExportStudentTuitionIoRecord
{
    public ClassCode ClassCode { get; init; }
    public FacultyCode FacultyCode { get; init; }
    public IList<StudentTuitionIoRecord> StudentTuitionIoRecords { get; init; } = new List<StudentTuitionIoRecord>();
}

public record StudentTuitionIoRecord
{
    public LastName LastName { get; set; } = null!;
    public FirstName FirstName { get; set; } = null!;
    public Money TuitionFee { get; set; } = null!;
    public Money StudentFee { get; set; } = null!;
}