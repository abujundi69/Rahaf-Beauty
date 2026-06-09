using RahafBeauty.Domain.Common;

namespace RahafBeauty.Domain.Entities;

public class OrderItem : CreationEntity
{
    public Guid OrderId { get; set; }

    public Order Order { get; set; } = null!;

    public Guid? ProductId { get; set; }

    public Product? Product { get; set; }

    public string ProductNameSnapshot { get; set; } = string.Empty;

    public string? BrandNameSnapshot { get; set; }

    public string? CategoryNameSnapshot { get; set; }

    public string? ProductSizeLabelSnapshot { get; set; }

    public Guid? ProductSizeId { get; set; }

    public string? ProductColorNameSnapshot { get; set; }

    public string? ProductColorHexSnapshot { get; set; }

    public Guid? ProductColorId { get; set; }

    public Guid? ProductVariantId { get; set; }

    public int Quantity { get; set; }

    public decimal UnitPrice { get; set; }

    public decimal? DiscountPercent { get; set; }

    public decimal FinalUnitPrice { get; set; }

    public decimal LineTotal { get; set; }
}
