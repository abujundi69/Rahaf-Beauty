using Microsoft.EntityFrameworkCore;
using RahafBeauty.Application.Common;
using RahafBeauty.Application.DTOs;
using RahafBeauty.Application.Interfaces;
using RahafBeauty.Application.Services.Helpers;
using RahafBeauty.Domain.Entities;

namespace RahafBeauty.Application.Services;

public sealed class CategoryService : ICategoryService
{
    private readonly IApplicationDbContext _db;
    private readonly ISlugGenerator _slugGenerator;

    public CategoryService(IApplicationDbContext db, ISlugGenerator slugGenerator)
    {
        _db = db;
        _slugGenerator = slugGenerator;
    }

    public async Task<IReadOnlyList<CategoryDto>> GetActiveAsync(CancellationToken cancellationToken = default) =>
        await _db.Categories
            .AsNoTracking()
            .Where(c => c.IsActive)
            .OrderBy(c => c.Name)
            .Select(c => new CategoryDto(c.Id, c.Name, c.Slug, c.Description, c.ImageUrl, c.IsActive))
            .ToListAsync(cancellationToken);

    public async Task<IReadOnlyList<CategoryDto>> GetAllAsync(CancellationToken cancellationToken = default) =>
        await _db.Categories
            .AsNoTracking()
            .OrderBy(c => c.Name)
            .Select(c => new CategoryDto(c.Id, c.Name, c.Slug, c.Description, c.ImageUrl, c.IsActive))
            .ToListAsync(cancellationToken);

    public async Task<CategoryDto> CreateAsync(CategoryRequest request, CancellationToken cancellationToken = default)
    {
        Validate(request);
        var slug = await EnsureUniqueSlugAsync(request.Slug, request.Name, null, cancellationToken);
        var category = new Category
        {
            Name = request.Name.Trim(),
            Slug = slug,
            Description = request.Description?.Trim(),
            ImageUrl = request.ImageUrl?.Trim(),
            IsActive = request.IsActive ?? true
        };

        _db.Categories.Add(category);
        await _db.SaveChangesAsync(cancellationToken);
        return Map(category);
    }

    public async Task<CategoryDto> UpdateAsync(Guid id, CategoryRequest request, CancellationToken cancellationToken = default)
    {
        Validate(request);
        var category = await _db.Categories.FirstOrDefaultAsync(c => c.Id == id, cancellationToken)
            ?? throw new KeyNotFoundException("التصنيف غير موجود");

        category.Name = request.Name.Trim();
        category.Slug = await EnsureUniqueSlugAsync(request.Slug, request.Name, category.Id, cancellationToken);
        category.Description = request.Description?.Trim();
        category.ImageUrl = request.ImageUrl?.Trim();
        category.IsActive = request.IsActive ?? category.IsActive;
        category.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync(cancellationToken);
        return Map(category);
    }

    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var category = await _db.Categories.FirstOrDefaultAsync(c => c.Id == id, cancellationToken)
            ?? throw new KeyNotFoundException("التصنيف غير موجود");

        category.IsActive = false;
        category.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync(cancellationToken);
    }

    private async Task<string> EnsureUniqueSlugAsync(string? requestedSlug, string name, Guid? currentId, CancellationToken cancellationToken)
    {
        var slug = _slugGenerator.GenerateSlug(string.IsNullOrWhiteSpace(requestedSlug) ? name : requestedSlug);
        var baseSlug = slug;
        var suffix = 2;
        while (await _db.Categories.AnyAsync(c => c.Slug == slug && (!currentId.HasValue || c.Id != currentId.Value), cancellationToken))
        {
            slug = $"{baseSlug}-{suffix++}";
        }

        return slug;
    }

    private static void Validate(CategoryRequest request)
    {
        var fields = new Dictionary<string, string[]>();
        ValidationHelper.Required(fields, nameof(request.Name), request.Name, "اسم التصنيف مطلوب");
        ValidationHelper.ThrowIfInvalid(fields);
    }

    private static CategoryDto Map(Category category) =>
        new(category.Id, category.Name, category.Slug, category.Description, category.ImageUrl, category.IsActive);
}

