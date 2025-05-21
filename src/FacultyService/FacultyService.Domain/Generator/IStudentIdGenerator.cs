using System.Collections.Immutable;
using FacultyService.Domain.ValueObject;

namespace FacultyService.Domain.Generator;

public interface IStudentIdGenerator
{
    StudentId Generate(ClassCode classCode);
    
    IImmutableList<StudentId> Generate(ClassCode classCode, int count);
}