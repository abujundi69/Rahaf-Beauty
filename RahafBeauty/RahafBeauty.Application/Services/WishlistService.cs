using Microsoft.EntityFrameworkCore;
using RahafBeauty.Application.DTOs;
using RahafBeauty.Application.Interfaces;
using RahafBeauty.Domain.Entities;

namespace RahafBeauty.Application.Services;

public sealed class WishlistService : ServiceBase, IWishlistService
{
    public WishlistService(IApplicationDbContext db, ICurrentUserService currentUser)
        : base(db, currentUser)
    {
    }

    public async Task<WishlistDto> GetWishlistAsync(CancellationToken cancellationToken = default)
    {
        var user = await RequireActiveCustomerAsync(cancellationToken);
        var wishlist = await GetOrCreateWishlistAsync(user.Id, cancellationToken);
        return MapWishlist(wishlist);
    }

    public async Task<WishlistDto> AddItemAsync(AddWishlistItemRequest request, CancellationToken cancellationToken = default)
    {
        var user = await RequireActiveCustomerAsync(cancellationToken);
        var product = await Db.Products
            .AsNoTracking()
            .FirstOrDefaultAsync(p => p.Id == request.ProductId && p.IsActive, cancellationToken)
            ?? throw new KeyNotFoundException("المنتج غير موجود أو غير متاح");

        var wishlist = await GetOrCreateWishlistAsync(user.Id, cancellationToken);
        if (wishlist.Items.All(i => i.ProductId != product.Id))
        {
            wishlist.Items.Add(new WishlistItem { ProductId = product.Id });
            await Db.SaveChangesAsync(cancellationToken);
            wishlist = await GetOrCreateWishlistAsync(user.Id, cancellationToken);
        }

        return MapWishlist(wishlist);
    }

    public async Task DeleteItemAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var user = await RequireActiveCustomerAsync(cancellationToken);
        var wishlist = await GetOrCreateWishlistAsync(user.Id, cancellationToken);
        var item = wishlist.Items.FirstOrDefault(i => i.Id == id)
            ?? throw new KeyNotFoundException("عنصر المفضلة غير موجود");

        Db.WishlistItems.Remove(item);
        await Db.SaveChangesAsync(cancellationToken);
    }

    private async Task<Wishlist> GetOrCreateWishlistAsync(Guid userId, CancellationToken cancellationToken)
    {
        var wishlist = await Db.Wishlists
            .Include(w => w.Items).ThenInclude(i => i.Product).ThenInclude(p => p.Images)
            .FirstOrDefaultAsync(w => w.UserId == userId, cancellationToken);

        if (wishlist is not null)
        {
            return wishlist;
        }

        wishlist = new Wishlist { UserId = userId };
        Db.Wishlists.Add(wishlist);
        await Db.SaveChangesAsync(cancellationToken);
        return wishlist;
    }

    private static WishlistDto MapWishlist(Wishlist wishlist)
    {
        var items = wishlist.Items
            .OrderByDescending(i => i.CreatedAt)
            .Select(i => new WishlistItemDto(
                i.Id,
                i.ProductId,
                i.Product.Name,
                i.Product.Slug,
                i.Product.Images.OrderBy(img => img.SortOrder).FirstOrDefault()?.ImageUrl,
                i.Product.BasePrice))
            .ToList();

        return new WishlistDto(wishlist.Id, items);
    }
}
