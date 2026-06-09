using System.Security.Cryptography;
using Microsoft.EntityFrameworkCore;
using RahafBeauty.Application.DTOs;
using RahafBeauty.Application.Interfaces;
using RahafBeauty.Domain.Enums;

namespace RahafBeauty.Application.Services.Helpers;

public sealed class PriceResolver : IPriceResolver
{
    public decimal ResolveUnitPrice(ProductPriceContext context) =>
        context.VariantPrice ?? context.SizePrice ?? context.BasePrice;
}

public sealed class DiscountResolver : IDiscountResolver
{
    private readonly IApplicationDbContext _db;

    public DiscountResolver(IApplicationDbContext db)
    {
        _db = db;
    }

    public async Task<DiscountResolutionDto> ResolveAsync(Guid productId, Guid brandId, DateTime utcNow, CancellationToken cancellationToken = default)
    {
        var discounts = await _db.Discounts
            .AsNoTracking()
            .Where(d => d.IsEnabled &&
                (!d.StartDate.HasValue || d.StartDate <= utcNow) &&
                (!d.EndDate.HasValue || d.EndDate >= utcNow) &&
                (d.Type == DiscountType.Global ||
                 (d.Type == DiscountType.Brand && d.ScopeId == brandId) ||
                 (d.Type == DiscountType.Product && d.ScopeId == productId)))
            .ToListAsync(cancellationToken);

        var discount = discounts
            .OrderBy(d => d.Type == DiscountType.Product ? 1 : d.Type == DiscountType.Brand ? 2 : 3)
            .ThenByDescending(d => d.Percentage)
            .FirstOrDefault();

        return discount is null
            ? new DiscountResolutionDto(null, null, null)
            : new DiscountResolutionDto(discount.Id, discount.Percentage, discount.Label);
    }
}

public sealed class OrderNumberGenerator : IOrderNumberGenerator
{
    private readonly IApplicationDbContext _db;

    public OrderNumberGenerator(IApplicationDbContext db)
    {
        _db = db;
    }

    public async Task<string> GenerateAsync(CancellationToken cancellationToken = default)
    {
        var datePart = DateTime.UtcNow.ToString("yyyyMMdd");
        for (var attempt = 0; attempt < 10; attempt++)
        {
            var number = $"RB-{datePart}-{RandomNumberGenerator.GetInt32(100000, 999999)}";
            var exists = await _db.Orders.AnyAsync(o => o.OrderNumber == number, cancellationToken);
            if (!exists)
            {
                return number;
            }
        }

        return $"RB-{datePart}-{Guid.NewGuid():N}"[..22];
    }
}
