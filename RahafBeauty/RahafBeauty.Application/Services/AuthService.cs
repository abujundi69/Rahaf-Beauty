using Microsoft.EntityFrameworkCore;
using RahafBeauty.Application.Common;
using RahafBeauty.Application.DTOs;
using RahafBeauty.Application.Interfaces;
using RahafBeauty.Application.Services.Helpers;
using RahafBeauty.Domain.Entities;
using RahafBeauty.Domain.Enums;

namespace RahafBeauty.Application.Services;

public sealed class AuthService : IAuthService
{
    private readonly IApplicationDbContext _db;
    private readonly ICurrentUserService _currentUser;
    private readonly IJwtTokenService _jwtTokenService;
    private readonly IPasswordService _passwordService;

    public AuthService(
        IApplicationDbContext db,
        ICurrentUserService currentUser,
        IJwtTokenService jwtTokenService,
        IPasswordService passwordService)
    {
        _db = db;
        _currentUser = currentUser;
        _jwtTokenService = jwtTokenService;
        _passwordService = passwordService;
    }

    public async Task<AuthResponseDto> LoginAsync(LoginRequest request, CancellationToken cancellationToken = default)
    {
        var fields = new Dictionary<string, string[]>();
        ValidationHelper.Phone(fields, nameof(request.PhoneNumber), request.PhoneNumber);
        ValidationHelper.Required(fields, nameof(request.Password), request.Password, "كلمة المرور مطلوبة");
        ValidationHelper.ThrowIfInvalid(fields);

        var user = await _db.Users
            .FirstOrDefaultAsync(u => u.PhoneNumber == request.PhoneNumber && !u.IsDeleted, cancellationToken);

        if (user is null || !_passwordService.VerifyPassword(request.Password, user.PasswordHash))
        {
            throw new UnauthorizedAppException("رقم الهاتف أو كلمة المرور غير صحيحة");
        }

        return new AuthResponseDto(MapUser(user), _jwtTokenService.CreateToken(user));
    }

    public async Task<AuthResponseDto> RegisterCustomerAsync(RegisterCustomerRequest request, CancellationToken cancellationToken = default)
    {
        var fields = new Dictionary<string, string[]>();
        ValidationHelper.Required(fields, nameof(request.FullName), request.FullName, "الاسم الكامل مطلوب");
        ValidationHelper.Phone(fields, nameof(request.PhoneNumber), request.PhoneNumber);
        ValidationHelper.Password(fields, nameof(request.Password), request.Password);
        ValidationHelper.ThrowIfInvalid(fields);

        var exists = await _db.Users
            .AnyAsync(u => u.PhoneNumber == request.PhoneNumber && !u.IsDeleted, cancellationToken);
        if (exists)
        {
            throw new AppValidationException("رقم الهاتف مستخدم مسبقا", new Dictionary<string, string[]>
            {
                [nameof(request.PhoneNumber)] = ["رقم الهاتف مستخدم مسبقا"]
            });
        }

        var now = DateTime.UtcNow;
        var user = new User
        {
            FullName = request.FullName.Trim(),
            PhoneNumber = request.PhoneNumber,
            Email = request.PhoneNumber,
            PasswordHash = _passwordService.HashPassword(request.Password),
            Role = UserRole.Customer,
            CreatedAt = now,
            UpdatedAt = now,
            CustomerProfile = new CustomerProfile { CreatedAt = now, UpdatedAt = now },
            Cart = new Cart { CreatedAt = now, UpdatedAt = now },
            Wishlist = new Wishlist { CreatedAt = now }
        };

        _db.Users.Add(user);
        await _db.SaveChangesAsync(cancellationToken);

        return new AuthResponseDto(MapUser(user), _jwtTokenService.CreateToken(user));
    }

    public async Task<UserDto> GetCurrentUserAsync(CancellationToken cancellationToken = default)
    {
        if (!_currentUser.IsAuthenticated || _currentUser.UserId is null)
        {
            throw new UnauthorizedAppException();
        }

        var user = await _db.Users
            .AsNoTracking()
            .FirstOrDefaultAsync(u => u.Id == _currentUser.UserId.Value && !u.IsDeleted, cancellationToken);

        return user is null
            ? throw new UnauthorizedAppException("الحساب غير موجود أو تم حذفه")
            : MapUser(user);
    }

    private static UserDto MapUser(User user) => new(user.Id, user.FullName, user.PhoneNumber, user.Role);
}
