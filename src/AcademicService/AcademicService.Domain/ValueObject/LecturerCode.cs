using Shared.Exception;

namespace AcademicService.Domain.ValueObject;

public record LecturerCode
{
    public string Value { get; }

    public LecturerCode(string value)
    {
        ArgumentNullException.ThrowIfNull(value);
        if (string.IsNullOrWhiteSpace(value))
            throw new BadInputException("Mã giảng viên không được để trống");
        if (value.Length > 10)
            throw new BadInputException("Mã giảng viên không được dài quá 10 ký tự");

        Value = value.Trim().ToUpper();
    }

    public static implicit operator string(LecturerCode lecturerCode) => lecturerCode.Value;
    public static implicit operator LecturerCode(string value) => new(value);

    public override string ToString() => Value;
}