using RahafBeauty.Application.DTOs;
using RahafBeauty.Domain.Entities;

namespace RahafBeauty.Application.Interfaces;

public interface IJwtTokenService
{
    string CreateToken(User user);
}

public interface IPasswordService
{
    string HashPassword(string password);
    bool VerifyPassword(string password, string passwordHash);
}

public interface IAuthService
{
    Task<AuthResponseDto> LoginAsync(LoginRequest request, CancellationToken cancellationToken = default);
    Task<AuthResponseDto> RegisterCustomerAsync(RegisterCustomerRequest request, CancellationToken cancellationToken = default);
    Task<UserDto> GetCurrentUserAsync(CancellationToken cancellationToken = default);
}
