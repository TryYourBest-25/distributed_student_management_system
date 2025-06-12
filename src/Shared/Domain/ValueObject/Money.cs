using Shared.Exception;

namespace Shared.Domain.ValueObject;

public record class Money
{
    public int Value { get; init; }

    public Money(int value)
    {
        if (value < 0)
        {
            throw new BadInputException($"Giá trị tiền không hợp lệ: {value}");
        }

        Value = value;
    }

    public static Money operator +(Money a, Money b)
    {
        return new Money(a.Value + b.Value);
    }

    public static Money operator -(Money a, Money b) => new((a.Value - b.Value) < 0 ? 0 : a.Value - b.Value);

    public static Money operator *(Money a, int b) => new(a.Value * b);

    public static Money operator /(Money a, int b) => new(a.Value / b);

    public static Money operator %(Money a, int b) => new(a.Value % b);

    public override string ToString() => Value.ToString();

    public static implicit operator int(Money money) => money.Value;

    public static implicit operator Money(int value) => new(value);
}