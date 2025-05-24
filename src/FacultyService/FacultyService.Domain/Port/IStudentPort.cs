using FacultyService.Domain.Entity;
using FluentResults;
using Shared.Domain.ValueObject;

namespace FacultyService.Domain.Port;

public interface IStudentPort
{
    Task<Result<Student>> CreateStudentAsync(Student student);

    Task<Result<int>> DeleteStudentAsync(StudentCode studentCode, FacultyCode facultyCode);
}