using System.Collections.Immutable;

namespace FacultyService.Domain.StudentExporter;

public class ReadRecordResult<T>
{
    public required int TotalRecord { get; set; }
    
    public required IImmutableList<T> Records { get; set; }
}