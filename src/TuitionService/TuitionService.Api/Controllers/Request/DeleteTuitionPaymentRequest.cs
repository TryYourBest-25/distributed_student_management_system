namespace TuitionService.Api.Controllers.Request;

public record class DeleteTuitionPaymentRequest
{
    public string AcademicYear { get; set; } = null!;
    public int Semester { get; set; } = 0;
    public string PaymentDate { get; set; } = null!;
}