namespace FacultyService.Domain.StudentExporter;

public interface IReadWriteFileFactory<T> where T : class
{
    IReadWriteFile<T> Create (FileTypeSupport fileType);
}