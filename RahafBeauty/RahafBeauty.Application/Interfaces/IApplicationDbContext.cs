using Microsoft.EntityFrameworkCore;
using RahafBeauty.Domain.Entities;

namespace RahafBeauty.Application.Interfaces;

public interface IApplicationDbContext
{
    DbSet<User> Users { get; }
    DbSet<CustomerProfile> CustomerProfiles { get; }
    DbSet<CustomerAddress> CustomerAddresses { get; }
    DbSet<Brand> Brands { get; }
    DbSet<Category> Categories { get; }
    DbSet<Product> Products { get; }
    DbSet<ProductImage> ProductImages { get; }
    DbSet<ProductVideo> ProductVideos { get; }
    DbSet<ProductColor> ProductColors { get; }
    DbSet<ProductSize> ProductSizes { get; }
    DbSet<ProductVariant> ProductVariants { get; }
    DbSet<Wishlist> Wishlists { get; }
    DbSet<WishlistItem> WishlistItems { get; }
    DbSet<Cart> Carts { get; }
    DbSet<CartItem> CartItems { get; }
    DbSet<Order> Orders { get; }
    DbSet<OrderItem> OrderItems { get; }
    DbSet<OrderStatusHistory> OrderStatusHistory { get; }
    DbSet<ProductReview> ProductReviews { get; }
    DbSet<StoreSettings> StoreSettings { get; }
    DbSet<AnnouncementSettings> AnnouncementSettings { get; }
    DbSet<Discount> Discounts { get; }
    DbSet<AdminNotification> AdminNotifications { get; }
    DbSet<SystemMedia> SystemMedia { get; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
