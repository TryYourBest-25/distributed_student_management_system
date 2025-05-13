using Shared.Exception;

namespace AcademicService.Domain.ValueObject;

public record FacultyCode
{
    public string Value { get; }

    public FacultyCode(string value)
    {
        ArgumentNullException.ThrowIfNull(value);
        if (string.IsNullOrWhiteSpace(value))
            throw new BadInputException("Mã khoa không được để trống");
        if (value.Length > 10)
            throw new BadInputException("Mã khoa không được dài quá 10 ký tự");

        Value = value.Trim().ToUpper();
    }

    public static implicit operator string(FacultyCode facultyCode) => facultyCode.Value;
    public static implicit operator FacultyCode(string value) => new(value);

    public override string ToString() => Value;
}