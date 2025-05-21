using Shared.Exception;

namespace Shared.Domain.ValueObject;

public record LastName
{
    public string Value { get; }

    public LastName(string value)
    {
        ArgumentNullException.ThrowIfNull(value);
        if (string.IsNullOrWhiteSpace(value))
            throw new BadInputException("Họ không được để trống");
        if (value.Length > 50)
            throw new BadInputException("Họ không được dài quá 50 ký tự");

        Value = value.Trim();
    }

    public static implicit operator string(LastName lastName) => lastName.Value;
    public static implicit operator LastName(string value) => new(value);

    public override string ToString() => Value;
}