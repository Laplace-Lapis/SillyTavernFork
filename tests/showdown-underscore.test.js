import { describe, expect, test } from '@jest/globals';
import showdown from 'showdown';
import { markdownUnderscoreExt } from '../public/scripts/showdown-underscore.js';

// Mirrors the converter options from reloadMarkdownProcessor() in public/script.js
const converter = new showdown.Converter({
    emoji: true,
    literalMidWordUnderscores: true,
    parseImgDimensions: true,
    tables: true,
    underline: true,
    simpleLineBreaks: true,
    strikethrough: true,
    disableForced4SpacesIndentedSublists: true,
    extensions: [markdownUnderscoreExt()],
});

const render = (markdown) => converter.makeHtml(markdown);

describe('showdown-underscore', () => {
    describe('intraword underscores stay literal', () => {
        const cases = [
            ['ENG_NAME_TWO', '<p>ENG_NAME_TWO</p>'],
            ['РУ_ИМЯ_ДВА', '<p>РУ_ИМЯ_ДВА</p>'],
            ['РУ__ИМЯ__ДВА', '<p>РУ__ИМЯ__ДВА</p>'],
            ['РУ_name_x', '<p>РУ_name_x</p>'],
            ['name_ИМЯ_x', '<p>name_ИМЯ_x</p>'],
            ['1_2_3', '<p>1_2_3</p>'],
            ['के_लि_ए', '<p>के_लि_ए</p>'],
        ];

        for (const [input, expected] of cases) {
            test(`renders ${input}`, () => {
                expect(render(input)).toBe(expected);
            });
        }

        test('Cyrillic name with underscore followed by real emphasis', () => {
            expect(render('**РУ_ИМЯ:** text with _italic_ end'))
                .toBe('<p><strong>РУ_ИМЯ:</strong> text with <em>italic</em> end</p>');
        });
    });

    describe('standalone underscores are emphasis', () => {
        const cases = [
            ['_word_', '<p><em>word</em></p>'],
            ['_курсив_ и _ещё_', '<p><em>курсив</em> и <em>ещё</em></p>'],
            ['a РУ_ИМЯ b _курсив_ c', '<p>a РУ_ИМЯ b <em>курсив</em> c</p>'],
            ['__bold__', '<p><u>bold</u></p>'],
        ];

        for (const [input, expected] of cases) {
            test(`renders ${input}`, () => {
                expect(render(input)).toBe(expected);
            });
        }
    });

    describe('underscores in code, style, links and attributes are preserved', () => {
        const cases = [
            ['`код_с_подчёркиванием_тут`', '<p><code>код_с_подчёркиванием_тут</code></p>'],
            ['```\nкод_с_подч_ёркиванием\n```', '<pre><code>код_с_подч_ёркиванием\n</code></pre>'],
            ['<style>.a_б_в{}</style>', '<style>.a_б_в{}</style>'],
            ['[link](https://ex.com/путь_к_файлу_x)', '<p><a href="https://ex.com/путь_к_файлу_x">link</a></p>'],
            ['<div class="кл_асс_x">hi</div>', '<div class="кл_асс_x">hi</div>'],
        ];

        for (const [input, expected] of cases) {
            test(`renders ${input}`, () => {
                expect(render(input)).toBe(expected);
            });
        }
    });
});
