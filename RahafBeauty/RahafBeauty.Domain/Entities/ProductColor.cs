using RahafBeauty.Domain.Common;

namespace RahafBeauty.Domain.Entities;

public class ProductColor : CreationEntity
{
    public Guid ProductId { get; set; }

    public Product Product { get; set; } = null!;

    public string Name { get; set; } = string.Empty;

    public string HexCode { get; set; } = string.Empty;

    public ICollection<ProductVariant> Variants { get; set; } = new List<ProductVariant>();

    public ICollection<CartItem> CartItems { get; set; } = new List<CartItem>();
}