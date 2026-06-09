namespace RahafBeauty.Domain.Common;

public abstract class AuditableEntity : CreationEntity
{
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}