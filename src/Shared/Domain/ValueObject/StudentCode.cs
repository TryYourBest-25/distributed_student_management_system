using System.Text.RegularExpressions;
using Shared.Exception;

namespace Shared.Domain.ValueObject;

public partial record StudentCode
{
    public static readonly Regex StudentCodeRegex = MyRegex();
    public string Value { get; }

    public StudentCode(string value)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            throw new BadInputException($"Mã sinh viên không được để trống.");
        }

        if (!StudentCodeRegex.IsMatch(value))
        {
            throw new BadInputException(
                $"Mã sinh viên không hợp lệ. Mã sinh viên phải có định dạng NxxDCxxddd, trong đó x là chữ cái và d là chữ số.");
        }

        Value = value;
    }

    [GeneratedRegex(@"^N\d{2}DC[A-Z]{2}\d{3}$",
        options: RegexOptions.IgnoreCase | RegexOptions.CultureInvariant | RegexOptions.Compiled)]
    private static partial Regex MyRegex();

    /// <summary>
    /// This property is used to get academic year from student code
    /// Example: N23DC01xxx => 23
    /// </summary>
    public string AcademicYear => Value.Substring(1, 2);


    /// <summary>
    /// This property is used to get major code from student code
    /// Example: N23DCCNxxx => CN
    /// </summary>
    public string ClassCode => Value.Substring(5, 2);

    /// <summary>
    /// This property is used to get student number from student code
    /// Example: N23DC01xxx => 001
    /// </summary>
    /// <param name="studentCode"></param>
    /// <returns></returns>
    public int StudentNumber => int.Parse(Value.Substring(7, 3));

    public StudentCode Increment()
    {
        var studentNumber = StudentNumber + 1;
        if (studentNumber > 999)
        {
            throw new BadInputException($"Mã sinh viên không hợp lệ. Mã sinh viên không được lớn hơn 999.");
        }

        return new StudentCode($"N{AcademicYear}DC{ClassCode}{studentNumber:D3}");
    }

    public static StudentCode Of(ClassCode code, int studentNumber) =>
        new StudentCode($"N{code.AcademicYear}DC{code.MajorCode}{studentNumber:D3}");

    public static StudentCode Of(string code, int studentNumber) => new StudentCode($"N{code}DC{studentNumber:D3}");


    public static implicit operator string(StudentCode studentCode) => studentCode.Value;

    public static implicit operator StudentCode(string studentCode)
    {
        return new StudentCode(studentCode);
    }

    public override string ToString() => Value;
}