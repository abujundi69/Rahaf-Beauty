using RahafBeauty.Domain.Enums;

namespace RahafBeauty.Application.DTOs;

public sealed record LoginRequest(string PhoneNumber, string Password);

public sealed record RegisterCustomerRequest(string FullName, string PhoneNumber, string Password);

public sealed record AuthResponseDto(UserDto User, string Token);

public sealed record UserDto(Guid Id, string FullName, string? PhoneNumber, UserRole Role);
