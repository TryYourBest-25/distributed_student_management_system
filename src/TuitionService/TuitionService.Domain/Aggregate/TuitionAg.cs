using System;
using Shared.Domain.Model;
using TuitionService.Domain.ValueObject;

namespace TuitionService.Domain.Aggregate;

public class TuitionAg : AggregateRootBase<TuitionAgId>
{
    public TuitionAg(TuitionAgId id) : base(id)
    {
    }
}