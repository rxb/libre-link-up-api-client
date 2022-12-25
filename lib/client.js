"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.LibreLinkUpClient = void 0;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _axios = _interopRequireDefault(require("axios"));

var _utils = require("./utils");

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { (0, _defineProperty2["default"])(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }

var LIBRE_LINK_SERVER = 'https://api-us.libreview.io';
var urlMap = {
  login: '/llu/auth/login',
  connections: '/llu/connections',
  countries: '/llu/config/country?country=DE'
};

var LibreLinkUpClient = function LibreLinkUpClient(_ref) {
  var username = _ref.username,
      password = _ref.password,
      connectionIdentifier = _ref.connectionIdentifier;
  var jwtToken = null;
  var connectionId = null;

  var instance = _axios["default"].create({
    baseURL: LIBRE_LINK_SERVER,
    headers: {
      'accept-encoding': 'gzip',
      'cache-control': 'no-cache',
      connection: 'Keep-Alive',
      'content-type': 'application/json',
      product: 'llu.android',
      version: '4.2.1'
    }
  });

  instance.interceptors.request.use(function (config) {
    if (jwtToken && config.headers) {
      // eslint-disable-next-line no-param-reassign
      config.headers.authorization = "Bearer ".concat(jwtToken);
    }

    return config;
  }, function (e) {
    return e;
  }, {
    synchronous: true
  });

  var login = /*#__PURE__*/function () {
    var _ref2 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee() {
      var loginResponse, redirectResponse, countryNodes, targetRegion, regionDefinition;
      return _regenerator["default"].wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              _context.next = 2;
              return instance.post(urlMap.login, {
                email: username,
                password: password
              });

            case 2:
              loginResponse = _context.sent;

              if (!loginResponse.data.data.redirect) {
                _context.next = 14;
                break;
              }

              redirectResponse = loginResponse.data;
              _context.next = 7;
              return instance.get(urlMap.countries);

            case 7:
              countryNodes = _context.sent;
              targetRegion = redirectResponse.data.region;
              regionDefinition = countryNodes.data.data.regionalMap[targetRegion];

              if (regionDefinition) {
                _context.next = 12;
                break;
              }

              throw new Error("Unable to find region '".concat(redirectResponse.data.region, "'. \n          Available nodes are ").concat(Object.keys(countryNodes.data.data.regionalMap).join(', '), "."));

            case 12:
              instance.defaults.baseURL = regionDefinition.lslApi;
              return _context.abrupt("return", login());

            case 14:
              jwtToken = loginResponse.data.data.authTicket.token;
              return _context.abrupt("return", loginResponse.data);

            case 16:
            case "end":
              return _context.stop();
          }
        }
      }, _callee);
    }));

    return function login() {
      return _ref2.apply(this, arguments);
    };
  }();

  var loginWrapper = function loginWrapper(func) {
    return /*#__PURE__*/(0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee2() {
      return _regenerator["default"].wrap(function _callee2$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              _context2.prev = 0;

              if (jwtToken) {
                _context2.next = 4;
                break;
              }

              _context2.next = 4;
              return login();

            case 4:
              return _context2.abrupt("return", func());

            case 7:
              _context2.prev = 7;
              _context2.t0 = _context2["catch"](0);
              _context2.next = 11;
              return login();

            case 11:
              return _context2.abrupt("return", func());

            case 12:
            case "end":
              return _context2.stop();
          }
        }
      }, _callee2, null, [[0, 7]]);
    }));
  };

  var getConnections = loginWrapper( /*#__PURE__*/(0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee3() {
    var response;
    return _regenerator["default"].wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            _context3.next = 2;
            return instance.get(urlMap.connections);

          case 2:
            response = _context3.sent;
            return _context3.abrupt("return", response.data);

          case 4:
          case "end":
            return _context3.stop();
        }
      }
    }, _callee3);
  })));

  var getConnection = function getConnection(connections) {
    if (typeof connectionIdentifier === 'string') {
      var match = connections.find(function (_ref5) {
        var firstName = _ref5.firstName,
            lastName = _ref5.lastName;
        return "".concat(firstName, " ").concat(lastName).toLowerCase() === connectionIdentifier.toLowerCase();
      });

      if (!match) {
        throw new Error("Unable to identify connection by given name '".concat(connectionIdentifier, "'."));
      }

      return match.patientId;
    }

    if (typeof connectionIdentifier === 'function') {
      var _match = connectionIdentifier.call(null, connections);

      if (!_match) {
        throw new Error("Unable to identify connection by given name function");
      }

      return _match;
    }

    return connections[0].patientId;
  };

  var getLogbook = loginWrapper( /*#__PURE__*/(0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee4() {
    var _connections, response, rawLogbookResponse, toDate;

    return _regenerator["default"].wrap(function _callee4$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            if (connectionId) {
              _context4.next = 5;
              break;
            }

            _context4.next = 3;
            return getConnections();

          case 3:
            _connections = _context4.sent;
            connectionId = getConnection(_connections.data);

          case 5:
            _context4.next = 7;
            return instance.get("".concat(urlMap.connections, "/").concat(connectionId, "/logbook"));

          case 7:
            response = _context4.sent;
            rawLogbookResponse = response.data.data;

            toDate = function toDate(dateString) {
              return new Date(dateString);
            };

            return _context4.abrupt("return", rawLogbookResponse.map(function (logItem) {
              return _objectSpread(_objectSpread({}, logItem), {}, {
                date: toDate("".concat(logItem.FactoryTimestamp, " UTC"))
              });
            }));

          case 11:
          case "end":
            return _context4.stop();
        }
      }
    }, _callee4);
  })));
  var readRaw = loginWrapper( /*#__PURE__*/(0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee5() {
    var _connections2, response;

    return _regenerator["default"].wrap(function _callee5$(_context5) {
      while (1) {
        switch (_context5.prev = _context5.next) {
          case 0:
            if (connectionId) {
              _context5.next = 5;
              break;
            }

            _context5.next = 3;
            return getConnections();

          case 3:
            _connections2 = _context5.sent;
            connectionId = getConnection(_connections2.data);

          case 5:
            _context5.next = 7;
            return instance.get("".concat(urlMap.connections, "/").concat(connectionId, "/graph"));

          case 7:
            response = _context5.sent;
            return _context5.abrupt("return", response.data.data);

          case 9:
          case "end":
            return _context5.stop();
        }
      }
    }, _callee5);
  })));

  var read = /*#__PURE__*/function () {
    var _ref8 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee6() {
      var response;
      return _regenerator["default"].wrap(function _callee6$(_context6) {
        while (1) {
          switch (_context6.prev = _context6.next) {
            case 0:
              _context6.next = 2;
              return readRaw();

            case 2:
              response = _context6.sent;
              return _context6.abrupt("return", {
                current: (0, _utils.mapData)(response.connection.glucoseMeasurement),
                history: response.graphData.map(_utils.mapData)
              });

            case 4:
            case "end":
              return _context6.stop();
          }
        }
      }, _callee6);
    }));

    return function read() {
      return _ref8.apply(this, arguments);
    };
  }();

  var observe = /*#__PURE__*/function () {
    var _ref9 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee7() {
      return _regenerator["default"].wrap(function _callee7$(_context7) {
        while (1) {
          switch (_context7.prev = _context7.next) {
            case 0:
            case "end":
              return _context7.stop();
          }
        }
      }, _callee7);
    }));

    return function observe() {
      return _ref9.apply(this, arguments);
    };
  }();

  var averageInterval;

  var readAveraged = /*#__PURE__*/function () {
    var _ref10 = (0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee9(amount, callback) {
      var interval,
          mem,
          _args9 = arguments;
      return _regenerator["default"].wrap(function _callee9$(_context9) {
        while (1) {
          switch (_context9.prev = _context9.next) {
            case 0:
              interval = _args9.length > 2 && _args9[2] !== undefined ? _args9[2] : 15000;
              mem = new Map();
              averageInterval = setInterval( /*#__PURE__*/(0, _asyncToGenerator2["default"])( /*#__PURE__*/_regenerator["default"].mark(function _callee8() {
                var _yield$read, current, history, memValues, averageValue, averageTrend;

                return _regenerator["default"].wrap(function _callee8$(_context8) {
                  while (1) {
                    switch (_context8.prev = _context8.next) {
                      case 0:
                        _context8.next = 2;
                        return read();

                      case 2:
                        _yield$read = _context8.sent;
                        current = _yield$read.current;
                        history = _yield$read.history;
                        mem.set(current.date.toString(), current);

                        if (mem.size === amount) {
                          memValues = Array.from(mem.values());
                          averageValue = Math.round(memValues.reduce(function (acc, cur) {
                            return acc + cur.value;
                          }, 0) / amount);
                          averageTrend = _utils.trendMap[parseInt((Math.round(memValues.reduce(function (acc, cur) {
                            return acc + _utils.trendMap.indexOf(cur.trend);
                          }, 0) / amount * 100) / 100).toFixed(0), 10)];
                          mem = new Map();
                          callback.apply(null, [{
                            trend: averageTrend,
                            value: averageValue,
                            date: current.date,
                            isHigh: current.isHigh,
                            isLow: current.isLow
                          }, memValues, history]);
                        }

                      case 7:
                      case "end":
                        return _context8.stop();
                    }
                  }
                }, _callee8);
              })), interval);
              return _context9.abrupt("return", function () {
                return clearInterval(averageInterval);
              });

            case 4:
            case "end":
              return _context9.stop();
          }
        }
      }, _callee9);
    }));

    return function readAveraged(_x, _x2) {
      return _ref10.apply(this, arguments);
    };
  }();

  return {
    observe: observe,
    readRaw: readRaw,
    read: read,
    readAveraged: readAveraged,
    login: login,
    getLogbook: getLogbook
  };
};

