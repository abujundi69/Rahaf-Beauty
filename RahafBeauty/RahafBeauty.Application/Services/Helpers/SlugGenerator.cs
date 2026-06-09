using System.Globalization;
using System.Text;
using System.Text.RegularExpressions;
using RahafBeauty.Application.Interfaces;

namespace RahafBeauty.Application.Services.Helpers;

public sealed partial class SlugGenerator : ISlugGenerator
{
    public string GenerateSlug(string value)
    {
        if (string.IsNullOrWhiteSpace(value))
        {
            return Guid.NewGuid().ToString("N")[..12];
        }

        var normalized = value.Trim().ToLowerInvariant().Normalize(NormalizationForm.FormD);
        var builder = new StringBuilder();

        foreach (var ch in normalized)
        {
            var category = CharUnicodeInfo.GetUnicodeCategory(ch);
            if (category == UnicodeCategory.NonSpacingMark)
            {
                continue;
            }

            if (char.IsLetterOrDigit(ch) || ch is '-' or '_')
            {
                builder.Append(ch);
            }
            else if (char.IsWhiteSpace(ch))
            {
                builder.Append('-');
            }
        }

        var slug = MultipleDashesRegex().Replace(builder.ToString(), "-").Trim('-');
        return string.IsNullOrWhiteSpace(slug) ? Guid.NewGuid().ToString("N")[..12] : slug;
    }

    [GeneratedRegex("-+")]
    private static partial Regex MultipleDashesRegex();
}
