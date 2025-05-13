using System.ComponentModel.DataAnnotations.Schema;
using System.Diagnostics.CodeAnalysis;
using System.Text;
using Shared.Exception;

namespace AcademicService.Domain.ValueObject;
public record CourseCode
{

    public string Value { get; }
    
    public CourseCode(string value)
    {
        ArgumentNullException.ThrowIfNull(value);
        if (string.IsNullOrWhiteSpace(value))
            throw new BadInputException("Mã môn học không được để trống");
        if (value.Length > 10)
            throw new BadInputException("Mã môn học không được dài quá 10 ký tự");

        Value = value.Trim().ToUpper();
    }
    
    public static implicit operator string(CourseCode courseCode) => courseCode.Value;
    public static implicit operator CourseCode(string value) => new(value);
    
    public override string ToString() => Value;
    
}