using System.Text.RegularExpressions;
using Shared.Exception;

namespace FacultyService.Domain.ValueObject;

public partial record ClassCode
{
    public static readonly Regex ClassCodeRegex = MyRegex();
    
    public string Value { get; }
    
    public ClassCode(string value)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            throw new BadInputException($"Mã lớp không được để trống.");
        }

        if (!ClassCodeRegex.IsMatch(value))
        {
            throw new BadInputException($"Mã lớp không hợp lệ. Mã lớp phải có định dạng DxxCQxxdd-B hoặc DxxCQxxdd, trong đó x là chữ cái và d là chữ số.");
        }

        Value = value;
    }
    
    [GeneratedRegex(@"^D\d{2}CQ[A-Z]{2}\d{2}$", 
        options:RegexOptions.IgnoreCase | RegexOptions.CultureInvariant | RegexOptions.Compiled)]
    private static partial Regex MyRegex();
    
    /// <summary>
    /// This property is used to get academic year from class code
    /// Example: D23CQ01xxx => 23
    /// </summary>
    /// <param name="classCode"></param>
    /// <returns></returns>
    public string AcademicYear => Value.Substring(1, 2);
    
    /// <summary>
    /// This property is used to get major code from class code
    /// Example: D23CQCNxxx => CN
    /// </summary>
    /// <param name="classCode"></param>
    /// <returns></returns>
    public string MajorCode => Value.Substring(5, 2);
    
    /// <summary>
    /// This property is used to get class number from class code
    /// Example: D23CQCN01 => 01
    /// </summary>
    public int ClassNumber => int.Parse(Value.Substring(7, 2));
    
    public static implicit operator string(ClassCode classCode) => classCode.Value;
    
    public static implicit operator ClassCode(string classCode)
    {
        return new ClassCode(classCode);
    }

    public override string ToString() => Value;
}