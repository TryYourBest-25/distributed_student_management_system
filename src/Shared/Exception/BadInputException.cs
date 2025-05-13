namespace Shared.Exception;

public class BadInputException : System.Exception
{
    public BadInputException(string message) : base(message)
    {
    }

    public BadInputException(string message, System.Exception innerException) : base(message, innerException)
    {
    }
    
}