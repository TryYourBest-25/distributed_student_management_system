namespace FacultyService.Domain.StudentExporter;

public interface IReadWriteFile<T> : IWritingToFile<T>, IReadingFromFile<T>
    where T : class
{
}