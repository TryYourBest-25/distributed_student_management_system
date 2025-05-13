namespace Shared.Domain.Model;

public abstract class EntityBase<TKey> : IEntity<TKey>
{
    public TKey Id { get; }
    
    protected EntityBase(TKey id)
    {
        Id = id;
    }

    public override bool Equals(object? obj)
    {
        if (obj is not EntityBase<TKey> other)
            return false;

        return Id!.Equals(other.Id);
    }

    public override int GetHashCode()
    {
        return Id!.GetHashCode();
    }
}