using Microsoft.EntityFrameworkCore;
using RahafBeauty.Application.Common;
using RahafBeauty.Application.DTOs;
using RahafBeauty.Application.Interfaces;
using RahafBeauty.Application.Services.Helpers;

namespace RahafBeauty.Application.Services;

public sealed class AccountService : ServiceBase, IAccountService
{
    public AccountService(IApplicationDbContext db, ICurrentUserService currentUser)
        : base(db, currentUser)
    {
    }

    public async Task<CustomerProfileDto> GetProfileAsync(CancellationToken cancellationToken = default)
    {
        var userId = RequireUserId();
        var user = await Db.Users
            .Include(u => u.CustomerProfile)
            .AsNoTracking()
            .FirstOrDefaultAsync(u => u.Id == userId && !u.IsDeleted, cancellationToken);

        if (user is null)
        {
            throw new UnauthorizedAppException("الحساب غير موجود أو تم حذفه");
        }

        return new CustomerProfileDto(user.Id, user.FullName, user.PhoneNumber, user.CustomerProfile?.PreferredName);
    }

    public async Task<CustomerProfileDto> UpdateProfileAsync(UpdateProfileRequest request, CancellationToken cancellationToken = default)
    {
        var fields = new Dictionary<string, string[]>();
        ValidationHelper.Required(fields, nameof(request.FullName), request.FullName, "الاسم الكامل مطلوب");
        ValidationHelper.Phone(fields, nameof(request.PhoneNumber), request.PhoneNumber);
        ValidationHelper.ThrowIfInvalid(fields);

        var user = await Db.Users
            .Include(u => u.CustomerProfile)
            .FirstOrDefaultAsync(u => u.Id == RequireUserId() && !u.IsDeleted, cancellationToken)
            ?? throw new UnauthorizedAppException("الحساب غير موجود أو تم حذفه");

        var phoneExists = await Db.Users.AnyAsync(
            u => u.Id != user.Id && u.PhoneNumber == request.PhoneNumber && !u.IsDeleted,
            cancellationToken);

        if (phoneExists)
        {
            throw new AppValidationException("رقم الهاتف مستخدم مسبقا", new Dictionary<string, string[]>
            {
                [nameof(request.PhoneNumber)] = ["رقم الهاتف مستخدم مسبقا"]
            });
        }

        user.FullName = request.FullName.Trim();
        user.PhoneNumber = request.PhoneNumber;
        user.Email = request.PhoneNumber;
        user.UpdatedAt = DateTime.UtcNow;

        if (user.CustomerProfile is null)
        {
            user.CustomerProfile = new Domain.Entities.CustomerProfile();
        }

        user.CustomerProfile.PreferredName = request.PreferredName?.Trim();
        user.CustomerProfile.UpdatedAt = DateTime.UtcNow;

        await Db.SaveChangesAsync(cancellationToken);
        return new CustomerProfileDto(user.Id, user.FullName, user.PhoneNumber, user.CustomerProfile.PreferredName);
    }

    public async Task<IReadOnlyList<AddressDto>> GetAddressesAsync(CancellationToken cancellationToken = default)
    {
        var userId = RequireUserId();
        return await Db.CustomerAddresses
            .AsNoTracking()
            .Where(a => a.UserId == userId)
            .OrderByDescending(a => a.IsDefault)
            .ThenByDescending(a => a.CreatedAt)
            .Select(a => new AddressDto(a.Id, a.City, a.Area, a.Street, a.Building, a.Notes, a.IsDefault))
            .ToListAsync(cancellationToken);
    }

    public async Task<AddressDto> CreateAddressAsync(AddressRequest request, CancellationToken cancellationToken = default)
    {
        var user = await RequireActiveCustomerAsync(cancellationToken);
        ValidateAddress(request);

        var hasAny = await Db.CustomerAddresses.AnyAsync(a => a.UserId == user.Id, cancellationToken);
        var isDefault = request.IsDefault == true || !hasAny;

        if (isDefault)
        {
            await ClearDefaultAddressesAsync(user.Id, cancellationToken);
        }

        var address = new Domain.Entities.CustomerAddress
        {
            UserId = user.Id,
            City = request.City.Trim(),
            Area = request.Area.Trim(),
            Street = request.Street.Trim(),
            Building = request.Building?.Trim(),
            Notes = request.Notes?.Trim(),
            IsDefault = isDefault
        };

        Db.CustomerAddresses.Add(address);
        await Db.SaveChangesAsync(cancellationToken);
        return MapAddress(address);
    }

    public async Task<AddressDto> UpdateAddressAsync(Guid id, AddressRequest request, CancellationToken cancellationToken = default)
    {
        var userId = RequireUserId();
        ValidateAddress(request);

        var address = await Db.CustomerAddresses.FirstOrDefaultAsync(a => a.Id == id && a.UserId == userId, cancellationToken)
            ?? throw new KeyNotFoundException("العنوان غير موجود");

        if (request.IsDefault == true)
        {
            await ClearDefaultAddressesAsync(userId, cancellationToken);
            address.IsDefault = true;
        }
        else if (request.IsDefault.HasValue)
        {
            address.IsDefault = request.IsDefault.Value;
        }

        address.City = request.City.Trim();
        address.Area = request.Area.Trim();
        address.Street = request.Street.Trim();
        address.Building = request.Building?.Trim();
        address.Notes = request.Notes?.Trim();
        address.UpdatedAt = DateTime.UtcNow;

        await Db.SaveChangesAsync(cancellationToken);
        return MapAddress(address);
    }

