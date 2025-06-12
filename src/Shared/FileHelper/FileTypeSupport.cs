namespace Shared.FileHelper;

public enum FileTypeSupport
{
    Csv,
    Json,
    Excel,
    Pdf,
}

public static class FileTypeSupportExtensions
{
    public static string GetFileExtension(this FileTypeSupport fileType)
    {
        return fileType switch
        {
            FileTypeSupport.Csv => ".csv",
            FileTypeSupport.Json => ".json",
            FileTypeSupport.Excel => ".xlsx",
            FileTypeSupport.Pdf => ".pdf",
            _ => throw new NotImplementedException()
        };
    }

    public static string GetFileType(this FileTypeSupport fileType)
    {
        return fileType switch
        {
            FileTypeSupport.Csv => "text/csv",
            FileTypeSupport.Json => "application/json",
            FileTypeSupport.Excel => "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            FileTypeSupport.Pdf => "application/pdf",
            _ => throw new NotImplementedException()
        };
    }

    public static FileTypeSupport FromString(string fileType)
    {
        return fileType.ToLower() switch
        {
            "csv" => FileTypeSupport.Csv,
            "json" => FileTypeSupport.Json,
            "excel" => FileTypeSupport.Excel,
            "pdf" => FileTypeSupport.Pdf,
            _ => throw new NotImplementedException()
        };
    }
}