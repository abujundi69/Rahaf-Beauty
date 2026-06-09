using RahafBeauty.Domain.Common;
using RahafBeauty.Domain.Enums;

namespace RahafBeauty.Domain.Entities;

public class Discount : AuditableEntity
{
    public DiscountType Type { get; set; }

    public Guid? ScopeId { get; set; }

    public decimal Percentage { get; set; }

    public string? Label { get; set; }

    public bool IsEnabled { get; set; } = true;

    public DateTime? StartDate { get; set; }

    public DateTime? EndDate { get; set; }
}