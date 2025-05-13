namespace Shared.Domain.Model;

public abstract class AggregateRootBase<TKey> : EntityBase<TKey>, IAggregateRoot<TKey>
{
    public DateTimeOffset CreatedAt { get; set; }
    public DateTimeOffset UpdatedAt { get; set; }

    protected AggregateRootBase(TKey id) : base(id)
    {
        CreatedAt = DateTimeOffset.UtcNow;
        UpdatedAt = CreatedAt;
    }
}