public sealed class BrandService : IBrandService
{
    private readonly IApplicationDbContext _db;
    private readonly ISlugGenerator _slugGenerator;

    public BrandService(IApplicationDbContext db, ISlugGenerator slugGenerator)
    {
        _db = db;
        _slugGenerator = slugGenerator;
    }

    public async Task<IReadOnlyList<BrandDto>> GetActiveAsync(CancellationToken cancellationToken = default) =>
        await _db.Brands
            .AsNoTracking()
            .Where(b => b.IsActive)
            .OrderBy(b => b.Name)
            .Select(b => new BrandDto(b.Id, b.Name, b.Slug, b.Description, b.ImageUrl, b.IsActive))
            .ToListAsync(cancellationToken);

    public async Task<IReadOnlyList<BrandDto>> GetAllAsync(CancellationToken cancellationToken = default) =>
        await _db.Brands
            .AsNoTracking()
            .OrderBy(b => b.Name)
            .Select(b => new BrandDto(b.Id, b.Name, b.Slug, b.Description, b.ImageUrl, b.IsActive))
            .ToListAsync(cancellationToken);

    public async Task<BrandDto> CreateAsync(BrandRequest request, CancellationToken cancellationToken = default)
    {
        Validate(request);
        var brand = new Brand
        {
            Name = request.Name.Trim(),
            Slug = await EnsureUniqueSlugAsync(request.Slug, request.Name, null, cancellationToken),
            Description = request.Description?.Trim(),
            ImageUrl = request.ImageUrl?.Trim(),
            IsActive = request.IsActive ?? true
        };

        _db.Brands.Add(brand);
        await _db.SaveChangesAsync(cancellationToken);
        return Map(brand);
    }

    public async Task<BrandDto> UpdateAsync(Guid id, BrandRequest request, CancellationToken cancellationToken = default)
    {
        Validate(request);
        var brand = await _db.Brands.FirstOrDefaultAsync(b => b.Id == id, cancellationToken)
            ?? throw new KeyNotFoundException("العلامة التجارية غير موجودة");

        brand.Name = request.Name.Trim();
        brand.Slug = await EnsureUniqueSlugAsync(request.Slug, request.Name, brand.Id, cancellationToken);
        brand.Description = request.Description?.Trim();
        brand.ImageUrl = request.ImageUrl?.Trim();
        brand.IsActive = request.IsActive ?? brand.IsActive;
        brand.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync(cancellationToken);
        return Map(brand);
    }

    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var brand = await _db.Brands.FirstOrDefaultAsync(b => b.Id == id, cancellationToken)
            ?? throw new KeyNotFoundException("العلامة التجارية غير موجودة");

        brand.IsActive = false;
        brand.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync(cancellationToken);
    }

    private async Task<string> EnsureUniqueSlugAsync(string? requestedSlug, string name, Guid? currentId, CancellationToken cancellationToken)
    {
        var slug = _slugGenerator.GenerateSlug(string.IsNullOrWhiteSpace(requestedSlug) ? name : requestedSlug);
        var baseSlug = slug;
        var suffix = 2;
        while (await _db.Brands.AnyAsync(b => b.Slug == slug && (!currentId.HasValue || b.Id != currentId.Value), cancellationToken))
        {
            slug = $"{baseSlug}-{suffix++}";
        }

        return slug;
    }

    private static void Validate(BrandRequest request)
    {
        var fields = new Dictionary<string, string[]>();
        ValidationHelper.Required(fields, nameof(request.Name), request.Name, "اسم العلامة التجارية مطلوب");
        ValidationHelper.ThrowIfInvalid(fields);
    }

    private static BrandDto Map(Brand brand) =>
        new(brand.Id, brand.Name, brand.Slug, brand.Description, brand.ImageUrl, brand.IsActive);
}
