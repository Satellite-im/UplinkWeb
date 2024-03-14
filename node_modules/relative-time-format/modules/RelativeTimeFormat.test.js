function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { _defineProperty(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

import RelativeTimeFormat from './RelativeTimeFormat.js';
import ccp from '../locale/ccp.json' assert { type: 'json' };
import de from '../locale/de.json' assert { type: 'json' };
import en from '../locale/en.json' assert { type: 'json' };
import ru from '../locale/ru.json' assert { type: 'json' };
import to from '../locale/to.json' assert { type: 'json' };
import ar_AE from '../locale/ar-AE.json' assert { type: 'json' };
import pt from '../locale/pt.json' assert { type: 'json' };
import pt_PT from '../locale/pt-PT.json' assert { type: 'json' };
import zh from '../locale/zh.json' assert { type: 'json' };
en.tiny = {
  "year": "{0}yr",
  "month": "{0}mo",
  "week": "{0}wk",
  "day": "{0}d",
  "hour": "{0}h",
  "minute": "{0}m",
  "second": "{0}s",
  "now": "now"
};
RelativeTimeFormat.addLocale(ccp);
RelativeTimeFormat.addLocale(de);
RelativeTimeFormat.addLocale(en);
RelativeTimeFormat.addLocale(ru);
RelativeTimeFormat.addLocale(to);
RelativeTimeFormat.addLocale(ar_AE);
RelativeTimeFormat.addLocale(pt);
RelativeTimeFormat.addLocale(pt_PT);
RelativeTimeFormat.addLocale(zh); // Just so this function code is covered.
// It's "en" by default.

RelativeTimeFormat.setDefaultLocale('en');
describe('Intl.RelativeTimeFormat', function () {
  it('should validate options', function () {
    expect(function () {
      return new RelativeTimeFormat("en", {
        style: "postmodern"
      });
    }).to["throw"]("Invalid \"style\" option");
    expect(function () {
      return new RelativeTimeFormat("en", {
        numeric: "sometimes"
      });
    }).to["throw"]("Invalid \"numeric\" option");
  });
  it('should fall back to default locale', function () {
    var rtf = new RelativeTimeFormat();
    expect(rtf.format(-1, "day")).to.equal("1 day ago");
  });
  it('should throw when "numeric" option is not a valid one', function () {
    expect(function () {
      return new RelativeTimeFormat("en", {
        numeric: "sometimes"
      });
    }).to["throw"]('Invalid "numeric" option');
  });
  it('should validate "unit" argument', function () {
    var rtf = new RelativeTimeFormat();
    expect(function () {
      return rtf.format(-1);
    }).to["throw"]('"unit" argument is required');
    expect(function () {
      return rtf.formatToParts(-1);
    }).to["throw"]('"unit" argument is required');
    expect(function () {
      return rtf.format(-1, 0);
    }).to["throw"]('Invalid "unit" argument');

    if (typeof Symbol !== 'undefined') {
      expect(function () {
        return rtf.format(-1, Symbol());
      }).to["throw"]('Invalid "unit" argument');
    }
  });
  it('should use the passed "style" option', function () {
    var rtf = new RelativeTimeFormat("en", {
      style: "short"
    });
    expect(rtf.format(-1, "year")).to.equal("1 yr. ago");
  });
  it('should throw when "style" option is not a valid one', function () {
    expect(function () {
      return new RelativeTimeFormat("en", {
        style: "postmodern"
      });
    }).to["throw"]('Invalid "style" option');
  });
  it('should use the passed "localeMatcher" option', function () {
    var rtf = new RelativeTimeFormat("en-XX", {
      localeMatcher: "lookup"
    });
    expect(rtf.format(-1, "day")).to.equal("1 day ago");
  });
  it('should throw when "localeMatcher" option is not a valid one', function () {
    expect(function () {
      return new RelativeTimeFormat("en", {
        localeMatcher: "eccentric"
      });
    }).to["throw"]('Invalid "localeMatcher" option');
  });
  it('should throw if no supported locale was found', function () {
    RelativeTimeFormat.setDefaultLocale('xx');
    expect(function () {
      return new RelativeTimeFormat();
    }).to["throw"]("No supported locale was found");
    RelativeTimeFormat.setDefaultLocale('en');
  });
  it('should format relative time', function () {
    var rtf = new RelativeTimeFormat("en");
    expect(rtf.format(-1, "day")).to.equal("1 day ago");
    expect(rtf.format(-2, "day")).to.equal("2 days ago");
    expect(rtf.format(2.15, "day")).to.equal("in 2.15 days");
    expect(rtf.format(100, "day")).to.equal("in 100 days");
  });
  it('should throw for non-finite numbers', function () {
    var rtf = new RelativeTimeFormat("en"); // Test with `Number.isFinite`.

    if (Number.isFinite) {
      expect(function () {
        return rtf.format(-Infinity, "day");
      }).to["throw"]("Invalid \"number\" argument");
    } // Test without `Number.isFinite`.


    var isFinite = Number.isFinite;
    Number.isFinite = undefined;
    expect(rtf.format(-Infinity, "day")).to.equal("∞ days ago");
    Number.isFinite = isFinite;
  });
  it('should handle cases when no plural rules function is available for a locale', function () {
    var rtf = new RelativeTimeFormat("en");
    expect(rtf.format(-1, "second")).to.equal("1 second ago");
    expect(rtf.format(-2, "second")).to.equal("2 seconds ago"); // Emulate a non-supported locale.
    // There seems to be no such locale in CLDR
    // for which "plural rules" function is missing.

    rtf.pluralRules = undefined;
    expect(rtf.format(-1, "second")).to.equal("1 seconds ago");
    expect(rtf.format(-2, "second")).to.equal("2 seconds ago");
  });
  it('should fall back to "other" quantifier if others have been removed as an optimization', function () {
    var rtf = new RelativeTimeFormat("ru"); // `2` is classified as "few" in Russian.
    // The rule for "few" is identical to that for "other"
    // so the rule for "few" is omitted from locale data
    // to reduce bundle size.

    expect(rtf.format(-2, "day")).to.equal("2 дня назад");
  });
  it('should throw if a time unit is unsupported', function () {
    var rtf = new RelativeTimeFormat("en");
    expect(function () {
      return rtf.format(-1, "decade");
    }).to["throw"]("Invalid \"unit\" argument: decade");
  });
  it('should format yesterday/today/tomorrow', function () {
    var rtf = new RelativeTimeFormat("de", {
      numeric: "auto"
    }); // "today" is useless for relative time labels.
    // E.g. for `23:59:00` "today" is too vague.
    // And for `00:01:00` "today" is counter-intuitive.
    // "yesterday" and "tomorrow" are also useless for relative time.
    // E.g. "yesterday" of `00:01` is misleading.
    // Same as "tomorrow" of `23:59` which is misleading too.
    // Not to mention that both of them are too "vague", same as "today".
    // Also there are no rules defining when to use
    // "yesterday", "today" and "tomorrow".
    // The algorithm should take local time into account.

    expect(rtf.format(-2, "day")).to.equal("vorgestern");
    expect(rtf.format(-1, "day")).to.equal("gestern");
    expect(rtf.format(0, "day")).to.equal("heute");
    expect(rtf.format(1, "day")).to.equal("morgen");
    expect(rtf.format(2, "day")).to.equal("übermorgen");
    expect(rtf.format(0, "second")).to.equal("jetzt");
  });
  it('should use "Intl.NumberFormat" (when available)', function () {
    var rtf = new RelativeTimeFormat("en");
    expect(rtf.format(1000, "day")).to.equal("in 1,000 days");
  });
  it('should fall back when "Intl.NumberFormat" is not available', function () {
    var NumberFormat = Intl.NumberFormat; // I imagine `Intl` object getting "frozen" in future.

    delete Intl.NumberFormat;
    var rtf = new RelativeTimeFormat("en");
    expect(rtf.format(1000, "day")).to.equal("in 1000 days");
    Intl.NumberFormat = NumberFormat;
  });
  it('shouldn\'t format yesterday/today/tomorrow when there\'s no locale data', function () {
    var enLongDay = _objectSpread({}, en["long"].day);

    delete en["long"].day.previous;
    delete en["long"].day.current;
    delete en["long"].day.next;
    var rtf = new RelativeTimeFormat("en", {
      numeric: "auto"
    }); // "today" is useless for relative time labels.
    // E.g. for `23:59:00` "today" is too vague.
    // And for `00:01:00` "today" is counter-intuitive.
    // "yesterday" and "tomorrow" are also useless for relative time.
    // E.g. "yesterday" of `00:01` is misleading.
    // Same as "tomorrow" of `23:59` which is misleading too.
    // Not to mention that both of them are too "vague", same as "today".
    // Also there are no rules defining when to use
    // "yesterday", "today" and "tomorrow".
    // The algorithm should take local time into account.

    expect(rtf.format(-1, "day")).to.equal("1 day ago");
    expect(rtf.format(0, "day")).to.equal("in 0 days");
    expect(rtf.format(1, "day")).to.equal("in 1 day");
    en["long"].day = enLongDay;
  });
  it('should accept an array of locales', function () {
    var rtf = new RelativeTimeFormat(["en"]);
    expect(rtf.format(-2, "day")).to.equal("2 days ago");
  });
  it('should resolve locales as "best fit"', function () {
    var rtf = new RelativeTimeFormat('en-XX');
    expect(rtf.format(-2, "day")).to.equal("2 days ago");
  });
  it('should fallback to default system locale', function () {
    var rtf = new RelativeTimeFormat();
    expect(rtf.format(-2, "day")).to.equal("2 days ago");
  });
  it('should support plural units', function () {
    var rtf = new RelativeTimeFormat();
    expect(rtf.format(-2, "days")).to.equal("2 days ago");
  });
  it('should support negative zero', function () {
    var rtf = new RelativeTimeFormat();
    expect(rtf.format(0, "day")).to.equal("in 0 days");
    expect(rtf.format(-0, "day")).to.equal("0 days ago");
    expect(rtf.formatToParts(-0, "second")).to.deep.equal([{
      type: "integer",
      value: "0",
      unit: "second"
    }, {
      type: "literal",
      value: " seconds ago"
    }]);
  });
  it('should support string numbers', function () {
    var rtf = new RelativeTimeFormat();
    expect(rtf.format("0", "day")).to.equal("in 0 days");
  });
  it('should format to parts', function () {
    var rtf = new RelativeTimeFormat("en"); // `Intl.NumberFormat` doesn't have `formatToParts()`
    // in Node.js version 9.x.
    // In Node.js version 12.x it does have that method.

    if (Intl.NumberFormat.prototype.formatToParts) {
      // Test with `Intl.NumberFormat.prototype.formatToParts`.
      expect(rtf.formatToParts(1000, "day")).to.deep.equal([{
        type: "literal",
        value: "in "
      }, {
        type: "integer",
        value: "1",
        unit: "day"
      }, {
        type: "group",
        value: ",",
        unit: "day"
      }, {
        type: "integer",
        value: "000",
        unit: "day"
      }, {
        type: "literal",
        value: " days"
      }]); // Test without `Intl.NumberFormat.prototype.formatToParts`.

      var numberFormat = rtf.numberFormat;
      rtf.numberFormat = undefined;
      expect(rtf.formatToParts(1000, "day")).to.deep.equal([{
        type: "literal",
        value: "in "
      }, {
        type: "integer",
        value: "1000",
        unit: "day"
      }, {
        type: "literal",
        value: " days"
      }]);
      rtf.numberFormat = numberFormat;
    }

    expect(rtf.formatToParts(100, "day")).to.deep.equal([{
      type: "literal",
      value: "in "
    }, {
      type: "integer",
      value: "100",
      unit: "day"
    }, {
      type: "literal",
      value: " days"
    }]);
    expect(rtf.formatToParts(-100, "day")).to.deep.equal([{
      type: "integer",
      value: "100",
      unit: "day"
    }, {
      type: "literal",
      value: " days ago"
    }]);
  });
  it('should format to parts with numeric="auto"', function () {
    var rtf = new RelativeTimeFormat("en", {
      numeric: "auto"
    });
    expect(rtf.formatToParts(-1, "day")).to.deep.equal([{
      type: "literal",
      value: "yesterday"
    }]);
    expect(rtf.formatToParts(100, "day")).to.deep.equal([{
      type: "literal",
      value: "in "
    }, {
      type: "integer",
      value: "100",
      unit: "day"
    }, {
      type: "literal",
      value: " days"
    }]);
  });
  it('should format to parts (non-English)', function () {
    // Tonga (Tonga Islands)
    var rtf = new RelativeTimeFormat("to");
    expect(rtf.formatToParts(100, "day")).to.deep.equal([{
      type: "literal",
      value: "ʻi he ʻaho ʻe "
    }, {
      type: "integer",
      value: "100",
      unit: "day"
    }]);
  });
  it('"supportedLocalesOf" should list supported locales', function () {
    expect(RelativeTimeFormat.supportedLocalesOf(['es-ES', 'ru', 'ru-XX', 'en-GB'])).to.deep.equal(['ru', 'ru-XX', 'en-GB']);
    expect(RelativeTimeFormat.supportedLocalesOf('ru-XX')).to.deep.equal(['ru-XX']);
  });
  it('"supportedLocalesOf" should throw when "locales" argument is not valid', function () {
    expect(function () {
      return RelativeTimeFormat.supportedLocalesOf(123);
    }).to["throw"]("Invalid \"locales\" argument");
  });
  it('"supportedLocalesOf" should throw when "localeMatcher" option is not a valid one', function () {
    expect(function () {
      return RelativeTimeFormat.supportedLocalesOf(["en"], {
        localeMatcher: "eccentric"
      });
    }).to["throw"]('Invalid "localeMatcher" option');
  });
  it('should quantify as "other" when no quantifier function is present for a locale', function () {
    new RelativeTimeFormat("ccp").format(1, "quarter").should.equal("𑄷 𑄖𑄨𑄚𑄟𑄏𑄬");
  });
  it('should use quantify for a language of a specific locale', function () {
    // Will use `quantify` for "ar" language.
    new RelativeTimeFormat("ar-AE").format(-1, "year").should.equal("قبل سنة واحدة");
    new RelativeTimeFormat("ar-AE").format(-2, "year").should.equal("قبل سنتين"); // Uses local digits:
    // new RelativeTimeFormat("ar-AE").format(-3, "year").should.equal("قبل ٣ سنوات")
    // Uses generic ANSI 0-9 digits:

    new RelativeTimeFormat("ar-AE").format(-3, "year").should.equal("قبل 3 سنوات"); // Uses local digits:
    // new RelativeTimeFormat("ar-AE").format(-1.23, "year").should.equal("قبل ١٫٢٣ سنة")
    // Uses generic ANSI 0-9 digits:

    new RelativeTimeFormat("ar-AE").format(-1.23, "year").should.equal("قبل 1.23 سنة");
  });
  it('should use correct quantify for Portuguese ("pt") and European Portuguese ("pt-PT")', function () {
    new RelativeTimeFormat("pt").format(1.5, "day").should.equal("em 1,5 dia");
    new RelativeTimeFormat("pt-PT").format(1.5, "day").should.equal("dentro de 1,5 dias");
  });
  it('should show resolved options', function () {
    expect(new RelativeTimeFormat('ru-XX', {
      timeZone: 'UTC'
    }).resolvedOptions()).to.deep.equal({
      locale: "ru",
      style: "long",
      numeric: "always",
      numberingSystem: "latn"
    });
  });
  it('should support short labels definition (like the ones used `javascript-time-ago`) (not used)', function () {
    var originalNarrowSecondLabels = en.narrow.second;
    en.narrow.second = '{0}s';
    expect(new RelativeTimeFormat("en", {
      style: "narrow"
    }).format(-1, "second")).to.equal("1s");
    en.narrow.second = originalNarrowSecondLabels;
  }); // Node.js 11.x seems to not support `zh-Hans-CN` on `Intl.NumberFormat` for some reason.
  // it('should support non-"latn" numbering systems', () => {
  //   // the nu extension key requests a numbering system, e.g. Chinese decimal
  //   expect(new RelativeTimeFormat('zh-Hans-CN-u-nu-hanidec').format(-123456.789, "day")).to.equal("一二三,四五六.七八九")
  //   expect(new RelativeTimeFormat('zh-Hans-CN').format(-123456.789, "day")).to.equal("123,456.789 days ago")
  // })
});
//# sourceMappingURL=RelativeTimeFormat.test.js.map