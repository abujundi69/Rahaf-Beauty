namespace RahafBeauty.Domain.Common;

public abstract class CreationEntity : Entity
{
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}