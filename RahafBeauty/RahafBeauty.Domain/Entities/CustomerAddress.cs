using RahafBeauty.Domain.Common;

namespace RahafBeauty.Domain.Entities;

public class CustomerAddress : AuditableEntity
{
    public Guid UserId { get; set; }

    public User User { get; set; } = null!;

    public string City { get; set; } = string.Empty;

    public string Area { get; set; } = string.Empty;

    public string Street { get; set; } = string.Empty;

    public string? Building { get; set; }

    public string? Notes { get; set; }

    public bool IsDefault { get; set; } = false;
}