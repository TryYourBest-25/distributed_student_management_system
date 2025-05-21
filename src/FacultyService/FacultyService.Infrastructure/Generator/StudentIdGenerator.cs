using System.Collections.Immutable;
using FacultyService.Application;
using FacultyService.Domain.Generator;
using FacultyService.Domain.ValueObject;


namespace FacultyItService.Infrastructure.Generator;

public class StudentIdGenerator(FacultyDbContext facultyDbContext) : IStudentIdGenerator
{
    public StudentId Generate(ClassCode classCode)
    {
        var lastStudentCode = facultyDbContext.Students
            .Where(s => s.ClassCode == classCode.Value)
            .OrderByDescending(s => s.StudentCode)
            .Select(s => new StudentCode(s.StudentCode).Increment())
            .FirstOrDefault() ?? StudentCode.Of(classCode.AcademicYear, 1);
        
        return new StudentId(lastStudentCode, facultyDbContext.TenantInfo.Id);
    }

    public IImmutableList<StudentId> Generate(ClassCode classCode, int count)
    {
        var studentIds = new List<StudentId>(count);
        var lastStudentCode = facultyDbContext.Students
            .Where(s => s.ClassCode == classCode.Value)
            .OrderByDescending(s => s.StudentCode)
            .Select(s => new StudentCode(s.StudentCode).Increment())
            .FirstOrDefault() ?? StudentCode.Of(classCode.AcademicYear, 1);

        for (var i = 0; i < count; i++)
        {
            var studentId = new StudentId(lastStudentCode, facultyDbContext.TenantInfo.Id);
            studentIds.Add(studentId);
            lastStudentCode = lastStudentCode.Increment();
        }

        return studentIds.ToImmutableList();
    }
}