namespace FacultyService.Api.CreditClasses.Request;

public class UpdateCreditClassRequest : CreditClassBasicRequest
{
    public bool IsCancelled { get; set; }
}