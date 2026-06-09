using System.Text.RegularExpressions;
using RahafBeauty.Application.Common;

namespace RahafBeauty.Application.Services.Helpers;

public static partial class ValidationHelper
{
    public static void ThrowIfInvalid(IDictionary<string, string[]> fields)
    {
        if (fields.Count > 0)
        {
            throw new AppValidationException("يرجى تصحيح الحقول المطلوبة", fields);
        }
    }

    public static void Required(IDictionary<string, string[]> fields, string key, string? value, string message)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            fields[key] = [message];
        }
    }

    public static void Phone(IDictionary<string, string[]> fields, string key, string? value)
    {
        if (string.IsNullOrWhiteSpace(value) || !PhoneRegex().IsMatch(value))
        {
            fields[key] = ["رقم الهاتف يجب أن يتكون من 10 أرقام"];
        }
    }

    public static void Password(IDictionary<string, string[]> fields, string key, string? value)
    {
        if (string.IsNullOrWhiteSpace(value) || value.Length < 8)
        {
            fields[key] = ["كلمة المرور يجب أن تكون 8 أحرف على الأقل"];
        }
    }

    public static void NonNegative(IDictionary<string, string[]> fields, string key, decimal? value)
    {
        if (value.HasValue && value.Value < 0)
        {
            fields[key] = ["القيمة لا يمكن أن تكون سالبة"];
        }
    }

    public static void NonNegative(IDictionary<string, string[]> fields, string key, int? value)
    {
        if (value.HasValue && value.Value < 0)
        {
            fields[key] = ["القيمة لا يمكن أن تكون سالبة"];
        }
    }

    public static void Positive(IDictionary<string, string[]> fields, string key, int value)
    {
        if (value <= 0)
        {
            fields[key] = ["الكمية يجب أن تكون أكبر من صفر"];
        }
    }

    public static void Rating(IDictionary<string, string[]> fields, string key, int value)
    {
        if (value is < 1 or > 5)
        {
            fields[key] = ["التقييم يجب أن يكون بين 1 و 5"];
        }
    }

    public static void HexColor(IDictionary<string, string[]> fields, string key, string? value)
    {
        if (string.IsNullOrWhiteSpace(value) || !HexColorRegex().IsMatch(value))
        {
            fields[key] = ["لون HEX غير صالح"];
        }
    }

    public static void Percentage(IDictionary<string, string[]> fields, string key, decimal value)
    {
        if (value is < 0 or > 100)
        {
            fields[key] = ["النسبة يجب أن تكون بين 0 و 100"];
        }
    }

    public static void DateRange(IDictionary<string, string[]> fields, string startKey, DateTime? start, string endKey, DateTime? end)
    {
        if (start.HasValue && end.HasValue && end.Value < start.Value)
        {
            fields[endKey] = ["تاريخ النهاية يجب أن يكون بعد تاريخ البداية"];
        }
    }

    [GeneratedRegex(@"^\d{10}$")]
    private static partial Regex PhoneRegex();

    [GeneratedRegex(@"^#[0-9A-Fa-f]{6}$")]
    private static partial Regex HexColorRegex();
}
