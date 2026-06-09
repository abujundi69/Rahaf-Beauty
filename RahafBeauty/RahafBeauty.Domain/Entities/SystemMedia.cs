using RahafBeauty.Domain.Common;
using RahafBeauty.Domain.Enums;

namespace RahafBeauty.Domain.Entities;

public class SystemMedia : CreationEntity
{
    public string OwnerType { get; set; } = string.Empty;

    public Guid? OwnerId { get; set; }

    public string FileUrl { get; set; } = string.Empty;

    public MediaType FileType { get; set; }

    public string FileName { get; set; } = string.Empty;

    public string MimeType { get; set; } = string.Empty;

    public long Size { get; set; }
}