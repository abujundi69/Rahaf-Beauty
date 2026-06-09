namespace RahafBeauty.Application.DTOs;

public sealed record CustomerProfileDto(
    Guid UserId,
    string FullName,
    string? PhoneNumber,
    string? PreferredName);

public sealed record UpdateProfileRequest(
    string FullName,
    string PhoneNumber,
    string? PreferredName);

public sealed record UpdateUserInfoRequest(string FullName);

public sealed record ChangePasswordRequest(
    string CurrentPassword,
    string NewPassword,
    string ConfirmPassword);

public sealed record ChangeEmailRequest(
    string NewEmail);

public sealed record AddressRequest(
    string City,
    string Area,
    string Street,
    string? Building,
    string? Notes,
    bool? IsDefault);

public sealed record AddressDto(
    Guid Id,
    string City,
    string Area,
    string Street,
    string? Building,
    string? Notes,
    bool IsDefault);
