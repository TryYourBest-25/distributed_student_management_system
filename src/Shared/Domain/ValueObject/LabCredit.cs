namespace Shared.Domain.ValueObject;

public record LabCredit
{
    public uint Value { get; }

    public LabCredit(uint value)
    {
        Value = value;
    }

    public static implicit operator uint(LabCredit labCredit) => labCredit.Value;
    public static implicit operator LabCredit(uint value) => new(value);

    public override string ToString() => Value.ToString();
}