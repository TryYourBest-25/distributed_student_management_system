using System;
using Shared.Domain.Model;
using TuitionService.Domain.ValueObject;

namespace TuitionService.Domain.Aggregate;

public class TuitionPaymentAg : AggregateRootBase<TuitionPaymentId>
{
    public TuitionPaymentAg(TuitionPaymentId id) : base(id)
    {
    }
}