using System.Collections.Immutable;

namespace Shared.FileHelper;

public class ReadRecordResult<T>
{
    public required int TotalRecord { get; set; }

    public required IImmutableList<T> Records { get; set; }
}