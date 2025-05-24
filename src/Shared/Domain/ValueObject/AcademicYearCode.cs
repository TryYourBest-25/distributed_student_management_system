using Shared.Exception;

namespace Shared.Domain.ValueObject;

public record AcademicYearCode
{
    public AcademicYearCode(string startYear)
    {
        if (string.IsNullOrWhiteSpace(startYear))
        {
            throw new BadInputException($"Năm bắt đầu không được để trống.");
        }

        if (DateOnly.TryParseExact(startYear, "yyyy", out var startYearDate))
        {
            StartYearValue = startYearDate.ToString("yyyy");
            EndYearValue = (startYearDate.AddYears(1)).ToString("yyyy");
        }
        else
        {
            throw new BadInputException($"Năm bắt đầu không hợp lệ. Năm bắt đầu phải có định dạng yyyy.");
        }
    }

    public AcademicYearCode(string startYear, string endYear)
    {
        if (string.IsNullOrWhiteSpace(startYear))
        {
            throw new BadInputException($"Năm bắt đầu không được để trống.");
        }

        if (string.IsNullOrWhiteSpace(endYear))
        {
            throw new BadInputException($"Năm kết thúc không được để trống.");
        }

        if (DateOnly.TryParseExact(startYear, "yyyy", out var startYearDate) &&
            DateOnly.TryParseExact(endYear, "yyyy", out var endYearDate))
        {
            StartYearValue = startYearDate.ToString("yyyy");
            EndYearValue = endYearDate.ToString("yyyy");
            if (startYearDate >= endYearDate)
            {
                throw new BadInputException($"Năm bắt đầu phải nhỏ hơn năm kết thúc.");
            }
        }
        else
        {
            throw new BadInputException(
                $"Năm bắt đầu hoặc năm kết thúc không hợp lệ. Năm bắt đầu và năm kết thúc phải có định dạng yyyy.");
        }
    }

    public string StartYearValue { get; }

    public string EndYearValue { get; }

    public string Value => $"{StartYearValue}-{EndYearValue}";

    public string ShortValue => $"{StartYearValue[2..]}-{EndYearValue[2..]}";

    public DateOnly StartYear => DateOnly.Parse(StartYearValue);

    public DateOnly EndYear => DateOnly.Parse(EndYearValue);

    public static implicit operator string(AcademicYearCode academicYearCode) => academicYearCode.Value;

    public static implicit operator AcademicYearCode((string startYear, string endYear) academicYearCode)
    {
        return new AcademicYearCode(academicYearCode.startYear, academicYearCode.endYear);
    }

    public static implicit operator AcademicYearCode(string academicYearCode)
    {
        if (academicYearCode.Contains('-'))
        {
            var years = academicYearCode.Split("-");
            return new AcademicYearCode(years[0], years[1]);
        }
        else
        {
            return new AcademicYearCode(academicYearCode);
        }
    }
}