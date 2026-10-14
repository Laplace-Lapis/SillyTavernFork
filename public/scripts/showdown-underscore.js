// Unicode-aware "word character" class: letters, combining marks and digits of any script.
// JS's \b and \w are ASCII-only, so they treat e.g. Cyrillic letters as non-word characters.
const WORD_CHAR = '[\\p{L}\\p{M}\\p{N}]';

// Showdown's internal escape sequence for '_'. It is restored to a literal '_' by Showdown's
// unescapeSpecialChars step, before output extensions run.
const ESCAPED_UNDERSCORE = '¨E95E';

// Showdown extensions for underscore emphasis:
// 1. Escapes intraword underscores in any script, so they are never treated as emphasis delimiters.
//    Showdown's literalMidWordUnderscores option only recognizes ASCII word characters.
// 2. Replaces words surrounded by singular underscores with <em> tags
export const markdownUnderscoreExt = () => {
    try {
        if (!canUseUnicodeLookbehind()) {
            console.log('Showdown-underscore extension: Negative lookbehind or Unicode property escapes not supported. Skipping.');
            return [];
        }

        return [{
            type: 'lang',
            regex: new RegExp(`(?<=${WORD_CHAR})_+(?=${WORD_CHAR})`, 'gu'),
            replace: function (match) {
                return ESCAPED_UNDERSCORE.repeat(match.length);
            },
        }, {
            type: 'output',
            regex: new RegExp(`(<code(?:\\s+[^>]*)?>[\\s\\S]*?<\\/code>|<style(?:\\s+[^>]*)?>[\\s\\S]*?<\\/style>)|(?<!${WORD_CHAR}|_)_(?!_)(.*?)(?<!_)_(?!${WORD_CHAR}|_)`, 'giu'),
            replace: function (match, tagContent, italicContent) {
                if (tagContent) {
                    // If it's inside <code> or <style> tags, return unchanged
                    return match;
                } else if (italicContent) {
                    // If it's an italic group, apply the replacement
                    return '<em>' + italicContent + '</em>';
                }
                // If none of the conditions are met, return the original match
                return match;
            },
        }];
    } catch (e) {
        console.error('Error in Showdown-underscore extension:', e);
        return [];
    }
};

function canUseUnicodeLookbehind() {
    try {
        new RegExp('(?<!_)\\p{L}', 'u');
        return true;
    } catch (e) {
        return false;
    }
}
