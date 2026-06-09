using RahafBeauty.Domain.Common;

namespace RahafBeauty.Domain.Entities;

public class CustomerProfile : AuditableEntity
{
    public Guid UserId { get; set; }

    public User User { get; set; } = null!;

    public string? PreferredName { get; set; }
}