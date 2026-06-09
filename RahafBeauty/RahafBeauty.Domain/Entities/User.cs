using RahafBeauty.Domain.Common;
using RahafBeauty.Domain.Enums;

namespace RahafBeauty.Domain.Entities;

public class User : AuditableEntity
{
    public string FullName { get; set; } = string.Empty;

    public string? Email { get; set; }

    public string? PhoneNumber { get; set; }

    public string PasswordHash { get; set; } = string.Empty;

    public UserRole Role { get; set; }

    public bool IsDeleted { get; set; } = false;

    public DateTime? DeletedAt { get; set; }

    public CustomerProfile? CustomerProfile { get; set; }

    public ICollection<CustomerAddress> CustomerAddresses { get; set; } = new List<CustomerAddress>();

    public Cart? Cart { get; set; }

    public Wishlist? Wishlist { get; set; }

    public ICollection<Order> Orders { get; set; } = new List<Order>();

    public ICollection<ProductReview> ProductReviews { get; set; } = new List<ProductReview>();
}