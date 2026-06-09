using RahafBeauty.Domain.Common;

namespace RahafBeauty.Domain.Entities;

public class CartItem : AuditableEntity
{
    public Guid CartId { get; set; }

    public Cart Cart { get; set; } = null!;

    public Guid ProductId { get; set; }

    public Product Product { get; set; } = null!;

    public Guid? ProductSizeId { get; set; }

    public ProductSize? ProductSize { get; set; }

    public Guid? ProductColorId { get; set; }

    public ProductColor? ProductColor { get; set; }

    public Guid? ProductVariantId { get; set; }

    public ProductVariant? ProductVariant { get; set; }

    public int Quantity { get; set; }

    public decimal UnitPrice { get; set; }

    public decimal? DiscountPercent { get; set; }

    public decimal FinalUnitPrice { get; set; }
}