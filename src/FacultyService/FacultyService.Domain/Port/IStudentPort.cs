using FacultyService.Domain.Entity;
using FluentResults;
using Shared.Domain.ValueObject;

namespace FacultyService.Domain.Port;

public interface IStudentPort
{
    ValueTask<Result<StudentCode>> CreateStudentAsync(Student student,
        CancellationToken cancellationToken = default);

    ValueTask<Result<int>> DeleteStudentAsync(StudentCode studentCode, FacultyCode facultyCode,
        CancellationToken cancellationToken = default);

    ValueTask<Result<Student>> GetStudentAsync(StudentCode studentCode, FacultyCode facultyCode,
        CancellationToken cancellationToken = default);
}