"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) { return typeof obj; } : function (obj) { return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }, _typeof(obj); }

var _locale = _interopRequireWildcard(require("./locale.js"));

function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }

function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || _typeof(obj) !== "object" && typeof obj !== "function") { return { "default": obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj["default"] = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

describe('locale', function () {
  it("should tell if can use Intl for date formatting", function () {
    (0, _locale.intlDateTimeFormatSupportedLocale)('en').should.equal('en');
    (0, _locale.intlDateTimeFormatSupportedLocale)('en-XX').should.equal('en-XX');
    (0, _locale.intlDateTimeFormatSupportedLocale)(['en', 'ru']).should.equal('en');
  });
  it("should choose the most appropriate locale", function () {
    function arrayToObject(array) {
      return array.reduce(function (object, locale) {
        object[locale] = true;
        return object;
      }, {});
    }

    function choose(locale, locales) {
      var defaultLocale = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'en';

      if (typeof locale === 'string') {
        locale = [locale];
      }

      locale = locale.concat(defaultLocale);
      return (0, _locale["default"])(locale, function (_) {
        return locales.includes(_);
      });
    }

    choose('ru-RU', ['en', 'ru']).should.equal('ru');
    choose('en-GB', ['en', 'ru']).should.equal('en');
    choose('fr-FR', ['en', 'ru']).should.equal('en');
    choose(['fr-FR', 'de-DE'], ['en', 'ru']).should.equal('en');
    choose(['fr-FR', 'de-DE'], ['en', 'de']).should.equal('de');
    choose(['fr-FR', 'de-DE'], ['en', 'de', 'fr']).should.equal('fr');
    choose('fr-FR', ['en', 'fr-FR']).should.equal('fr-FR');
    expect(function () {
      return choose('fr-FR', ['de', 'ru']);
    }).to["throw"]('No locale data has been registered for any of the locales: fr-FR');
  });
});
//# sourceMappingURL=locale.test.js.map