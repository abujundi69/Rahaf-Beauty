using RahafBeauty.Domain.Common;

namespace RahafBeauty.Domain.Entities;

public class StoreSettings : AuditableEntity
{
    public string StoreName { get; set; } = string.Empty;

    public string? LogoUrl { get; set; }

    public string? ContactEmail { get; set; }

    public string? Phone { get; set; }

    public string? Address { get; set; }

    public string Currency { get; set; } = "ILS";
}