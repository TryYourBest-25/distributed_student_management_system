namespace Shared.Domain.Model;

public interface IAggregateRoot<TKey> : IEntity<TKey>
{
    DateTimeOffset CreatedAt { get; }
    DateTimeOffset UpdatedAt { get; }
}