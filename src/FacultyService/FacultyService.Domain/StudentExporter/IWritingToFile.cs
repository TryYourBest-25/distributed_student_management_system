namespace FacultyService.Domain.StudentExporter;

public interface IWritingToFile<T> where T : class
{
    Task<long> WriteToFile(string filePath, IList<T> data);
}