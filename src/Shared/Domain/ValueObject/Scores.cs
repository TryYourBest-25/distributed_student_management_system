namespace Shared.Domain.ValueObject;

public record Scores(
    float? AttendanceScore,
    float? MidtermScore,
    float? FinalScore)
{
    public float? AvgScore
    {
        get
        {
            if (!AttendanceScore.HasValue || !MidtermScore.HasValue || !FinalScore.HasValue)
                return null;

            const float attendanceWeight = 0.1f;
            const float midtermWeight = 0.3f;
            const float finalWeight = 0.6f;

            return (AttendanceScore.Value * attendanceWeight +
                    MidtermScore.Value * midtermWeight +
                    FinalScore.Value * finalWeight);
        }
    }
}