namespace Shared.FileHelper;

public interface IReadWriteFile<T> : IWritingToFile<T>, IReadingFromFile<T>
    where T : class
{
}