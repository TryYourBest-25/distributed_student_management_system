using Shared.Exception;

namespace Shared.Domain.ValueObject;

public record CourseName
{
    public string Value { get; }

    public CourseName(string value)
    {
        ArgumentNullException.ThrowIfNull(value);
        if (string.IsNullOrWhiteSpace(value))
            throw new BadInputException("Tên môn học không được để trống");
        if (value.Length > 50)
            throw new BadInputException("Tên môn học không được dài quá 50 ký tự");

        Value = value.Trim();
    }

    public static implicit operator string(CourseName courseName) => courseName.Value;
    public static implicit operator CourseName(string value) => new(value);

    public override string ToString() => Value;
}