namespace AcademicService.Domain.ValueObject;

public record LectureCredit
{
    public uint Value { get; }

    public LectureCredit(uint value)
    {
        
        Value = value;
    }

    public static implicit operator uint(LectureCredit lectureCredit) => lectureCredit.Value;
    public static implicit operator LectureCredit(uint value) => new(value);

    public override string ToString() => Value.ToString();
}