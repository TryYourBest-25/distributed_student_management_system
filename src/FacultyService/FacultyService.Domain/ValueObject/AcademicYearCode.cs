using Shared.Exception;

namespace FacultyService.Domain.ValueObject;

public record AcademicYearCode
{
    public AcademicYearCode(string startYear)
    {
        if (string.IsNullOrWhiteSpace(startYear))
        {
            throw new BadInputException($"Năm bắt đầu không được để trống.");
        }

        if(DateOnly.TryParseExact(startYear, "yyyy", out var startYearDate))
        {
            StartYearValue = startYearDate.ToString("yyyy");
            EndYearValue = (startYearDate.AddYears(1)).ToString("yyyy");
        }
        else
        {
            throw new BadInputException($"Năm bắt đầu không hợp lệ. Năm bắt đầu phải có định dạng yyyy.");
        }
        
    }

    public string StartYearValue { get; }

    public string EndYearValue { get; }

    public string Value => $"{StartYearValue}-{EndYearValue}";
    
    public string ShortValue => $"{StartYearValue[2..]}-{EndYearValue[2..]}";
    
    public DateOnly StartYear => DateOnly.Parse(StartYearValue);
    
    public DateOnly EndYear => DateOnly.Parse(EndYearValue);
    
    public static implicit operator string(AcademicYearCode academicYearCode) => academicYearCode.Value;
    
    public static implicit operator AcademicYearCode(string academicYearCode)
    {
        return new AcademicYearCode(academicYearCode);
    }
}