using Microsoft.EntityFrameworkCore;
using RahafBeauty.Application.Common;
using RahafBeauty.Application.DTOs;
using RahafBeauty.Application.Interfaces;
using RahafBeauty.Application.Services.Helpers;
using RahafBeauty.Domain.Entities;
using RahafBeauty.Domain.Enums;

namespace RahafBeauty.Application.Services;

public sealed class DiscountService : IDiscountService
{
    private readonly IApplicationDbContext _db;

    public DiscountService(IApplicationDbContext db)
    {
        _db = db;
    }

    public async Task<IReadOnlyList<DiscountDto>> GetAllAsync(CancellationToken cancellationToken = default) =>
        await _db.Discounts
            .AsNoTracking()
            .OrderBy(d => d.Type)
            .ThenByDescending(d => d.CreatedAt)
            .Select(d => new DiscountDto(d.Id, d.Type, d.ScopeId, d.Percentage, d.Label, d.IsEnabled, d.StartDate, d.EndDate))
            .ToListAsync(cancellationToken);

    public async Task<DiscountDto> CreateAsync(DiscountRequest request, CancellationToken cancellationToken = default)
    {
        await ValidateAsync(request, cancellationToken);
        var discount = new Discount
        {
            Type = request.Type,
            ScopeId = request.ScopeId,
            Percentage = request.Percentage,
            Label = request.Label?.Trim(),
            IsEnabled = request.IsEnabled,
            StartDate = request.StartDate,
            EndDate = request.EndDate
        };

        _db.Discounts.Add(discount);
        await _db.SaveChangesAsync(cancellationToken);
        return Map(discount);
    }

    public async Task<DiscountDto> UpdateAsync(Guid id, DiscountRequest request, CancellationToken cancellationToken = default)
    {
        await ValidateAsync(request, cancellationToken);
        var discount = await _db.Discounts.FirstOrDefaultAsync(d => d.Id == id, cancellationToken)
            ?? throw new KeyNotFoundException("الخصم غير موجود");

        discount.Type = request.Type;
        discount.ScopeId = request.ScopeId;
        discount.Percentage = request.Percentage;
        discount.Label = request.Label?.Trim();
        discount.IsEnabled = request.IsEnabled;
        discount.StartDate = request.StartDate;
        discount.EndDate = request.EndDate;
        discount.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync(cancellationToken);
        return Map(discount);
    }

    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var discount = await _db.Discounts.FirstOrDefaultAsync(d => d.Id == id, cancellationToken)
            ?? throw new KeyNotFoundException("الخصم غير موجود");

        _db.Discounts.Remove(discount);
        await _db.SaveChangesAsync(cancellationToken);
    }

    private async Task ValidateAsync(DiscountRequest request, CancellationToken cancellationToken)
    {
        var fields = new Dictionary<string, string[]>();
        ValidationHelper.Percentage(fields, nameof(request.Percentage), request.Percentage);
        ValidationHelper.DateRange(fields, nameof(request.StartDate), request.StartDate, nameof(request.EndDate), request.EndDate);

        if (request.Type == DiscountType.Global && request.ScopeId.HasValue)
        {
            fields[nameof(request.ScopeId)] = ["الخصم العام لا يحتاج نطاقا"];
        }

        if (request.Type != DiscountType.Global && !request.ScopeId.HasValue)
        {
            fields[nameof(request.ScopeId)] = ["نطاق الخصم مطلوب"];
        }

        ValidationHelper.ThrowIfInvalid(fields);

        if (request.Type == DiscountType.Brand && !await _db.Brands.AnyAsync(b => b.Id == request.ScopeId, cancellationToken))
        {
            throw new KeyNotFoundException("العلامة التجارية غير موجودة");
        }

        if (request.Type == DiscountType.Category && !await _db.Categories.AnyAsync(c => c.Id == request.ScopeId, cancellationToken))
        {
            throw new KeyNotFoundException("الفئة غير موجودة");
        }

        if (request.Type == DiscountType.Product && !await _db.Products.AnyAsync(p => p.Id == request.ScopeId, cancellationToken))
        {
            throw new KeyNotFoundException("المنتج غير موجود");
        }
    }

    private static DiscountDto Map(Discount discount) =>
        new(discount.Id, discount.Type, discount.ScopeId, discount.Percentage, discount.Label, discount.IsEnabled, discount.StartDate, discount.EndDate);
}
