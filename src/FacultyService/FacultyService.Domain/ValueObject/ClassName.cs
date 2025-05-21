using Shared.Exception;

namespace FacultyService.Domain.ValueObject;

public record ClassName
{
    public string Value { get; } 
    public ClassName(string value)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            throw new BadInputException($"Tên lớp không được để trống.");
        }

        if (value.Length > 50)
        {
            throw new BadInputException($"Tên lớp không được vượt quá 50 ký tự.");
        }

        Value = value.Trim().ToUpper();
    }
    
    public static implicit operator string(ClassName className) => className.Value;
    
    public static implicit operator ClassName(string className)
    {
        return new ClassName(className);
    }
}