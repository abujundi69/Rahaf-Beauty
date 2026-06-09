using Microsoft.EntityFrameworkCore;
using RahafBeauty.Application.Interfaces;
using RahafBeauty.Domain.Common;
using RahafBeauty.Domain.Entities;

namespace RahafBeauty.Infrastructure.Persistence;

public sealed class RahafBeautyDbContext : DbContext, IApplicationDbContext
{
    public RahafBeautyDbContext(DbContextOptions<RahafBeautyDbContext> options)
        : base(options)
    {
    }

    public DbSet<User> Users => Set<User>();
    public DbSet<CustomerProfile> CustomerProfiles => Set<CustomerProfile>();
    public DbSet<CustomerAddress> CustomerAddresses => Set<CustomerAddress>();
    public DbSet<Brand> Brands => Set<Brand>();
    public DbSet<Category> Categories => Set<Category>();
    public DbSet<Product> Products => Set<Product>();
    public DbSet<ProductImage> ProductImages => Set<ProductImage>();
    public DbSet<ProductVideo> ProductVideos => Set<ProductVideo>();
    public DbSet<ProductColor> ProductColors => Set<ProductColor>();
    public DbSet<ProductSize> ProductSizes => Set<ProductSize>();
    public DbSet<ProductVariant> ProductVariants => Set<ProductVariant>();
    public DbSet<Wishlist> Wishlists => Set<Wishlist>();
    public DbSet<WishlistItem> WishlistItems => Set<WishlistItem>();
    public DbSet<Cart> Carts => Set<Cart>();
    public DbSet<CartItem> CartItems => Set<CartItem>();
    public DbSet<Order> Orders => Set<Order>();
    public DbSet<OrderItem> OrderItems => Set<OrderItem>();
    public DbSet<OrderStatusHistory> OrderStatusHistory => Set<OrderStatusHistory>();
    public DbSet<ProductReview> ProductReviews => Set<ProductReview>();
    public DbSet<StoreSettings> StoreSettings => Set<StoreSettings>();
    public DbSet<AnnouncementSettings> AnnouncementSettings => Set<AnnouncementSettings>();
    public DbSet<Discount> Discounts => Set<Discount>();
    public DbSet<AdminNotification> AdminNotifications => Set<AdminNotification>();
    public DbSet<SystemMedia> SystemMedia => Set<SystemMedia>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(RahafBeautyDbContext).Assembly);
        base.OnModelCreating(modelBuilder);
    }

    public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        var now = DateTime.UtcNow;
        foreach (var entry in ChangeTracker.Entries<Entity>())
        {
            if (entry.State == EntityState.Added && entry.Entity is CreationEntity creationEntity)
            {
                creationEntity.CreatedAt = now;
            }

            if (entry.State is EntityState.Added or EntityState.Modified && entry.Entity is AuditableEntity auditableEntity)
            {
                auditableEntity.UpdatedAt = now;
            }
        }

        return base.SaveChangesAsync(cancellationToken);
    }
}
