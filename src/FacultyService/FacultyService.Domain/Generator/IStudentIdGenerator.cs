using System.Collections.Immutable;
using FacultyService.Domain.ValueObject;
using Shared.Domain.ValueObject;

namespace FacultyService.Domain.Generator;

public interface IStudentIdGenerator
{
    StudentCode Generate(ClassCode classCode);

    IImmutableList<StudentCode> Generate(ClassCode classCode, int count);
}