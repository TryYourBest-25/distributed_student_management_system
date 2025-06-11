using System.Collections.Immutable;
using FacultyService.Domain.ValueObject;
using Shared.Domain.ValueObject;

namespace FacultyService.Domain.Generator;

public interface IStudentIdGenerator
{
    ValueTask<StudentCode> Generate(ClassCode classCode);

    IImmutableList<StudentCode> Generate(ClassCode classCode, int count);
}