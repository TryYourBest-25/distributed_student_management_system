using Arch.EntityFrameworkCore.UnitOfWork;
using FacultyService.Domain.Aggregate;
using FacultyService.Domain.ValueObject;
using FluentResults;
using Shared.Domain.ValueObject;

namespace FacultyService.Domain.Repository;

public interface IStudentAgRepository
{
    Task<Result<StudentAg>> CreateStudentAsync(StudentAg studentAg);
    
    Task<Result<int>> DeleteStudentAsync(StudentId studentId);
}