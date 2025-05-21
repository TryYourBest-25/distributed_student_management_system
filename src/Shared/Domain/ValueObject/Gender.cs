using Shared.Domain.ValueObject;

namespace Shared.Domain.ValueObject;

public enum Gender : ushort
{
    Male = 0,
    Female = 1
}

public static class GenderExtensions
{
    public static string ToString(this Gender gender)
    {
        return gender switch
        {
            Gender.Male => "Male",
            Gender.Female => "Female",
            _ => throw new InvalidOperationException("Invalid gender value")
        };
    }

    public static bool ToBoolean(this Gender gender)
    {
        return gender switch
        {
            Gender.Male => true,
            Gender.Female => false,
            _ => throw new InvalidOperationException("Invalid gender value")
        };
    }

    public static Gender FromString(string gender)
    {
        ArgumentNullException.ThrowIfNull(gender);
        return gender.Contains("Female", StringComparison.OrdinalIgnoreCase) ? Gender.Female : Gender.Male;
    }

    public static Gender FromBoolean(bool gender)
    {
        return gender ? Gender.Female : Gender.Male;
    }
}