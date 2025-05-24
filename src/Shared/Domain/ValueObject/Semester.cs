using Shared.Exception;

namespace Shared.Domain.ValueObject;

public record Semester
{
    public int Value { get; }

    public Semester(int value)
    {
        if (value is < 1 or > 4)
            throw new BadInputException($"Học kỳ phải là số nguyên từ 1 đến 4, nhưng nhận được {value}");

        Value = value;
    }

    public static implicit operator int(Semester semester) => semester.Value;

    public static implicit operator Semester(int semester)
    {
        return new Semester(semester);
    }


    public static implicit operator Semester(string semester)
    {
        return new Semester(int.Parse(semester));
    }
}