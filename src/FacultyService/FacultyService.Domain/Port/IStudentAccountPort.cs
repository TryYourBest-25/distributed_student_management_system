using FacultyService.Domain.Entity;
using FluentResults;
using Shared.Domain.ValueObject;

namespace FacultyService.Domain.Port;

public interface IStudentAccountPort
{
    ValueTask<Result<Student>> CreateOrUpdateAccountAsync(Student student,
        CancellationToken cancellationToken = default);

    ValueTask<Result<int>> DeleteAccountAsync(StudentCode studentCode, CancellationToken cancellationToken = default);
}