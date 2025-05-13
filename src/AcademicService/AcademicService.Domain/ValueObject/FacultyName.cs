using Shared.Exception;

namespace AcademicService.Domain.ValueObject;

public record FacultyName
{
    public string Value { get; }

    public FacultyName(string value)
    {
        ArgumentNullException.ThrowIfNull(value);
        if (string.IsNullOrWhiteSpace(value))
            throw new BadInputException("Tên khoa không được để trống");
        if (value.Length > 50)
            throw new BadInputException("Tên khoa không được dài quá 50 ký tự");

        Value = value.Trim();
    }

    public static implicit operator string(FacultyName facultyName) => facultyName.Value;
    public static implicit operator FacultyName(string value) => new(value);

    public override string ToString() => Value;
}