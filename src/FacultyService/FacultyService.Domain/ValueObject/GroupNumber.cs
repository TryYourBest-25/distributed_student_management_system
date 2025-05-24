using Shared.Exception;

namespace FacultyService.Domain.ValueObject;

public record GroupNumber
{
    public ushort Value { get; }

    public GroupNumber(ushort value)
    {
        if (value is < 1)
            throw new BadInputException($"Nhóm phải là số nguyên lớn hơn 1, nhưng nhận được {value}");

        Value = value;
    }

    public static implicit operator int(GroupNumber groupNumber) => groupNumber.Value;

    public static implicit operator GroupNumber(ushort groupNumber)
    {
        return new GroupNumber(groupNumber);
    }

    public static implicit operator GroupNumber(string groupNumber)
    {
        if (!ushort.TryParse(groupNumber, out var result))
            throw new BadInputException($"Nhóm phải là số nguyên lớn hơn 1, nhưng nhận được {groupNumber}");

        return new GroupNumber(result);
    }

    public static implicit operator GroupNumber(int groupNumber)
    {
        return new GroupNumber((ushort)groupNumber);
    }

    public override string ToString()
    {
        return Value.ToString();
    }
}