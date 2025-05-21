using FacultyService.Domain.ValueObject;
using Shared.Domain.Model;
using Shared.Domain.ValueObject;

namespace FacultyService.Domain.Aggregate;

public class RegistrationAg : AggregateRootBase<RegistrationId>
{
    public RegistrationAg(RegistrationId id)
        : base(id)
    {
    }

    public Scores Scores { get; set; }

    public bool? IsCancelled { get; set; }
    
    
}