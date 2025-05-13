namespace Shared.Exception;

public class ResourceNotFoundException : System.Exception
{
    public ResourceNotFoundException(string message) : base(message)
    {
    }

    public ResourceNotFoundException(string message, System.Exception innerException) : base(message, innerException)
    {
    }
}