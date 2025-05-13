using Shared.Exception;

namespace AcademicService.Domain.ValueObject;

public record FirstName
{
    public string Value { get; }

    public FirstName(string value)
    {
        ArgumentNullException.ThrowIfNull(value);
        if (string.IsNullOrWhiteSpace(value))
            throw new BadInputException("Tên không được để trống");
        if (value.Length > 10)
            throw new BadInputException("Tên không được dài quá 50 ký tự");

        Value = value.Trim().ToUpper();
    }

    public static implicit operator string(FirstName firstName) => firstName.Value;
    public static implicit operator FirstName(string value) => new(value);

    public override string ToString() => Value;
}