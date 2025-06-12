using System;

namespace TuitionService.Api.Controllers.Response;

public record PaymentResponse
{
    public string PaymentDate { get; set; }
    public decimal AmountPaid { get; set; }
}