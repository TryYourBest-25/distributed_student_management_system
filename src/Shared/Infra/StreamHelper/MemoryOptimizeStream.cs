namespace Shared.Infra.StreamHelper;

public sealed class MemoryOptimizedStream : Stream
{
    private string TemporaryFilePath { get; }
    private FileStream InternalStream { get; }

    public MemoryOptimizedStream(FileMode fileMode, FileAccess fileAccess, FileShare fileShare)
    {
        TemporaryFilePath = Path.Combine(Path.GetTempPath(), Path.GetRandomFileName());
        InternalStream = new FileStream(
            TemporaryFilePath,
            fileMode,
            fileAccess,
            fileShare,
            bufferSize: 4096,
            useAsync: true);
    }

    protected override void Dispose(bool disposing)
    {
        if (disposing)
            InternalStream.Dispose();

        if (File.Exists(TemporaryFilePath))
            File.Delete(TemporaryFilePath);

        base.Dispose(disposing);
    }

    #region FileStream Proxy Mappings

    public override void Flush() => InternalStream.Flush();
    public override long Seek(long offset, SeekOrigin origin) => InternalStream.Seek(offset, origin);
    public override void SetLength(long value) => InternalStream.SetLength(value);
    public override int Read(byte[] buffer, int offset, int count) => InternalStream.Read(buffer, offset, count);
    public override void Write(byte[] buffer, int offset, int count) => InternalStream.Write(buffer, offset, count);
    public override int ReadByte() => InternalStream.ReadByte();
    public override void WriteByte(byte value) => InternalStream.WriteByte(value);
    public override int Read(Span<byte> buffer) => InternalStream.Read(buffer);
    public override void Write(ReadOnlySpan<byte> buffer) => InternalStream.Write(buffer);

    public override ValueTask<int> ReadAsync(Memory<byte> buffer, CancellationToken cancellationToken = default)
    {
        return InternalStream.ReadAsync(buffer, cancellationToken);
    }

    public override async ValueTask WriteAsync(ReadOnlyMemory<byte> buffer,
        CancellationToken cancellationToken = default)
    {
        await InternalStream.WriteAsync(buffer, cancellationToken);
    }

    public override bool CanRead => InternalStream.CanRead;
    public override bool CanSeek => InternalStream.CanSeek;
    public override bool CanWrite => InternalStream.CanWrite;
    public override long Length => InternalStream.Length;

    public override long Position
    {
        get => InternalStream.Position;
        set => InternalStream.Position = value;
    }

    #endregion
}