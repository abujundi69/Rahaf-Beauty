using RahafBeauty.Domain.Common;

namespace RahafBeauty.Domain.Entities;

public class ProductVideo : CreationEntity
{
    public Guid ProductId { get; set; }

    public Product Product { get; set; } = null!;

    public string VideoUrl { get; set; } = string.Empty;

    public int SortOrder { get; set; } = 0;
}