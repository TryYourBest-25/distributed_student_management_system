namespace Shared.Exception;

public class DuplicateException : System.Exception
{
    public DuplicateException(string message) : base(message)
    {
    }

    public DuplicateException(string message, System.Exception innerException) : base(message, innerException)
    {
    }
}