    public async Task DeleteAddressAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var userId = RequireUserId();
        var address = await Db.CustomerAddresses.FirstOrDefaultAsync(a => a.Id == id && a.UserId == userId, cancellationToken)
            ?? throw new KeyNotFoundException("العنوان غير موجود");

        var wasDefault = address.IsDefault;
        Db.CustomerAddresses.Remove(address);
        await Db.SaveChangesAsync(cancellationToken);

        if (wasDefault)
        {
            var replacement = await Db.CustomerAddresses
                .Where(a => a.UserId == userId)
                .OrderByDescending(a => a.CreatedAt)
                .FirstOrDefaultAsync(cancellationToken);

            if (replacement is not null)
            {
                replacement.IsDefault = true;
                replacement.UpdatedAt = DateTime.UtcNow;
                await Db.SaveChangesAsync(cancellationToken);
            }
        }
    }

    public async Task<AddressDto> SetDefaultAddressAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var userId = RequireUserId();
        var address = await Db.CustomerAddresses.FirstOrDefaultAsync(a => a.Id == id && a.UserId == userId, cancellationToken)
            ?? throw new KeyNotFoundException("العنوان غير موجود");

        await ClearDefaultAddressesAsync(userId, cancellationToken);
        address.IsDefault = true;
        address.UpdatedAt = DateTime.UtcNow;
        await Db.SaveChangesAsync(cancellationToken);
        return MapAddress(address);
    }

    public async Task DeleteCurrentCustomerAsync(CancellationToken cancellationToken = default)
    {
        var user = await Db.Users
            .Include(u => u.CustomerProfile)
            .Include(u => u.CustomerAddresses)
            .Include("Cart.Items")
            .Include("Wishlist.Items")
            .FirstOrDefaultAsync(u => u.Id == RequireUserId() && !u.IsDeleted, cancellationToken)
            ?? throw new UnauthorizedAppException("الحساب غير موجود أو تم حذفه");

        if (user.Role != Domain.Enums.UserRole.Customer)
        {
            throw new ForbiddenAppException("لا يمكن للمدير حذف حسابه من هذا المسار");
        }

        var now = DateTime.UtcNow;
        var deletedMarker = $"deleted-{user.Id:N}";
        user.IsDeleted = true;
        user.DeletedAt = now;
        user.FullName = "عميل محذوف";
        user.PhoneNumber = null;
        user.Email = null;
        user.PasswordHash = deletedMarker;
        user.UpdatedAt = now;

        if (user.CustomerProfile is not null)
        {
            Db.CustomerProfiles.Remove(user.CustomerProfile);
        }

        Db.CustomerAddresses.RemoveRange(user.CustomerAddresses);

        if (user.Cart is not null)
        {
            Db.CartItems.RemoveRange(user.Cart.Items);
            Db.Carts.Remove(user.Cart);
        }

        if (user.Wishlist is not null)
        {
            Db.WishlistItems.RemoveRange(user.Wishlist.Items);
            Db.Wishlists.Remove(user.Wishlist);
        }

        var orders = await Db.Orders.Where(o => o.UserId == user.Id).ToListAsync(cancellationToken);
        foreach (var order in orders)
        {
            order.UserId = null;
            order.CustomerDeleted = true;
            order.CustomerNameSnapshot = "عميل محذوف";
            order.CustomerPhoneSnapshot = null;
            order.CustomerEmailSnapshot = null;
            order.UpdatedAt = now;
        }

        await Db.SaveChangesAsync(cancellationToken);
    }

    private async Task ClearDefaultAddressesAsync(Guid userId, CancellationToken cancellationToken)
    {
        var defaults = await Db.CustomerAddresses
            .Where(a => a.UserId == userId && a.IsDefault)
            .ToListAsync(cancellationToken);

        foreach (var item in defaults)
        {
            item.IsDefault = false;
            item.UpdatedAt = DateTime.UtcNow;
        }
    }

    private static void ValidateAddress(AddressRequest request)
    {
        var fields = new Dictionary<string, string[]>();
        ValidationHelper.Required(fields, nameof(request.City), request.City, "المدينة مطلوبة");
        ValidationHelper.Required(fields, nameof(request.Area), request.Area, "المنطقة مطلوبة");
        ValidationHelper.Required(fields, nameof(request.Street), request.Street, "الشارع مطلوب");
        ValidationHelper.ThrowIfInvalid(fields);
    }

    private static AddressDto MapAddress(Domain.Entities.CustomerAddress address) =>
        new(address.Id, address.City, address.Area, address.Street, address.Building, address.Notes, address.IsDefault);
}