exports.LibreLinkUpClient = LibreLinkUpClient;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6WyJMSUJSRV9MSU5LX1NFUlZFUiIsInVybE1hcCIsImxvZ2luIiwiY29ubmVjdGlvbnMiLCJjb3VudHJpZXMiLCJMaWJyZUxpbmtVcENsaWVudCIsInVzZXJuYW1lIiwicGFzc3dvcmQiLCJjb25uZWN0aW9uSWRlbnRpZmllciIsImp3dFRva2VuIiwiY29ubmVjdGlvbklkIiwiaW5zdGFuY2UiLCJheGlvcyIsImNyZWF0ZSIsImJhc2VVUkwiLCJoZWFkZXJzIiwiY29ubmVjdGlvbiIsInByb2R1Y3QiLCJ2ZXJzaW9uIiwiaW50ZXJjZXB0b3JzIiwicmVxdWVzdCIsInVzZSIsImNvbmZpZyIsImF1dGhvcml6YXRpb24iLCJlIiwic3luY2hyb25vdXMiLCJwb3N0IiwiZW1haWwiLCJsb2dpblJlc3BvbnNlIiwiZGF0YSIsInJlZGlyZWN0IiwicmVkaXJlY3RSZXNwb25zZSIsImdldCIsImNvdW50cnlOb2RlcyIsInRhcmdldFJlZ2lvbiIsInJlZ2lvbiIsInJlZ2lvbkRlZmluaXRpb24iLCJyZWdpb25hbE1hcCIsIkVycm9yIiwiT2JqZWN0Iiwia2V5cyIsImpvaW4iLCJkZWZhdWx0cyIsImxzbEFwaSIsImF1dGhUaWNrZXQiLCJ0b2tlbiIsImxvZ2luV3JhcHBlciIsImZ1bmMiLCJnZXRDb25uZWN0aW9ucyIsInJlc3BvbnNlIiwiZ2V0Q29ubmVjdGlvbiIsIm1hdGNoIiwiZmluZCIsImZpcnN0TmFtZSIsImxhc3ROYW1lIiwidG9Mb3dlckNhc2UiLCJwYXRpZW50SWQiLCJjYWxsIiwiZ2V0TG9nYm9vayIsInJhd0xvZ2Jvb2tSZXNwb25zZSIsInRvRGF0ZSIsImRhdGVTdHJpbmciLCJEYXRlIiwibWFwIiwibG9nSXRlbSIsImRhdGUiLCJGYWN0b3J5VGltZXN0YW1wIiwicmVhZFJhdyIsInJlYWQiLCJjdXJyZW50IiwibWFwRGF0YSIsImdsdWNvc2VNZWFzdXJlbWVudCIsImhpc3RvcnkiLCJncmFwaERhdGEiLCJvYnNlcnZlIiwiYXZlcmFnZUludGVydmFsIiwicmVhZEF2ZXJhZ2VkIiwiYW1vdW50IiwiY2FsbGJhY2siLCJpbnRlcnZhbCIsIm1lbSIsIk1hcCIsInNldEludGVydmFsIiwic2V0IiwidG9TdHJpbmciLCJzaXplIiwibWVtVmFsdWVzIiwiQXJyYXkiLCJmcm9tIiwidmFsdWVzIiwiYXZlcmFnZVZhbHVlIiwiTWF0aCIsInJvdW5kIiwicmVkdWNlIiwiYWNjIiwiY3VyIiwidmFsdWUiLCJhdmVyYWdlVHJlbmQiLCJ0cmVuZE1hcCIsInBhcnNlSW50IiwiaW5kZXhPZiIsInRyZW5kIiwidG9GaXhlZCIsImFwcGx5IiwiaXNIaWdoIiwiaXNMb3ciLCJjbGVhckludGVydmFsIl0sInNvdXJjZXMiOlsiLi4vc3JjL2NsaWVudC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgYXhpb3MgZnJvbSAnYXhpb3MnO1xuaW1wb3J0IHsgTGlicmVDZ21EYXRhIH0gZnJvbSAnLi90eXBlcy9jbGllbnQnO1xuaW1wb3J0IHsgQWN0aXZlU2Vuc29yLCBDb25uZWN0aW9uLCBHbHVjb3NlSXRlbSB9IGZyb20gJy4vdHlwZXMvY29ubmVjdGlvbic7XG5pbXBvcnQgeyBDb25uZWN0aW9uc1Jlc3BvbnNlLCBEYXR1bSB9IGZyb20gJy4vdHlwZXMvY29ubmVjdGlvbnMnO1xuaW1wb3J0IHsgQ291bnRyeVJlc3BvbnNlLCBBRSwgUmVnaW9uYWxNYXAgfSBmcm9tICcuL3R5cGVzL2NvdW50cmllcyc7XG5pbXBvcnQgeyBHcmFwaERhdGEgfSBmcm9tICcuL3R5cGVzL2dyYXBoJztcbmltcG9ydCB7IExvZ2luUmVzcG9uc2UsIExvZ2luUmVkaXJlY3RSZXNwb25zZSB9IGZyb20gJy4vdHlwZXMvbG9naW4nO1xuaW1wb3J0IHsgbWFwRGF0YSwgdHJlbmRNYXAgfSBmcm9tICcuL3V0aWxzJztcblxuY29uc3QgTElCUkVfTElOS19TRVJWRVIgPSAnaHR0cHM6Ly9hcGktdXMubGlicmV2aWV3LmlvJztcblxudHlwZSBDbGllbnRBcmdzID0ge1xuICB1c2VybmFtZTogc3RyaW5nO1xuICBwYXNzd29yZDogc3RyaW5nO1xuICBjb25uZWN0aW9uSWRlbnRpZmllcj86IHN0cmluZyB8ICgoY29ubmVjdGlvbnM6IERhdHVtW10pID0+IHN0cmluZyk7XG59O1xuXG50eXBlIFJlYWRSYXdSZXNwb25zZSA9IHtcbiAgY29ubmVjdGlvbjogQ29ubmVjdGlvbjtcbiAgYWN0aXZlU2Vuc29yczogQWN0aXZlU2Vuc29yW107XG4gIGdyYXBoRGF0YTogR2x1Y29zZUl0ZW1bXTtcbn07XG5cbnR5cGUgUmVhZFJlc3BvbnNlID0ge1xuICBjdXJyZW50OiBMaWJyZUNnbURhdGE7XG4gIGhpc3Rvcnk6IExpYnJlQ2dtRGF0YVtdO1xufTtcblxuY29uc3QgdXJsTWFwID0ge1xuICBsb2dpbjogJy9sbHUvYXV0aC9sb2dpbicsXG4gIGNvbm5lY3Rpb25zOiAnL2xsdS9jb25uZWN0aW9ucycsXG4gIGNvdW50cmllczogJy9sbHUvY29uZmlnL2NvdW50cnk/Y291bnRyeT1ERScsXG59O1xuXG5leHBvcnQgY29uc3QgTGlicmVMaW5rVXBDbGllbnQgPSAoe1xuICB1c2VybmFtZSxcbiAgcGFzc3dvcmQsXG4gIGNvbm5lY3Rpb25JZGVudGlmaWVyLFxufTogQ2xpZW50QXJncykgPT4ge1xuICBsZXQgand0VG9rZW46IHN0cmluZyB8IG51bGwgPSBudWxsO1xuICBsZXQgY29ubmVjdGlvbklkOiBzdHJpbmcgfCBudWxsID0gbnVsbDtcblxuICBjb25zdCBpbnN0YW5jZSA9IGF4aW9zLmNyZWF0ZSh7XG4gICAgYmFzZVVSTDogTElCUkVfTElOS19TRVJWRVIsXG4gICAgaGVhZGVyczoge1xuICAgICAgJ2FjY2VwdC1lbmNvZGluZyc6ICdnemlwJyxcbiAgICAgICdjYWNoZS1jb250cm9sJzogJ25vLWNhY2hlJyxcbiAgICAgIGNvbm5lY3Rpb246ICdLZWVwLUFsaXZlJyxcbiAgICAgICdjb250ZW50LXR5cGUnOiAnYXBwbGljYXRpb24vanNvbicsXG4gICAgICBwcm9kdWN0OiAnbGx1LmFuZHJvaWQnLFxuICAgICAgdmVyc2lvbjogJzQuMi4xJyxcbiAgICB9LFxuICB9KTtcbiAgaW5zdGFuY2UuaW50ZXJjZXB0b3JzLnJlcXVlc3QudXNlKFxuICAgIGNvbmZpZyA9PiB7XG4gICAgICBpZiAoand0VG9rZW4gJiYgY29uZmlnLmhlYWRlcnMpIHtcbiAgICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLXBhcmFtLXJlYXNzaWduXG4gICAgICAgIGNvbmZpZy5oZWFkZXJzLmF1dGhvcml6YXRpb24gPSBgQmVhcmVyICR7and0VG9rZW59YDtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIGNvbmZpZztcbiAgICB9LFxuICAgIGUgPT4gZSxcbiAgICB7IHN5bmNocm9ub3VzOiB0cnVlIH1cbiAgKTtcblxuICBjb25zdCBsb2dpbiA9IGFzeW5jICgpOiBQcm9taXNlPExvZ2luUmVzcG9uc2U+ID0+IHtcbiAgICBjb25zdCBsb2dpblJlc3BvbnNlID0gYXdhaXQgaW5zdGFuY2UucG9zdDxcbiAgICAgIExvZ2luUmVzcG9uc2UgfCBMb2dpblJlZGlyZWN0UmVzcG9uc2VcbiAgICA+KHVybE1hcC5sb2dpbiwge1xuICAgICAgZW1haWw6IHVzZXJuYW1lLFxuICAgICAgcGFzc3dvcmQsXG4gICAgfSk7XG5cbiAgICBpZiAoKGxvZ2luUmVzcG9uc2UuZGF0YSBhcyBMb2dpblJlZGlyZWN0UmVzcG9uc2UpLmRhdGEucmVkaXJlY3QpIHtcbiAgICAgIGNvbnN0IHJlZGlyZWN0UmVzcG9uc2UgPSBsb2dpblJlc3BvbnNlLmRhdGEgYXMgTG9naW5SZWRpcmVjdFJlc3BvbnNlO1xuICAgICAgY29uc3QgY291bnRyeU5vZGVzID0gYXdhaXQgaW5zdGFuY2UuZ2V0PENvdW50cnlSZXNwb25zZT4oXG4gICAgICAgIHVybE1hcC5jb3VudHJpZXNcbiAgICAgICk7XG4gICAgICBjb25zdCB0YXJnZXRSZWdpb24gPSByZWRpcmVjdFJlc3BvbnNlLmRhdGEucmVnaW9uIGFzIGtleW9mIFJlZ2lvbmFsTWFwO1xuICAgICAgY29uc3QgcmVnaW9uRGVmaW5pdGlvbjogQUUgfCB1bmRlZmluZWQgPVxuICAgICAgICBjb3VudHJ5Tm9kZXMuZGF0YS5kYXRhLnJlZ2lvbmFsTWFwW3RhcmdldFJlZ2lvbl07XG5cbiAgICAgIGlmICghcmVnaW9uRGVmaW5pdGlvbikge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgYFVuYWJsZSB0byBmaW5kIHJlZ2lvbiAnJHtyZWRpcmVjdFJlc3BvbnNlLmRhdGEucmVnaW9ufScuIFxuICAgICAgICAgIEF2YWlsYWJsZSBub2RlcyBhcmUgJHtPYmplY3Qua2V5cyhcbiAgICAgICAgICAgIGNvdW50cnlOb2Rlcy5kYXRhLmRhdGEucmVnaW9uYWxNYXBcbiAgICAgICAgICApLmpvaW4oJywgJyl9LmBcbiAgICAgICAgKTtcbiAgICAgIH1cblxuICAgICAgaW5zdGFuY2UuZGVmYXVsdHMuYmFzZVVSTCA9IHJlZ2lvbkRlZmluaXRpb24ubHNsQXBpO1xuICAgICAgcmV0dXJuIGxvZ2luKCk7XG4gICAgfVxuICAgIGp3dFRva2VuID0gKGxvZ2luUmVzcG9uc2UuZGF0YSBhcyBMb2dpblJlc3BvbnNlKS5kYXRhLmF1dGhUaWNrZXQudG9rZW47XG5cbiAgICByZXR1cm4gbG9naW5SZXNwb25zZS5kYXRhIGFzIExvZ2luUmVzcG9uc2U7XG4gIH07XG5cbiAgY29uc3QgbG9naW5XcmFwcGVyID1cbiAgICA8UmV0dXJuPihmdW5jOiAoKSA9PiBQcm9taXNlPFJldHVybj4pID0+XG4gICAgYXN5bmMgKCk6IFByb21pc2U8UmV0dXJuPiA9PiB7XG4gICAgICB0cnkge1xuICAgICAgICBpZiAoIWp3dFRva2VuKSBhd2FpdCBsb2dpbigpO1xuICAgICAgICByZXR1cm4gZnVuYygpO1xuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBhd2FpdCBsb2dpbigpO1xuICAgICAgICByZXR1cm4gZnVuYygpO1xuICAgICAgfVxuICAgIH07XG5cbiAgY29uc3QgZ2V0Q29ubmVjdGlvbnMgPSBsb2dpbldyYXBwZXI8Q29ubmVjdGlvbnNSZXNwb25zZT4oYXN5bmMgKCkgPT4ge1xuICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgaW5zdGFuY2UuZ2V0PENvbm5lY3Rpb25zUmVzcG9uc2U+KFxuICAgICAgdXJsTWFwLmNvbm5lY3Rpb25zXG4gICAgKTtcblxuICAgIHJldHVybiByZXNwb25zZS5kYXRhO1xuICB9KTtcblxuICBjb25zdCBnZXRDb25uZWN0aW9uID0gKGNvbm5lY3Rpb25zOiBEYXR1bVtdKTogc3RyaW5nID0+IHtcbiAgICBpZiAodHlwZW9mIGNvbm5lY3Rpb25JZGVudGlmaWVyID09PSAnc3RyaW5nJykge1xuICAgICAgY29uc3QgbWF0Y2ggPSBjb25uZWN0aW9ucy5maW5kKFxuICAgICAgICAoeyBmaXJzdE5hbWUsIGxhc3ROYW1lIH0pID0+XG4gICAgICAgICAgYCR7Zmlyc3ROYW1lfSAke2xhc3ROYW1lfWAudG9Mb3dlckNhc2UoKSA9PT1cbiAgICAgICAgICBjb25uZWN0aW9uSWRlbnRpZmllci50b0xvd2VyQ2FzZSgpXG4gICAgICApO1xuXG4gICAgICBpZiAoIW1hdGNoKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICBgVW5hYmxlIHRvIGlkZW50aWZ5IGNvbm5lY3Rpb24gYnkgZ2l2ZW4gbmFtZSAnJHtjb25uZWN0aW9uSWRlbnRpZmllcn0nLmBcbiAgICAgICAgKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIG1hdGNoLnBhdGllbnRJZDtcbiAgICB9XG4gICAgaWYgKHR5cGVvZiBjb25uZWN0aW9uSWRlbnRpZmllciA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgY29uc3QgbWF0Y2ggPSBjb25uZWN0aW9uSWRlbnRpZmllci5jYWxsKG51bGwsIGNvbm5lY3Rpb25zKTtcblxuICAgICAgaWYgKCFtYXRjaCkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFVuYWJsZSB0byBpZGVudGlmeSBjb25uZWN0aW9uIGJ5IGdpdmVuIG5hbWUgZnVuY3Rpb25gKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIG1hdGNoO1xuICAgIH1cblxuICAgIHJldHVybiBjb25uZWN0aW9uc1swXS5wYXRpZW50SWQ7XG4gIH07XG5cbiAgY29uc3QgZ2V0TG9nYm9vayA9IGxvZ2luV3JhcHBlcihhc3luYyAoKSA9PiB7XG4gICAgaWYgKCFjb25uZWN0aW9uSWQpIHtcbiAgICAgIGNvbnN0IGNvbm5lY3Rpb25zID0gYXdhaXQgZ2V0Q29ubmVjdGlvbnMoKTtcbiAgICAgIGNvbm5lY3Rpb25JZCA9IGdldENvbm5lY3Rpb24oY29ubmVjdGlvbnMuZGF0YSk7XG4gICAgfVxuXG4gICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBpbnN0YW5jZS5nZXQ8R3JhcGhEYXRhPihcbiAgICAgIGAke3VybE1hcC5jb25uZWN0aW9uc30vJHtjb25uZWN0aW9uSWR9L2xvZ2Jvb2tgXG4gICAgKTtcblxuICAgIGNvbnN0IHJhd0xvZ2Jvb2tSZXNwb25zZSA9IHJlc3BvbnNlLmRhdGEuZGF0YSBhcyBhbnk7XG4gICAgY29uc3QgdG9EYXRlID0gKGRhdGVTdHJpbmc6IHN0cmluZyk6IERhdGUgPT4gbmV3IERhdGUoZGF0ZVN0cmluZyk7XG5cbiAgICByZXR1cm4gcmF3TG9nYm9va1Jlc3BvbnNlLm1hcCgobG9nSXRlbTogYW55KSA9PiAoe1xuICAgICAgLi4ubG9nSXRlbSxcbiAgICAgIGRhdGU6IHRvRGF0ZShgJHtsb2dJdGVtLkZhY3RvcnlUaW1lc3RhbXB9IFVUQ2ApLFxuICAgIH0pKTtcbiAgfSk7XG5cbiAgY29uc3QgcmVhZFJhdyA9IGxvZ2luV3JhcHBlcjxSZWFkUmF3UmVzcG9uc2U+KGFzeW5jICgpID0+IHtcbiAgICBpZiAoIWNvbm5lY3Rpb25JZCkge1xuICAgICAgY29uc3QgY29ubmVjdGlvbnMgPSBhd2FpdCBnZXRDb25uZWN0aW9ucygpO1xuXG4gICAgICBjb25uZWN0aW9uSWQgPSBnZXRDb25uZWN0aW9uKGNvbm5lY3Rpb25zLmRhdGEpO1xuICAgIH1cblxuICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgaW5zdGFuY2UuZ2V0PEdyYXBoRGF0YT4oXG4gICAgICBgJHt1cmxNYXAuY29ubmVjdGlvbnN9LyR7Y29ubmVjdGlvbklkfS9ncmFwaGBcbiAgICApO1xuXG4gICAgcmV0dXJuIHJlc3BvbnNlLmRhdGEuZGF0YTtcbiAgfSk7XG5cbiAgY29uc3QgcmVhZCA9IGFzeW5jICgpOiBQcm9taXNlPFJlYWRSZXNwb25zZT4gPT4ge1xuICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgcmVhZFJhdygpO1xuXG4gICAgcmV0dXJuIHtcbiAgICAgIGN1cnJlbnQ6IG1hcERhdGEocmVzcG9uc2UuY29ubmVjdGlvbi5nbHVjb3NlTWVhc3VyZW1lbnQpLFxuICAgICAgaGlzdG9yeTogcmVzcG9uc2UuZ3JhcGhEYXRhLm1hcChtYXBEYXRhKSxcbiAgICB9O1xuICB9O1xuXG4gIGNvbnN0IG9ic2VydmUgPSBhc3luYyAoKSA9PiB7XG4gICAgLy8gQHRvZG9cbiAgfTtcblxuICBsZXQgYXZlcmFnZUludGVydmFsOiBOb2RlSlMuVGltZXI7XG4gIGNvbnN0IHJlYWRBdmVyYWdlZCA9IGFzeW5jIChcbiAgICBhbW91bnQ6IG51bWJlcixcbiAgICBjYWxsYmFjazogKFxuICAgICAgYXZlcmFnZTogTGlicmVDZ21EYXRhLFxuICAgICAgbWVtb3J5OiBMaWJyZUNnbURhdGFbXSxcbiAgICAgIGhpc3Rvcnk6IExpYnJlQ2dtRGF0YVtdXG4gICAgKSA9PiB2b2lkLFxuICAgIGludGVydmFsID0gMTUwMDBcbiAgKSA9PiB7XG4gICAgbGV0IG1lbTogTWFwPHN0cmluZywgTGlicmVDZ21EYXRhPiA9IG5ldyBNYXAoKTtcblxuICAgIGF2ZXJhZ2VJbnRlcnZhbCA9IHNldEludGVydmFsKGFzeW5jICgpID0+IHtcbiAgICAgIGNvbnN0IHsgY3VycmVudCwgaGlzdG9yeSB9ID0gYXdhaXQgcmVhZCgpO1xuICAgICAgbWVtLnNldChjdXJyZW50LmRhdGUudG9TdHJpbmcoKSwgY3VycmVudCk7XG5cbiAgICAgIGlmIChtZW0uc2l6ZSA9PT0gYW1vdW50KSB7XG4gICAgICAgIGNvbnN0IG1lbVZhbHVlcyA9IEFycmF5LmZyb20obWVtLnZhbHVlcygpKTtcbiAgICAgICAgY29uc3QgYXZlcmFnZVZhbHVlID0gTWF0aC5yb3VuZChcbiAgICAgICAgICBtZW1WYWx1ZXMucmVkdWNlKChhY2MsIGN1cikgPT4gYWNjICsgY3VyLnZhbHVlLCAwKSAvIGFtb3VudFxuICAgICAgICApO1xuICAgICAgICBjb25zdCBhdmVyYWdlVHJlbmQgPVxuICAgICAgICAgIHRyZW5kTWFwW1xuICAgICAgICAgICAgcGFyc2VJbnQoXG4gICAgICAgICAgICAgIChcbiAgICAgICAgICAgICAgICBNYXRoLnJvdW5kKFxuICAgICAgICAgICAgICAgICAgKG1lbVZhbHVlcy5yZWR1Y2UoXG4gICAgICAgICAgICAgICAgICAgIChhY2MsIGN1cikgPT4gYWNjICsgdHJlbmRNYXAuaW5kZXhPZihjdXIudHJlbmQpLFxuICAgICAgICAgICAgICAgICAgICAwXG4gICAgICAgICAgICAgICAgICApIC9cbiAgICAgICAgICAgICAgICAgICAgYW1vdW50KSAqXG4gICAgICAgICAgICAgICAgICAgIDEwMFxuICAgICAgICAgICAgICAgICkgLyAxMDBcbiAgICAgICAgICAgICAgKS50b0ZpeGVkKDApLFxuICAgICAgICAgICAgICAxMFxuICAgICAgICAgICAgKVxuICAgICAgICAgIF07XG5cbiAgICAgICAgbWVtID0gbmV3IE1hcCgpO1xuICAgICAgICBjYWxsYmFjay5hcHBseShudWxsLCBbXG4gICAgICAgICAge1xuICAgICAgICAgICAgdHJlbmQ6IGF2ZXJhZ2VUcmVuZCxcbiAgICAgICAgICAgIHZhbHVlOiBhdmVyYWdlVmFsdWUsXG4gICAgICAgICAgICBkYXRlOiBjdXJyZW50LmRhdGUsXG4gICAgICAgICAgICBpc0hpZ2g6IGN1cnJlbnQuaXNIaWdoLFxuICAgICAgICAgICAgaXNMb3c6IGN1cnJlbnQuaXNMb3csXG4gICAgICAgICAgfSxcbiAgICAgICAgICBtZW1WYWx1ZXMsXG4gICAgICAgICAgaGlzdG9yeSxcbiAgICAgICAgXSk7XG4gICAgICB9XG4gICAgfSwgaW50ZXJ2YWwpO1xuXG4gICAgcmV0dXJuICgpID0+IGNsZWFySW50ZXJ2YWwoYXZlcmFnZUludGVydmFsKTtcbiAgfTtcblxuICByZXR1cm4ge1xuICAgIG9ic2VydmUsXG4gICAgcmVhZFJhdyxcbiAgICByZWFkLFxuICAgIHJlYWRBdmVyYWdlZCxcbiAgICBsb2dpbixcbiAgICBnZXRMb2dib29rLFxuICB9O1xufTtcbiJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7O0FBQUE7O0FBT0E7Ozs7OztBQUVBLElBQU1BLGlCQUFpQixHQUFHLDZCQUExQjtBQW1CQSxJQUFNQyxNQUFNLEdBQUc7RUFDYkMsS0FBSyxFQUFFLGlCQURNO0VBRWJDLFdBQVcsRUFBRSxrQkFGQTtFQUdiQyxTQUFTLEVBQUU7QUFIRSxDQUFmOztBQU1PLElBQU1DLGlCQUFpQixHQUFHLFNBQXBCQSxpQkFBb0IsT0FJZjtFQUFBLElBSGhCQyxRQUdnQixRQUhoQkEsUUFHZ0I7RUFBQSxJQUZoQkMsUUFFZ0IsUUFGaEJBLFFBRWdCO0VBQUEsSUFEaEJDLG9CQUNnQixRQURoQkEsb0JBQ2dCO0VBQ2hCLElBQUlDLFFBQXVCLEdBQUcsSUFBOUI7RUFDQSxJQUFJQyxZQUEyQixHQUFHLElBQWxDOztFQUVBLElBQU1DLFFBQVEsR0FBR0MsaUJBQUEsQ0FBTUMsTUFBTixDQUFhO0lBQzVCQyxPQUFPLEVBQUVkLGlCQURtQjtJQUU1QmUsT0FBTyxFQUFFO01BQ1AsbUJBQW1CLE1BRFo7TUFFUCxpQkFBaUIsVUFGVjtNQUdQQyxVQUFVLEVBQUUsWUFITDtNQUlQLGdCQUFnQixrQkFKVDtNQUtQQyxPQUFPLEVBQUUsYUFMRjtNQU1QQyxPQUFPLEVBQUU7SUFORjtFQUZtQixDQUFiLENBQWpCOztFQVdBUCxRQUFRLENBQUNRLFlBQVQsQ0FBc0JDLE9BQXRCLENBQThCQyxHQUE5QixDQUNFLFVBQUFDLE1BQU0sRUFBSTtJQUNS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