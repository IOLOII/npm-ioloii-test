(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.Jvp = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

function EventEmitter() {
  this._events = this._events || {};
  this._maxListeners = this._maxListeners || undefined;
}
module.exports = EventEmitter;

// Backwards-compat with node 0.10.x
EventEmitter.EventEmitter = EventEmitter;

EventEmitter.prototype._events = undefined;
EventEmitter.prototype._maxListeners = undefined;

// By default EventEmitters will print a warning if more than 10 listeners are
// added to it. This is a useful default which helps finding memory leaks.
EventEmitter.defaultMaxListeners = 10;

// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
EventEmitter.prototype.setMaxListeners = function(n) {
  if (!isNumber(n) || n < 0 || isNaN(n))
    throw TypeError('n must be a positive number');
  this._maxListeners = n;
  return this;
};

EventEmitter.prototype.emit = function(type) {
  var er, handler, len, args, i, listeners;

  if (!this._events)
    this._events = {};

  // If there is no 'error' event listener then throw.
  if (type === 'error') {
    if (!this._events.error ||
        (isObject(this._events.error) && !this._events.error.length)) {
      er = arguments[1];
      if (er instanceof Error) {
        throw er; // Unhandled 'error' event
      } else {
        // At least give some kind of context to the user
        var err = new Error('Uncaught, unspecified "error" event. (' + er + ')');
        err.context = er;
        throw err;
      }
    }
  }

  handler = this._events[type];

  if (isUndefined(handler))
    return false;

  if (isFunction(handler)) {
    switch (arguments.length) {
      // fast cases
      case 1:
        handler.call(this);
        break;
      case 2:
        handler.call(this, arguments[1]);
        break;
      case 3:
        handler.call(this, arguments[1], arguments[2]);
        break;
      // slower
      default:
        args = Array.prototype.slice.call(arguments, 1);
        handler.apply(this, args);
    }
  } else if (isObject(handler)) {
    args = Array.prototype.slice.call(arguments, 1);
    listeners = handler.slice();
    len = listeners.length;
    for (i = 0; i < len; i++)
      listeners[i].apply(this, args);
  }

  return true;
};

EventEmitter.prototype.addListener = function(type, listener) {
  var m;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events)
    this._events = {};

  // To avoid recursion in the case that type === "newListener"! Before
  // adding it to the listeners, first emit "newListener".
  if (this._events.newListener)
    this.emit('newListener', type,
              isFunction(listener.listener) ?
              listener.listener : listener);

  if (!this._events[type])
    // Optimize the case of one listener. Don't need the extra array object.
    this._events[type] = listener;
  else if (isObject(this._events[type]))
    // If we've already got an array, just append.
    this._events[type].push(listener);
  else
    // Adding the second element, need to change to array.
    this._events[type] = [this._events[type], listener];

  // Check for listener leak
  if (isObject(this._events[type]) && !this._events[type].warned) {
    if (!isUndefined(this._maxListeners)) {
      m = this._maxListeners;
    } else {
      m = EventEmitter.defaultMaxListeners;
    }

    if (m && m > 0 && this._events[type].length > m) {
      this._events[type].warned = true;
      console.error('(node) warning: possible EventEmitter memory ' +
                    'leak detected. %d listeners added. ' +
                    'Use emitter.setMaxListeners() to increase limit.',
                    this._events[type].length);
      if (typeof console.trace === 'function') {
        // not supported in IE 10
        console.trace();
      }
    }
  }

  return this;
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.once = function(type, listener) {
  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  var fired = false;

  function g() {
    this.removeListener(type, g);

    if (!fired) {
      fired = true;
      listener.apply(this, arguments);
    }
  }

  g.listener = listener;
  this.on(type, g);

  return this;
};

// emits a 'removeListener' event iff the listener was removed
EventEmitter.prototype.removeListener = function(type, listener) {
  var list, position, length, i;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events || !this._events[type])
    return this;

  list = this._events[type];
  length = list.length;
  position = -1;

  if (list === listener ||
      (isFunction(list.listener) && list.listener === listener)) {
    delete this._events[type];
    if (this._events.removeListener)
      this.emit('removeListener', type, listener);

  } else if (isObject(list)) {
    for (i = length; i-- > 0;) {
      if (list[i] === listener ||
          (list[i].listener && list[i].listener === listener)) {
        position = i;
        break;
      }
    }

    if (position < 0)
      return this;

    if (list.length === 1) {
      list.length = 0;
      delete this._events[type];
    } else {
      list.splice(position, 1);
    }

    if (this._events.removeListener)
      this.emit('removeListener', type, listener);
  }

  return this;
};

EventEmitter.prototype.removeAllListeners = function(type) {
  var key, listeners;

  if (!this._events)
    return this;

  // not listening for removeListener, no need to emit
  if (!this._events.removeListener) {
    if (arguments.length === 0)
      this._events = {};
    else if (this._events[type])
      delete this._events[type];
    return this;
  }

  // emit removeListener for all listeners on all events
  if (arguments.length === 0) {
    for (key in this._events) {
      if (key === 'removeListener') continue;
      this.removeAllListeners(key);
    }
    this.removeAllListeners('removeListener');
    this._events = {};
    return this;
  }

  listeners = this._events[type];

  if (isFunction(listeners)) {
    this.removeListener(type, listeners);
  } else if (listeners) {
    // LIFO order
    while (listeners.length)
      this.removeListener(type, listeners[listeners.length - 1]);
  }
  delete this._events[type];

  return this;
};

EventEmitter.prototype.listeners = function(type) {
  var ret;
  if (!this._events || !this._events[type])
    ret = [];
  else if (isFunction(this._events[type]))
    ret = [this._events[type]];
  else
    ret = this._events[type].slice();
  return ret;
};

EventEmitter.prototype.listenerCount = function(type) {
  if (this._events) {
    var evlistener = this._events[type];

    if (isFunction(evlistener))
      return 1;
    else if (evlistener)
      return evlistener.length;
  }
  return 0;
};

EventEmitter.listenerCount = function(emitter, type) {
  return emitter.listenerCount(type);
};

function isFunction(arg) {
  return typeof arg === 'function';
}

function isNumber(arg) {
  return typeof arg === 'number';
}

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}

function isUndefined(arg) {
  return arg === void 0;
}

},{}],2:[function(require,module,exports){
'use strict';Object.defineProperty(exports, "__esModule", { value: true });var _createClass = function () {function defineProperties(target, props) {for (var i = 0; i < props.length; i++) {var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}return function (Constructor, protoProps, staticProps) {if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;};}();

var _events = require('../events');var _events2 = _interopRequireDefault(_events);
var _eventHandler = require('../event-handler');var _eventHandler2 = _interopRequireDefault(_eventHandler);
var _errors = require('../errors');function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}function _classCallCheck(instance, Constructor) {if (!(instance instanceof Constructor)) {throw new TypeError("Cannot call a class as a function");}}function _possibleConstructorReturn(self, call) {if (!self) {throw new ReferenceError("this hasn't been initialised - super() hasn't been called");}return call && (typeof call === "object" || typeof call === "function") ? call : self;}function _inherits(subClass, superClass) {if (typeof superClass !== "function" && superClass !== null) {throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);}subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } });if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;} /** Buffer Controller */var

BufferController = function (_EventHandler) {_inherits(BufferController, _EventHandler);

  function BufferController(jvp) {_classCallCheck(this, BufferController);var _this = _possibleConstructorReturn(this, (BufferController.__proto__ || Object.getPrototypeOf(BufferController)).call(this,
    jvp,
    _events2.default.MEDIA_ATTACHING,
    _events2.default.BUFFER_APPENDING,
    _events2.default.BUFFER_RESET));


    _this.media = null;
    _this.mediaSource = null;
    _this.sourceBuffer = {};
    _this.segments = [];
    _this.appended = 0;
    _this._msDuration = null;

    // Source Buffer listeners
    _this.onsbue = _this.onSBUpdateEnd.bind(_this);
    _this.onsbe = _this.onSBUpdateError.bind(_this);
    _this.pendingTracks = {}; // not used.
    _this.tracks = {};

    _this.mediaType = 'H264Raw';
    _this.channelName = undefined;
    _this.websocketProtocol = undefined;
    _this.websocketIp = undefined;
    _this.websocketPort = undefined;
    _this.websocketName = undefined;
    _this.wsParams = undefined;return _this;
  }_createClass(BufferController, [{ key: 'destroy', value: function destroy()

    {
      _eventHandler2.default.prototype.destroy.call(this);
    }

    /////////////////////////////////////////////////////////////////////////////////////////////////
  }, { key: 'onMediaAttaching', value: function onMediaAttaching(
    data) {
      var media = this.media = data.media;
      this.mediaType = data.mediaType;
      this.channelName = data.channelName;
      this.websocketProtocol = data.websocketProtocol;
      this.websocketIp = data.websocketIP;
      this.websocketPort = data.websocketPort;
      this.websocketName = data.websocketName;
      this.wsParams = data.wsParams;
      if (media) {
        // setup the media source
        var ms = this.mediaSource = new MediaSource();

        //Media Source listeners
        this.onmso = this.onMediaSourceOpen.bind(this);
        this.onmse = this.onMediaSourceEnded.bind(this);
        this.onmsc = this.onMediaSourceClose.bind(this);
        ms.addEventListener('sourceopen', this.onmso);
        ms.addEventListener('sourceended', this.onmse);
        ms.addEventListener('sourceclose', this.onmsc);

        // link video and media Source
        media.src = URL.createObjectURL(ms);
      }
    }

    // { type: trackName, data: initSegment, parent: 'main' }
  }, { key: 'onBufferAppending', value: function onBufferAppending(data) {
      if (!this.segments) {
        this.segments = [data];
      } else {
        this.segments.push(data);
      }
      this.doAppending();
    } }, { key: 'onBufferReset', value: function onBufferReset(

    tracks) {
      var sourceBuffer = this.sourceBuffer;
      for (var type in sourceBuffer) {
        var sb = sourceBuffer[type];
        try {
          this.mediaSource.removeSourceBuffer(sb);
          sb.removeEventListener('updateend', this.onsbue);
          sb.removeEventListener('error', this.onsbe);
        } catch (err) {
        }
      }
      this.sourceBuffer = {};
      this.flushRange = [];
      this.segments = [];
      this.appended = 0;

      if (this.mediaType === 'H264Raw') {
        this.createSourceBuffers(tracks); //{ tracks: 'video', mimeType: data.mimeType, avFlagIS: data.avFlagIS });
      }
      if (this.mediaType === 'JTT1078') {
        this.createSourceBuffers(tracks); //{ tracks: 'video', mimeType: data.mimeType, avFlagIS: data.avFlagIS });
      }
      this.jvp.trigger(_events2.default.UI_EVENT, { eventName: 'BufferReset' });
    }

    /////////////////////////////////////////////////////////////////////////////////////////////////
  }, { key: 'onMediaSourceOpen', value: function onMediaSourceOpen()
    {
      var mediaSource = this.mediaSource;
      if (mediaSource) {
        // once received, don't listen anymore to sourceopen event
        mediaSource.removeEventListener('sourceopen', this.onmso);
      }

      if (this.mediaType === 'FMp4') {
        this.checkPendingTracks();
      }

      this.jvp.trigger(_events2.default.MEDIA_ATTACHED, {
        media: this.media,
        channelName: this.channelName,
        mediaType: this.mediaType,
        websocketProtocol: this.websocketProtocol,
        websocketIp: this.websocketIp,
        websocketPort: this.websocketPort,
        websocketName: this.websocketName,
        wsParams: this.wsParams });

    } }, { key: 'onMediaSourceEnded', value: function onMediaSourceEnded()

    {
      console.log('media source ended');
    } }, { key: 'onMediaSourceClose', value: function onMediaSourceClose()

    {
      console.log('media source closed');
    }

    /////////////////////////////////////////////////////////////////////////////////////////////////
  }, { key: 'onSBUpdateEnd', value: function onSBUpdateEnd(
    event) {
      if (this.jvp.browserType === 1) {// Firefox
        this.mediaSource.endOfStream();
        this.media.play();
      }
      this.appending = false;
      this.doAppending();
      this.jvp.trigger(_events2.default.UI_PLAYING, {});
    } }, { key: 'onSBUpdateError', value: function onSBUpdateError(

    event) {
      console.log('sourceBuffer error:', event);
      // according to http://www.w3.org/TR/media-source/#sourcebuffer-append-error
      // this error might not always be fatal (it is fatal if decode error is set, in that case
      // it will be followed by a mediaElement error ...)
      this.jvp.trigger(_events2.default.ERROR, { type: _errors.ErrorTypes.MEDIA_ERROR, details: _errors.ErrorDetails.BUFFER_APPENDING_ERROR, fatal: false });
      // we don't need to do more than that, as accordin to the spec, updateend will be fired just after
    }

    /////////////////////////////////////////////////////////////////////////////////////////////////
  }, { key: 'checkPendingTracks', value: function checkPendingTracks()
    {
      this.createSourceBuffers({ tracks: 'video', mimeType: '' });
      this.pendingTracks = {}; // not used.
    }

    // { tracks: 'video', mimeType: data.mimeType, buffer: mediaSource.addSourceBuffer(mimeType)}
  }, { key: 'createSourceBuffers', value: function createSourceBuffers(tracks) {
      var sourceBuffer = this.sourceBuffer,mediaSource = this.mediaSource;

      var success = true;
      for (var trackName in tracks) {
        if (!sourceBuffer[trackName]) {

          var track = tracks[trackName];
          var codec = track.levelCodec || track.codec; // use levelCodec as first priority
          var mimeType = track.container + ';codecs=' + codec;
          console.log('creating sourceBuffer(' + mimeType + ')');

          try {
            var sb = sourceBuffer[trackName] = mediaSource.addSourceBuffer(mimeType);
            sb.addEventListener('updateend', this.onsbue);
            sb.addEventListener('error', this.onsbe);
            this.tracks[trackName] = { codec: codec, container: track.container };
            track.buffer = sb;
          }
          catch (err) {
            success = false;
            console.log('error while trying to add sourceBuffer:' + err.message);
            this.jvp.trigger(_events2.default.ERROR, { type: _errors.ErrorTypes.MEDIA_ERROR, details: _errors.ErrorDetails.BUFFER_ADD_CODEC_ERROR, fatal: false, err: err, mimeType: mimeType });
          }
        }
      }

      if (success) {
        console.log("createSourceBuffers OK");
        this.jvp.trigger(_events2.default.BUFFER_CREATED, { tracks: tracks });
        this.media.loop = false;
        this.media.play();
      }
    }

    // { type: trackName, data: initSegment, parent: 'main' }
    // segments = [{type, data}], type='video'
  }, { key: 'doAppending', value: function doAppending() {
      var jvp = this.jvp,sourceBuffer = this.sourceBuffer,segments = this.segments;
      if (Object.keys(sourceBuffer).length) {

        if (this.media.error) {
          this.segments = [];
          console.log('trying to append although a media error occured, flush segment and abort');
          return;
        }
        if (this.appending) {
          return;
        }

        if (segments && segments.length) {
          var segment = segments.shift();
          //this.jvp.priintBinaryArray(segment.data, this.websocketName);

          try {
            if (sourceBuffer[segment.type]) {
              this.parent = segment.parent;
              sourceBuffer[segment.type].appendBuffer(segment.data);
              this.appendError = 0;
              this.appended++;
              this.appending = true;
            } else {
              // do nothing
            }
          } catch (err) {
            // in case any error occured while appending, put back segment in segments table 
            segments.unshift(segment);
            var event = { type: _errors.ErrorTypes.MEDIA_ERROR };
            if (err.code !== 22) {
              if (this.appendError) {
                this.appendError++;
              } else {
                this.appendError = 1;
              }

              event.details = _errors.ErrorDetails.BUFFER_APPEND_ERROR;
              event.frag = this.fragCurrent;
              if (this.appendError > jvp.config.appendErrorMaxRetry) {
                segments = [];
                event.fatal = true;
                return;
              } else {
                event.fatal = false;
              }
            } else {
              this.segments = [];
              event.details = _errors.ErrorDetails.BUFFER_FULL_ERROR;
              return;
            }
          }
        } // end of if (segments && segments.length)
      }
    } }]);return BufferController;}(_eventHandler2.default);exports.default =


BufferController;

},{"../errors":9,"../event-handler":10,"../events":11}],3:[function(require,module,exports){
'use strict';Object.defineProperty(exports, "__esModule", { value: true });var _createClass = function () {function defineProperties(target, props) {for (var i = 0; i < props.length; i++) {var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}return function (Constructor, protoProps, staticProps) {if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;};}();

var _events = require('../events');var _events2 = _interopRequireDefault(_events);
var _eventHandler = require('../event-handler');var _eventHandler2 = _interopRequireDefault(_eventHandler);function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}function _classCallCheck(instance, Constructor) {if (!(instance instanceof Constructor)) {throw new TypeError("Cannot call a class as a function");}}function _possibleConstructorReturn(self, call) {if (!self) {throw new ReferenceError("this hasn't been initialised - super() hasn't been called");}return call && (typeof call === "object" || typeof call === "function") ? call : self;}function _inherits(subClass, superClass) {if (typeof superClass !== "function" && superClass !== null) {throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);}subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } });if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;} /** Flow Controller */var

FlowController = function (_EventHandler) {_inherits(FlowController, _EventHandler);

  function FlowController(jvp) {_classCallCheck(this, FlowController);var _this = _possibleConstructorReturn(this, (FlowController.__proto__ || Object.getPrototypeOf(FlowController)).call(this,
    jvp,
    _events2.default.MEDIA_ATTACHED,
    _events2.default.BUFFER_CREATED,
    _events2.default.WEBSOCKET_ATTACHED,
    _events2.default.FRAG_PARSING_DATA,
    _events2.default.FRAG_PARSING_INIT_SEGMENT));

    _this.fileStart = 0;
    _this.fileEnd = 0;
    _this.pendingAppending = 0;
    _this.mediaType = undefined;
    _this.channelName;return _this;
  }_createClass(FlowController, [{ key: 'destroy', value: function destroy()

    {
      _eventHandler2.default.prototype.destroy.call(this);
    }

    /////////////////////////////////////////////////////////////////////////////////////////////////
  }, { key: 'onMediaAttached', value: function onMediaAttached(
    data) {
      this.mediaType = data.mediaType;
      if (!data.websocketProtocol || !data.websocketIp || !data.websocketPort || !data.websocketName) {
        console.log('websocket parameter ERROE!!! current url is ' + '' + data.websocketProtocol + '://' + data.websocketIp + ':' + data.websocketPort + '/' + data.websocketName + '?' + data.wsParams);
        return;
      }

      var url = '' + data.websocketProtocol + '://' + data.websocketIp + ':' + data.websocketPort + '/' + data.websocketName + '?' + data.wsParams;
      console.log('current url is ' + url);

      if (data.websocketProtocol == 'ws') {
        //var client = new WebSocket('ws://localhost:8888' + '/' + data.websocketName);
        var client = new WebSocket(url);
        this.jvp.trigger(_events2.default.WEBSOCKET_ATTACHING, { websocket: client, mediaType: data.mediaType, channelName: data.channelName, websocketName: data.websocketName });
      } else
      if (data.websocketProtocol == 'http') {
        var eurl = encodeURI(url);
        if (typeof XMLHttpRequest != "undefined") {
          // chrome
          if (this.jvp.browserType == 2) {
            this.jvp.trigger(_events2.default.WEBSOCKET_ATTACHING, { websocket: eurl, mediaType: data.mediaType, channelName: data.channelName, websocketName: data.websocketName });
            console.log("http chrome ready use fetch ");
          } else
          {
            var xhr = new XMLHttpRequest();
            xhr.open("GET", eurl, true);
            this.jvp.trigger(_events2.default.WEBSOCKET_ATTACHING, { websocket: xhr, mediaType: data.mediaType, channelName: data.channelName, websocketName: data.websocketName });
            console.log("http create XMLHttpRequest OK, browserType=" + this.jvp.browserType);
          }
        } else
        {
          console.log("Browser don't support XMLHttpRequest!");
        }
      } else
      {
        console.log('websocketProtocol ERROE!!! current websocketProtocol is ' + data.websocketProtocol);
      }
    }

    // // { tracks: 'video', mimeType: data.mimeType, buffer: mediaSource.addSourceBuffer(mimeType)}
  }, { key: 'onBufferCreated', value: function onBufferCreated(data) {
    }

    /////////////////////////////////////////////////////////////////////////////////////////////////
  }, { key: 'onWebsocketAttached', value: function onWebsocketAttached(
    data) {
      this.jvp.trigger(_events2.default.BUFFER_APPENDING, { type: 'video', data: data.payload, parent: 'main' });
    }

    /////////////////////////////////////////////////////////////////////////////////////////////////

    // { id: this.id, level: this.level, sn: this.sn, tracks: tracks, unique: false }
    // tracks.audio = { container: 'audio/mp4', codec: audioTrack.codec, initSegment: MP4.initSegment([audioTrack]), metadata: { channelCount: audioTrack.channelCount } };
    // tracks.video = { container: 'video/mp4', codec: videoTrack.codec, initSegment: MP4.initSegment([videoTrack]), metadata: { width: videoTrack.width, height: videoTrack.height } };
  }, { key: 'onFragParsingInitSegment', value: function onFragParsingInitSegment(data) {
      var tracks = data.tracks,trackName,track;

      track = tracks.video;
      if (track) {
        track.id = data.id;
      }

      for (trackName in tracks) {
        track = tracks[trackName];
        var initSegment = track.initSegment;
        if (initSegment) {
          this.pendingAppending++;
          this.jvp.trigger(_events2.default.BUFFER_APPENDING, { type: trackName, data: initSegment, parent: 'main' });
        }
      }
    }

    // { id: this.id, level: this.level, sn: this.sn, data1: moof, data2: mdat, startPTS: ptsnorm, endPTS: ptsnorm, startDTS: dtsnorm, endDTS: dtsnorm, type: 'video', nb: outputSamples.length, dropped: dropped };
  }, { key: 'onFragParsingData', value: function onFragParsingData(data) {var _this2 = this;
      [data.data1, data.data2].forEach(function (buffer) {
        if (buffer) {
          _this2.pendingAppending++;
          _this2.jvp.trigger(_events2.default.BUFFER_APPENDING, { type: data.type, data: buffer, parent: 'main', curFragFrameType: data.curDataType });
        }
      });
    } }]);return FlowController;}(_eventHandler2.default);exports.default =


FlowController;

},{"../event-handler":10,"../events":11}],4:[function(require,module,exports){
'use strict';Object.defineProperty(exports, "__esModule", { value: true });var _createClass = function () {function defineProperties(target, props) {for (var i = 0; i < props.length; i++) {var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}return function (Constructor, protoProps, staticProps) {if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;};}(); /*** Parser for exponential Golomb codes, a variable-bitwidth number encoding scheme used by h264. */

var _logger = require('../utils/logger');function _classCallCheck(instance, Constructor) {if (!(instance instanceof Constructor)) {throw new TypeError("Cannot call a class as a function");}}var

ExpGolomb = function () {

  function ExpGolomb(data) {_classCallCheck(this, ExpGolomb);
    this.data = data;
    // the number of bytes left to examine in this.data
    this.bytesAvailable = this.data.byteLength;
    // the number of bits left to examine in the current word
    this.bitsAvailable = 0; // :uint
    // the current word being examined
    this.word = 0; // :uint
  }

  /////////////////////////////////////////////////////////////////////////////////////////////////

  // ():void
  _createClass(ExpGolomb, [{ key: 'loadWord', value: function loadWord() {
      var
      position = this.data.byteLength - this.bytesAvailable,
      workingBytes = new Uint8Array(4),
      availableBytes = Math.min(4, this.bytesAvailable);
      if (availableBytes === 0) {throw new Error('no bytes available');}

      workingBytes.set(this.data.subarray(position, position + availableBytes));
      this.word = new DataView(workingBytes.buffer).getUint32(0);

      // track the amount of this.data that has been processed
      this.bitsAvailable = availableBytes * 8;
      this.bytesAvailable -= availableBytes;
    }

    /////////////////////////////////////////////////////////////////////////////////////////////////

    // (count:int):void
  }, { key: 'skipBits', value: function skipBits(count) {
      var skipBytes; // :int
      if (this.bitsAvailable > count) {
        this.word <<= count;
        this.bitsAvailable -= count;
      } else {
        count -= this.bitsAvailable;
        skipBytes = count >> 3;
        count -= skipBytes >> 3;
        this.bytesAvailable -= skipBytes;
        this.loadWord();
        this.word <<= count;
        this.bitsAvailable -= count;
      }
    }

    // ():uint
  }, { key: 'skipLZ', value: function skipLZ() {
      var leadingZeroCount; // :uint
      for (leadingZeroCount = 0; leadingZeroCount < this.bitsAvailable; ++leadingZeroCount) {
        if (0 !== (this.word & 0x80000000 >>> leadingZeroCount)) {
          // the first bit of working word is 1
          this.word <<= leadingZeroCount;
          this.bitsAvailable -= leadingZeroCount;
          return leadingZeroCount;
        }
      }
      // we exhausted word and still have not found a 1
      this.loadWord();
      return leadingZeroCount + this.skipLZ();
    }

    // ():void
  }, { key: 'skipUEG', value: function skipUEG() {
      this.skipBits(1 + this.skipLZ());
    }

    // ():void
  }, { key: 'skipEG', value: function skipEG() {
      this.skipBits(1 + this.skipLZ());
    }

    /**
       * Advance the ExpGolomb decoder past a scaling list. The scaling
       * list is optionally transmitted as part of a sequence parameter
       * set and is not relevant to transmuxing.
       * @param count {number} the number of entries in this scaling list
       * @see Recommendation ITU-T H.264, Section 7.3.2.1.1.1
       */ }, { key: 'skipScalingList', value: function skipScalingList(
    count) {
      var
      lastScale = 8,
      nextScale = 8,
      j,
      deltaScale;
      for (j = 0; j < count; j++) {
        if (nextScale !== 0) {
          deltaScale = this.readEG();
          nextScale = (lastScale + deltaScale + 256) % 256;
        }
        lastScale = nextScale === 0 ? lastScale : nextScale;
      }
    }

    /////////////////////////////////////////////////////////////////////////////////////////////////

    // (size:int):uint, size<32
  }, { key: 'readBits', value: function readBits(size) {
      var
      bits = Math.min(this.bitsAvailable, size), // :uint
      valu = this.word >>> 32 - bits; // :uint
      if (size > 32) {_logger.logger.error('Cannot read more than 32 bits at a time');}

      this.bitsAvailable -= bits;
      if (this.bitsAvailable > 0) {
        this.word <<= bits;
      } else if (this.bytesAvailable > 0) {
        this.loadWord();
      }
      bits = size - bits;
      if (bits > 0) {
        return valu << bits | this.readBits(bits);
      } else {
        return valu;
      }
    }

    // ():uint
  }, { key: 'readUEG', value: function readUEG() {
      var clz = this.skipLZ(); // :uint
      return this.readBits(clz + 1) - 1;
    }

    // ():int
  }, { key: 'readEG', value: function readEG() {
      var valu = this.readUEG(); // :int
      if (0x01 & valu) {
        // the number is odd if the low order bit is set
        return 1 + valu >>> 1; // add 1 to make it even, and divide by 2
      } else {
        return -1 * (valu >>> 1); // divide by two then make it negative
      }
    }

    // Some convenience functions
    // :Boolean
  }, { key: 'readBoolean', value: function readBoolean() {
      return 1 === this.readBits(1);
    }

    // ():int
  }, { key: 'readUByte', value: function readUByte() {
      return this.readBits(8);
    }

    // ():int
  }, { key: 'readUShort', value: function readUShort() {
      return this.readBits(16);
    }
    // ():int
  }, { key: 'readUInt', value: function readUInt() {
      return this.readBits(32);
    }

    /**
       * Read a sequence parameter set and return some interesting video
       * properties. A sequence parameter set is the H264 metadata that
       * describes the properties of upcoming video frames.
       * @param data {Uint8Array} the bytes of a sequence parameter set
       * @return {object} an object with configuration parsed from the
       * sequence parameter set, including the dimensions of the
       * associated video frames.
       */ }, { key: 'readSPS', value: function readSPS()
    {
      var
      frameCropLeftOffset = 0,
      frameCropRightOffset = 0,
      frameCropTopOffset = 0,
      frameCropBottomOffset = 0,
      sarScale = 1,
      profileIdc,profileCompat,levelIdc,
      numRefFramesInPicOrderCntCycle,picWidthInMbsMinus1,
      picHeightInMapUnitsMinus1,
      frameMbsOnlyFlag,
      scalingListCount,
      i;
      this.readUByte();
      profileIdc = this.readUByte(); // profile_idc
      profileCompat = this.readBits(5); // constraint_set[0-4]_flag, u(5)
      this.skipBits(3); // reserved_zero_3bits u(3),
      levelIdc = this.readUByte(); //level_idc u(8)
      this.skipUEG(); // seq_parameter_set_id

      // some profiles have more optional data we don't need
      if (profileIdc === 100 ||
      profileIdc === 110 ||
      profileIdc === 122 ||
      profileIdc === 244 ||
      profileIdc === 44 ||
      profileIdc === 83 ||
      profileIdc === 86 ||
      profileIdc === 118 ||
      profileIdc === 128) {
        var chromaFormatIdc = this.readUEG();
        if (chromaFormatIdc === 3) {
          this.skipBits(1); // separate_colour_plane_flag
        }
        this.skipUEG(); // bit_depth_luma_minus8
        this.skipUEG(); // bit_depth_chroma_minus8
        this.skipBits(1); // qpprime_y_zero_transform_bypass_flag
        if (this.readBoolean()) {// seq_scaling_matrix_present_flag
          scalingListCount = chromaFormatIdc !== 3 ? 8 : 12;
          for (i = 0; i < scalingListCount; i++) {
            if (this.readBoolean()) {// seq_scaling_list_present_flag[ i ]
              if (i < 6) {
                this.skipScalingList(16);
              } else {
                this.skipScalingList(64);
              }
            }
          }
        }
      }

      this.skipUEG(); // log2_max_frame_num_minus4
      var picOrderCntType = this.readUEG();
      if (picOrderCntType === 0) {
        this.readUEG(); //log2_max_pic_order_cnt_lsb_minus4
      } else if (picOrderCntType === 1) {
        this.skipBits(1); // delta_pic_order_always_zero_flag
        this.skipEG(); // offset_for_non_ref_pic
        this.skipEG(); // offset_for_top_to_bottom_field
        numRefFramesInPicOrderCntCycle = this.readUEG();
        for (i = 0; i < numRefFramesInPicOrderCntCycle; i++) {
          this.skipEG(); // offset_for_ref_frame[ i ]
        }
      }

      this.skipUEG(); // max_num_ref_frames
      this.skipBits(1); // gaps_in_frame_num_value_allowed_flag
      picWidthInMbsMinus1 = this.readUEG();
      picHeightInMapUnitsMinus1 = this.readUEG();
      frameMbsOnlyFlag = this.readBits(1);
      if (frameMbsOnlyFlag === 0) {
        this.skipBits(1); // mb_adaptive_frame_field_flag
      }

      this.skipBits(1); // direct_8x8_inference_flag
      if (this.readBoolean()) {// frame_cropping_flag
        frameCropLeftOffset = this.readUEG();
        frameCropRightOffset = this.readUEG();
        frameCropTopOffset = this.readUEG();
        frameCropBottomOffset = this.readUEG();
      }

      if (this.readBoolean()) {
        // vui_parameters_present_flag
        if (this.readBoolean()) {
          // aspect_ratio_info_present_flag
          var sarRatio = void 0;
          var aspectRatioIdc = this.readUByte();
          switch (aspectRatioIdc) {
            case 1:sarRatio = [1, 1];break;
            case 2:sarRatio = [12, 11];break;
            case 3:sarRatio = [10, 11];break;
            case 4:sarRatio = [16, 11];break;
            case 5:sarRatio = [40, 33];break;
            case 6:sarRatio = [24, 11];break;
            case 7:sarRatio = [20, 11];break;
            case 8:sarRatio = [32, 11];break;
            case 9:sarRatio = [80, 33];break;
            case 10:sarRatio = [18, 11];break;
            case 11:sarRatio = [15, 11];break;
            case 12:sarRatio = [64, 33];break;
            case 13:sarRatio = [160, 99];break;
            case 14:sarRatio = [4, 3];break;
            case 15:sarRatio = [3, 2];break;
            case 16:sarRatio = [2, 1];break;
            case 255:{
                sarRatio = [this.readUByte() << 8 | this.readUByte(), this.readUByte() << 8 | this.readUByte()];
                break;
              }}

          if (sarRatio) {
            sarScale = sarRatio[0] / sarRatio[1];
          }
        }
      }

      return {
        width: Math.ceil(((picWidthInMbsMinus1 + 1) * 16 - frameCropLeftOffset * 2 - frameCropRightOffset * 2) * sarScale),
        height: (2 - frameMbsOnlyFlag) * (picHeightInMapUnitsMinus1 + 1) * 16 - (frameMbsOnlyFlag ? 2 : 4) * (frameCropTopOffset + frameCropBottomOffset) };

    } }, { key: 'readSliceType', value: function readSliceType()

    {
      // skip NALu type
      this.readUByte();
      // discard first_mb_in_slice
      this.readUEG();
      // return slice_type
      return this.readUEG();
    } }]);return ExpGolomb;}();exports.default =


ExpGolomb;

},{"../utils/logger":20}],5:[function(require,module,exports){
'use strict';Object.defineProperty(exports, "__esModule", { value: true });var _createClass = function () {function defineProperties(target, props) {for (var i = 0; i < props.length; i++) {var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}return function (Constructor, protoProps, staticProps) {if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;};}();
var _aacAdts = require('../remux/aac-adts');var _aacAdts2 = _interopRequireDefault(_aacAdts);
var _events = require('../events');var _events2 = _interopRequireDefault(_events);
var _eventHandler = require('../event-handler');var _eventHandler2 = _interopRequireDefault(_eventHandler);
var _expGolomb = require('./exp-golomb');var _expGolomb2 = _interopRequireDefault(_expGolomb);
var _mp4Remuxer = require('../remux/mp4-remuxer');var _mp4Remuxer2 = _interopRequireDefault(_mp4Remuxer);
var _logger = require('../utils/logger');function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}function _classCallCheck(instance, Constructor) {if (!(instance instanceof Constructor)) {throw new TypeError("Cannot call a class as a function");}}function _possibleConstructorReturn(self, call) {if (!self) {throw new ReferenceError("this hasn't been initialised - super() hasn't been called");}return call && (typeof call === "object" || typeof call === "function") ? call : self;}function _inherits(subClass, superClass) {if (typeof superClass !== "function" && superClass !== null) {throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);}subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } });if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;} /***/var

H264Demuxer = function (_EventHandler) {_inherits(H264Demuxer, _EventHandler);

  function H264Demuxer(jvp) {var config = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;_classCallCheck(this, H264Demuxer);var _this = _possibleConstructorReturn(this, (H264Demuxer.__proto__ || Object.getPrototypeOf(H264Demuxer)).call(this,
    jvp, _events2.default.H264_DATA_PARSED));

    _this.config = _this.jvp.config || config;
    _this.jvp = jvp;
    _this.id = 'main';

    _this.H264_TIMEBASE = 3000; //3000; // 3000->320 变成320后，画面有的迟顿效果
    _this.H264_TIMESCALE = 90000; // PTS/DTS的初始值，一般来源于录制的视频的频率，按照h264的设定是90HZ
    _this.AUDIO_TIMEBASE = 1024;
    _this.AUDIO_TIMESCALE = 8e3;
    _this.remuxer = new _mp4Remuxer2.default(_this.jvp, _this.id, _this.config);

    _this.contiguous = true;
    _this.timeOffset = 1;
    _this.sn_video = 0;
    _this.sn_audio = 0;

    _this.codec = undefined;
    _this.avFlagIS = undefined;
    _this.hasCreatedSB = false;
    _this._videoTrack = { container: 'video/mp4', type: 'video', id: 1, sequenceNumber: 0, samples: [], len: 0, nbNalu: 0, dropped: 0, count: 0, duration: _this.H264_TIMEBASE };
    _this._audioTrack = { container: "video/mp4", type: "audio", id: 2, sequenceNumber: 0, samples: [], len: 0, nbNalu: 0, dropped: 0, count: 0, duration: _this.AUDIO_TIMEBASE, config: undefined };return _this;
  }_createClass(H264Demuxer, [{ key: 'destroy', value: function destroy()

    {
      _eventHandler2.default.prototype.destroy.call(this);
    }

    /////////////////////////////////////////////////////////////////////////////////////////////////

    // { data: nal, avFlag: avFlag, isAudio: false, tss: tss, duration: duration }
  }, { key: 'onH264DataParsed', value: function onH264DataParsed(event) {
      if (this.avFlagIS === undefined) {
        this.avFlagIS = event.avFlag;
      }

      if (event.isAudio) {
        this._parseAudioTrack(event.data, event.tss, event.duration);
      } else
      {
        this._parseAVCTrack(event.data, event.tss, event.duration);
      }

      // 音视频
      if (this.avFlagIS === 0) {
        if (this._videoTrack.samples.length && this._audioTrack.config) {
          this.remuxer.pushVideo2(0, this.sn_video, this._videoTrack, this._audioTrack, this.timeOffset, this.contiguous);
          this.sn_video += 1;
        }
        if (this._audioTrack.samples.length) {
          this.remuxer.pushAudio2(0, this.sn_video, this._audioTrack, this.timeOffset, this.contiguous);
          this.sn_video += 1;
        }
      }
      // 仅视频
      else if (this.avFlagIS === 2) {
          if (this._videoTrack.samples.length) {
            this.remuxer.pushVideo(0, this.sn_video, this._videoTrack, this.timeOffset, this.contiguous);
            this.sn_video += 1;
          }
        }
        // 仅音频
        else if (this.avFlagIS === 1) {
            if (this._audioTrack.samples.length) {
              this.remuxer.pushAudio(0, this.sn_audio, this._audioTrack, this.timeOffset, this.contiguous);
              this.sn_audio += 1;
            }
          }
    }

    /////////////////////////////////////////////////////////////////////////////////////////////////

    // 音频数据处理
  }, { key: '_parseAudioTrack', value: function _parseAudioTrack(array, tss, duration) {
      var track_audio = this._audioTrack,samples_audio = track_audio.samples;

      if (!track_audio.config) {
        _aacAdts2.default.initTrackConfig(track_audio, this, array, 0, this.codec);
        this.AUDIO_TIMESCALE = track_audio.timescale = track_audio.samplerate;
      }

      tss = tss * this.AUDIO_TIMESCALE / 1000;
      duration = duration * this.AUDIO_TIMESCALE / 1000;

      // { offset, headerLength, frameLength, stamp }
      var fhInfo = _aacAdts2.default.parseFrameHeader(array, 0, tss, 0, 0);
      if (!fhInfo) {
        this.jvp.priintBinaryArray(array, 'Error AAC, total=' + array.byteLength + '; Array=');
        return;
      }
      if (fhInfo.headerLength + fhInfo.frameLength != array.byteLength) {
        this.jvp.priintBinaryArray(array, "Audio");
        console.log('Error AAC, total=' + array.byteLength + '; offset=' + fhInfo.offset + '; headerLength=' + fhInfo.headerLength + '; frameLength=' + fhInfo.frameLength + '; stamp=' + fhInfo.stamp);
        return;
      }

      var unitData = array.subarray(fhInfo.headerLength, array.byteLength);
      var audioSamples = { units: { units: [{ data: unitData, type: 0 }], length: unitData.byteLength }, pts: tss, dts: tss, duration: duration, ts: this.AUDIO_TIMESCALE };
      samples_audio.push(audioSamples);

      track_audio.len += unitData.byteLength;
      track_audio.nbNalu += 1;

      // 檢查是否帶了音頻數據（这里添加音频解码类型，就必须在generateIS中加上相应的音频头，不然就会放不出来）
      // 0=音视频 1=音频 2=视频
      if (!this.hasCreatedSB && (this.avFlagIS === 0 || this.avFlagIS === 1)) {

        if (this.avFlagIS === 0 && this._videoTrack.codec && track_audio.codec) {
          this.hasCreatedSB = true;
          this.codec = this._videoTrack.codec + ',' + track_audio.codec;
          console.log("audio this.codec=" + this.codec);
          this.jvp.trigger(_events2.default.BUFFER_RESET, { video: this._videoTrack, audio: track_audio });
        }

        if (this.avFlagIS === 1 && track_audio.codec) {
          this.hasCreatedSB = true;
          this.codec = track_audio.codec;
          console.log("audio this.codec=" + this.codec);
          this.jvp.trigger(_events2.default.BUFFER_RESET, { audio: track_audio });
        }
      }
    }

    // 视频数据处理
    // array: nal二进制数组
    // this._videoTrack = { container: 'video/mp4', type: 'video', id: 1, sequenceNumber: 0, samples: [], len: 0, nbNalu: 0, dropped: 0, count: 0, duration: this.H264_TIMEBASE };
    // this._audioTrack = { container: "video/mp4", type: "audio", id: 2, sequenceNumber: 0, samples: [], len: 0, nbNalu: 0, dropped: 0, count: 0, duration: this.AUDIO_TIMEBASE, audiosamplerate: this.AUDIO_SAMPLERATE, timescale: this.AUDIO_TIMESCALE, config: this.config };
    // avcSample = { units: { units: units2, length: length }, pts: tss, dts: tss, key: key }
  }, { key: '_parseAVCTrack', value: function _parseAVCTrack(array, tss, duration) {
      var track = this._videoTrack,
      samples = track.samples,
      units = this._parseAVCNALu(array), // { data: buffer, type: unitType, state: state }
      units2 = [],
      debug = false,
      key = false, // 是否关键帧
      length = 0,
      expGolombDecoder,
      avcSample,
      push;

      tss = tss * this.H264_TIMESCALE / 1000;
      duration = duration * this.H264_TIMESCALE / 1000;

      var debugString = '';
      var pushAccesUnit = function () {
        if (units2.length) {
          if (!this.config.forceKeyFrameOnDiscontinuity || key === true || track.sps && (samples.length || this.contiguous)) {
            avcSample = { units: { units: units2, length: length }, pts: tss, dts: tss, key: key, duration: duration }; // this.H264_TIMEBASE
            samples.push(avcSample);
            track.len += length;
            track.nbNalu += units2.length;
          } else {
            track.dropped++;
          }
          units2 = [];
          length = 0;
        }
      }.bind(this);

      for (var i = 0; i < units.length; i++) {
        var unit = units[i];
        switch (unit.type) {
          //NDR
          case 1:
            push = true;
            if (debug) {debugString += 'NDR ';}
            break;

          //IDR
          case 5:
            push = true;
            if (debug) {debugString += 'IDR ';}
            key = true;
            break;

          //SEI
          case 6:
            unit.data = this._discardEPB(unit.data);
            expGolombDecoder = new _expGolomb2.default(unit.data);
            expGolombDecoder.readUByte(); // skip frameType
            break;

          //SPS
          case 7:
            push = false;
            if (debug) {debugString += 'SPS ';}
            if (!track.sps) {
              expGolombDecoder = new _expGolomb2.default(unit.data);
              var config = expGolombDecoder.readSPS();
              track.width = config.width;
              track.height = config.height;
              track.sps = [unit.data];
              track.duration = 0;

              var codecarray = unit.data.subarray(1, 4);
              var codecstring = 'avc1.';
              for (var j = 0; j < 3; j++) {
                var h = codecarray[j].toString(16);
                if (h.length < 2) {h = '0' + h;}
                codecstring += h;
              }
              track.codec = codecstring;

              // 0=音视频 1=音频 2=视频
              if (!this.hasCreatedSB) {

                if (this.avFlagIS === 0 && this._videoTrack.codec && this._audioTrack.codec) {
                  this.hasCreatedSB = true;
                  this.codec = this._videoTrack.codec + ',' + this._audioTrack.codec;
                  console.log("video this.codec=" + this.codec);
                  this.jvp.trigger(_events2.default.BUFFER_RESET, { video: this._videoTrack, audio: this._audioTrack });
                }

                if (this.avFlagIS === 2 && this._videoTrack.codec) {
                  this.hasCreatedSB = true;
                  this.codec = this._videoTrack.codec;
                  console.log("video this.codec=" + this.codec);
                  this.jvp.trigger(_events2.default.BUFFER_RESET, { video: this._videoTrack });
                }
              }
              push = true;
            }
            break;

          //PPS
          case 8:
            push = false;
            if (debug) {debugString += 'PPS ';}
            if (!track.pps) {
              track.pps = [unit.data];
              push = true;
            }
            break;

          case 9:
            push = false;
            if (debug) {debugString += 'AUD ';}
            pushAccesUnit();
            break;

          default:
            push = false;
            debugString += 'unknown NAL ' + unit.type + ' ';
            break;}


        if (push) {
          units2.push(unit);
          length += unit.data.byteLength;
        }
      }

      if (debug || debugString.length) {
        _logger.logger.log(debugString);
      }

      pushAccesUnit();
    }

    // unit = { data: array, type: lastUnitType }
  }, { key: '_parseAVCNALu', value: function _parseAVCNALu(array) {
      var i = 0,len = array.byteLength,value,overflow,state = 0; //state = this.avcNaluState;
      var units = [],unit,unitType,lastUnitStart,lastUnitType;
      while (i < len) {
        value = array[i++];
        // finding 3 or 4-byte start codes (00 00 01 OR 00 00 00 01)
        switch (state) {
          case 0:
            if (value === 0) {
              state = 1;
            }
            break;
          case 1:
            if (value === 0) {
              state = 2;
            } else {
              state = 0;
            }
            break;
          case 2:
          case 3:
            if (value === 0) {
              state = 3;
            } else if (value === 1 && i < len) {
              unitType = array[i] & 0x1f;
              if (lastUnitStart) {
                unit = { data: array.subarray(lastUnitStart, i - state - 1), type: lastUnitType };
                units.push(unit);
              } else {
              }
              lastUnitStart = i;
              lastUnitType = unitType;
              state = 0;
            } else {
              state = 0;
            }
            break;
          default:
            break;}

      }

      if (lastUnitStart) {
        unit = { data: array.subarray(lastUnitStart, len), type: lastUnitType, state: state };
        units.push(unit);
      }

      return units;
    }

    /*** remove Emulation Prevention bytes from a RBSP */ }, { key: '_discardEPB', value: function _discardEPB(
    data) {
      var length = data.byteLength,EPBPositions = [],i = 1;

      // Find all `Emulation Prevention Bytes`
      while (i < length - 2) {
        if (data[i] === 0 &&
        data[i + 1] === 0 &&
        data[i + 2] === 0x03) {
          EPBPositions.push(i + 2);
          i += 2;
        } else {
          i++;
        }
      }

      // If no Emulation Prevention Bytes were found just return the original array
      if (EPBPositions.length === 0) {
        return data;
      }

      // Create a new array to hold the NAL unit data
      var newLength = length - EPBPositions.length;
      var newData = new Uint8Array(newLength);
      var sourceIndex = 0;

      for (i = 0; i < newLength; sourceIndex++, i++) {
        if (sourceIndex === EPBPositions[0]) {
          // Skip this byte
          sourceIndex++;
          // Remove this position index
          EPBPositions.shift();
        }
        newData[i] = data[sourceIndex];
      }
      return newData;
    } }]);return H264Demuxer;}(_eventHandler2.default);exports.default =


H264Demuxer;

},{"../event-handler":10,"../events":11,"../remux/aac-adts":16,"../remux/mp4-remuxer":19,"../utils/logger":20,"./exp-golomb":4}],6:[function(require,module,exports){
'use strict';Object.defineProperty(exports, "__esModule", { value: true });var _createClass = function () {function defineProperties(target, props) {for (var i = 0; i < props.length; i++) {var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}return function (Constructor, protoProps, staticProps) {if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;};}();
var _events = require('../events');var _events2 = _interopRequireDefault(_events);
var _eventHandler = require('../event-handler');var _eventHandler2 = _interopRequireDefault(_eventHandler);
var _h264Demuxer = require('./h264-demuxer');var _h264Demuxer2 = _interopRequireDefault(_h264Demuxer);function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}function _classCallCheck(instance, Constructor) {if (!(instance instanceof Constructor)) {throw new TypeError("Cannot call a class as a function");}}function _possibleConstructorReturn(self, call) {if (!self) {throw new ReferenceError("this hasn't been initialised - super() hasn't been called");}return call && (typeof call === "object" || typeof call === "function") ? call : self;}function _inherits(subClass, superClass) {if (typeof superClass !== "function" && superClass !== null) {throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);}subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } });if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;} /** H264 NAL Slicer */var

H264NalSlicesReader = function (_EventHandler) {_inherits(H264NalSlicesReader, _EventHandler);

    function H264NalSlicesReader(jvp) {var config = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;_classCallCheck(this, H264NalSlicesReader);var _this = _possibleConstructorReturn(this, (H264NalSlicesReader.__proto__ || Object.getPrototypeOf(H264NalSlicesReader)).call(this,
        jvp, _events2.default.H264_DATA_PARSING));

        _this.config = _this.jvp.config || config;
        _this.h264Demuxer = new _h264Demuxer2.default(jvp);
        _this.jvp = jvp;
        _this.lastBuf = null;
        _this.nals = [];return _this;
    }_createClass(H264NalSlicesReader, [{ key: 'destroy', value: function destroy()

        {
            this.lastBuf = null;
            this.nals = [];
            _eventHandler2.default.prototype.destroy.call(this);
        }

        /////////////////////////////////////////////////////////////////////////////////////////////////

        // { type: 'video', data: data.payload, parent: 'main' }
    }, { key: 'onH264DataParsing', value: function onH264DataParsing(event) {
            this._read(event.data);
            var $this = this;
            this.nals.forEach(function (nal) {
                $this.jvp.trigger(_events2.default.H264_DATA_PARSED, { data: nal, avFlag: event.avFlag });
            });
        }

        /////////////////////////////////////////////////////////////////////////////////////////////////
    }, { key: '_read', value: function _read(
        buffer) {
            var typedAr = null;
            this.nals = [];
            if (!buffer || buffer.byteLength < 1) return;

            // 合并断包
            if (this.lastBuf) {
                typedAr = new Uint8Array(buffer.byteLength + this.lastBuf.length);
                typedAr.set(this.lastBuf);
                typedAr.set(new Uint8Array(buffer), this.lastBuf.length);
            } else {
                typedAr = new Uint8Array(buffer);
            }

            // 0x00 00 00 01或0x00 00 00 00 01开头，为NAL单元开始标志
            var lastNalEndPos = 0;
            var b1 = -1; // byte before one
            var b2 = -2; // byte before two
            var nalStartPos = new Array();
            for (var i = 0; i < typedAr.length; i += 2) {
                var b_0 = typedAr[i];
                var b_1 = typedAr[i + 1];
                if (b1 == 0 && b_0 == 0 && b_1 == 0) {
                    nalStartPos.push(i - 1);
                } else if (b_1 == 1 && b_0 == 0 && b1 == 0 && b2 == 0) {
                    nalStartPos.push(i - 2);
                }
                b2 = b_0;
                b1 = b_1;
            }

            if (nalStartPos.length > 1) {
                for (var j = 0; j < nalStartPos.length - 1; ++j) {
                    this.nals.push(typedAr.subarray(nalStartPos[j], nalStartPos[j + 1] + 1));
                    lastNalEndPos = nalStartPos[j + 1];
                }
            } else {
                lastNalEndPos = nalStartPos[0];
            }

            // 缓存未形成完整nal单元的数据，以供下次合并后再解析
            if (lastNalEndPos != 0 && lastNalEndPos < typedAr.length) {
                this.lastBuf = typedAr.subarray(lastNalEndPos);
            } else {
                if (!this.lastBuf) {this.lastBuf = typedAr;}
                var _newBuf = new Uint8Array(this.lastBuf.length + buffer.byteLength);
                _newBuf.set(this.lastBuf);
                _newBuf.set(new Uint8Array(buffer), this.lastBuf.length);
                this.lastBuf = _newBuf;
            }
        } }]);return H264NalSlicesReader;}(_eventHandler2.default);exports.default =



H264NalSlicesReader;

},{"../event-handler":10,"../events":11,"./h264-demuxer":5}],7:[function(require,module,exports){
'use strict';Object.defineProperty(exports, "__esModule", { value: true });var _createClass = function () {function defineProperties(target, props) {for (var i = 0; i < props.length; i++) {var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}return function (Constructor, protoProps, staticProps) {if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;};}();
var _events = require('../events');var _events2 = _interopRequireDefault(_events);
var _eventHandler = require('../event-handler');var _eventHandler2 = _interopRequireDefault(_eventHandler);function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}function _classCallCheck(instance, Constructor) {if (!(instance instanceof Constructor)) {throw new TypeError("Cannot call a class as a function");}}function _possibleConstructorReturn(self, call) {if (!self) {throw new ReferenceError("this hasn't been initialised - super() hasn't been called");}return call && (typeof call === "object" || typeof call === "function") ? call : self;}function _inherits(subClass, superClass) {if (typeof superClass !== "function" && superClass !== null) {throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);}subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } });if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;} /** */

var JTT1078_PACKAGING_FLAG = {
  ATOM: 0x00,
  FIRST: 0x01,
  LAST: 0x02,
  MIDDLE: 0x03 };


var JT1078_PLAYLOAD_Type = {
  G711A: 6,
  G711U: 7,
  G726: 8,
  AAC: 19,
  H264: 98,
  H265: 99,
  AVS: 100,
  SAVC: 101 };var


JTT1078Demuxer = function (_EventHandler) {_inherits(JTT1078Demuxer, _EventHandler);

  function JTT1078Demuxer(jvp) {var config = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;_classCallCheck(this, JTT1078Demuxer);var _this = _possibleConstructorReturn(this, (JTT1078Demuxer.__proto__ || Object.getPrototypeOf(JTT1078Demuxer)).call(this,
    jvp, _events2.default.JTT1078_DATA_PARSED));

    _this.config = _this.jvp.config || config;
    _this.jvp = jvp;
    _this.id = 'main';

    _this.packagesVideo = [];
    _this.packagesAudio = [];

    _this.findedIFrame = false;
    _this.initVideoTs = -1;
    _this.initAudioTs = -1;
    _this.lastVideoPackage = undefined;
    _this.lastAudioPackage = undefined;
    _this.sendingVideoPackage = []; // 待发送的视频包，用于控制必须大于音频的时间
    return _this;}_createClass(JTT1078Demuxer, [{ key: 'destroy', value: function destroy()

    {
      _eventHandler2.default.prototype.destroy.call(this);
    }

    /////////////////////////////////////////////////////////////////////////////////////////////////

    // { data: pkg, avFlag: data.avFlag }
    // pkg = { v: v, p: p, x: x, cc: cc, m: m, pt: pt, sn: sn,
    //   simNumber: simNumber,
    //   channelId: channelId,
    //   dataType: dataType,
    //   packageFlag: packageFlag,
    //   timestamp1: timestamp1,
    //   timestamp2: timestamp2,
    //   lastIFrameInterval: lastIFrameInterval,
    //   lastPFrameInterval: lastPFrameInterval,
    //   dataLength: dataLength,
    //   dataBuffer: dataBuffer
    // }
  }, { key: 'onJTT1078DataParsed', value: function onJTT1078DataParsed(event) {
      // 检查是否为I帧（向Video传输数据，第一帧必须为I帧，其它帧抛弃）
      if (event.data.dataType == 0x00 && (event.data.packageFlag == JTT1078_PACKAGING_FLAG.ATOM || event.data.packageFlag == JTT1078_PACKAGING_FLAG.FIRST)) {
        this.findedIFrame = true;
      }
      if (event.avFlag == 1) {
        // 只放音频时，无须验证是否找到I帧
        this.findedIFrame = true;
      }
      if (!this.findedIFrame) {
        console.log('should finding first I data, the current package throwed.');
        return;
      }

      // 透传数据，直接抛弃
      if (event.data.dataType == 0x04) {
        console.log("Recveived jtt1078 package is transparent data, skip it.");
        return;
      }

      // 音频数据处理
      if (event.data.dataType == 0x03) {
        if (event.data.pt != JT1078_PLAYLOAD_Type.AAC) {
          console.log("Recveived audio package is not AAC Type! playload=" + event.data.pt);
          return;
        }

        switch (event.data.packageFlag) {
          case JTT1078_PACKAGING_FLAG.ATOM:
            this._assemblyAudioPackages(event.avFlag);
            this._raiseH264DataParsedEvent(event.data, event.avFlag);
            break;

          case JTT1078_PACKAGING_FLAG.FIRST:
            this._assemblyAudioPackages(event.avFlag);
            this.packagesAudio.push(event.data);
            break;

          case JTT1078_PACKAGING_FLAG.MIDDLE:
            this.packagesAudio.push(event.data);
            break;

          case JTT1078_PACKAGING_FLAG.LAST:
            this.packagesAudio.push(event.data);
            this._assemblyAudioPackages(event.avFlag);
            break;

          default:break;}

      }

      // 视频数据处理，组合数据包
      if (event.data.dataType == 0x00 || event.data.dataType == 0x01 || event.data.dataType == 0x02) {
        if (event.data.pt != JT1078_PLAYLOAD_Type.H264) {
          console.log("Recveived video package is not H264 Type! playload=" + event.data.pt);
          return;
        }

        switch (event.data.packageFlag) {
          case JTT1078_PACKAGING_FLAG.ATOM:
            this._assemblyVideoPackages(event.avFlag);
            this._raiseH264DataParsedEvent(event.data, event.avFlag);
            break;

          case JTT1078_PACKAGING_FLAG.FIRST:
            this._assemblyVideoPackages(event.avFlag);
            this.packagesVideo.push(event.data);
            break;

          case JTT1078_PACKAGING_FLAG.MIDDLE:
            this.packagesVideo.push(event.data);
            break;

          case JTT1078_PACKAGING_FLAG.LAST:
            this.packagesVideo.push(event.data);
            this._assemblyVideoPackages(event.avFlag);
            break;

          default:break;}

      }
    } }, { key: '_assemblyVideoPackages', value: function _assemblyVideoPackages(

    avFlag) {
      if (this.packagesVideo.length == 0) return;

      var bigPkgSize = 0;
      this.packagesVideo.forEach(function (d) {bigPkgSize += d.dataLength;});

      var bigIdx = 0;
      var bigPkgBuffer = new Uint8Array(bigPkgSize);
      this.packagesVideo.forEach(function (d) {
        bigPkgBuffer.set(d.dataBuffer, bigIdx);
        bigIdx += d.dataLength;
      });

      var firstPkg = this.packagesVideo[0];
      firstPkg.dataLength = bigPkgSize;
      firstPkg.dataBuffer = bigPkgBuffer;
      this._raiseH264DataParsedEvent(firstPkg, avFlag);

      this.packagesVideo.slice(0, this.packagesVideo.length);
      this.packagesVideo = [];
    } }, { key: '_assemblyAudioPackages', value: function _assemblyAudioPackages(

    avFlag) {
      if (this.packagesAudio.length == 0) return;

      var bigPkgSize = 0;
      this.packagesAudio.forEach(function (d) {bigPkgSize += d.dataLength;});

      var bigIdx = 0;
      var bigPkgBuffer = new Uint8Array(bigPkgSize);
      this.packagesAudio.forEach(function (d) {
        bigPkgBuffer.set(d.dataBuffer, bigIdx);
        bigIdx += d.dataLength;
      });

      var firstPkg = this.packagesAudio[0];
      firstPkg.dataLength = bigPkgSize;
      firstPkg.dataBuffer = bigPkgBuffer;
      this._raiseH264DataParsedEvent(firstPkg, avFlag);

      this.packagesAudio.slice(0, this.packagesAudio.length);
      this.packagesAudio = [];
    } }, { key: '_raiseH264DataParsedEvent', value: function _raiseH264DataParsedEvent(

    pkg, avFlag) {
      // 缓存当前包，处理上一包（目的是为了得到druation，单位ms）
      var isAudio = pkg.dataType == 0x03;
      var nextPkg = pkg;
      var currPkg = undefined;
      var initTs = 0;
      if (isAudio) {
        if (!this.lastAudioPackage) {
          this.lastAudioPackage = pkg;
          this.initAudioTs = pkg.timestamp2;
          return;
        }

        initTs = this.initAudioTs;
        currPkg = this.lastAudioPackage;
        this.lastAudioPackage = pkg;
      } else
      {
        if (!this.lastVideoPackage) {
          this.lastVideoPackage = pkg;
          this.initVideoTs = pkg.timestamp2;
          return;
        }

        initTs = this.initVideoTs;
        currPkg = this.lastVideoPackage;
        this.lastVideoPackage = pkg;
      }
      if (!currPkg) return;


      var tss = currPkg.timestamp2 - initTs; // 计算当前包的tss  
      var duration = Math.abs(nextPkg.timestamp2 - currPkg.timestamp2); // 计算当前包的duration
      var sending = { data: currPkg.dataBuffer, avFlag: avFlag, isAudio: isAudio, tss: tss, duration: duration };
      this.jvp.trigger(_events2.default.H264_DATA_PARSED, sending);

      // let dataType = currPkg.dataType;
      // let packageFlag = currPkg.packageFlag;
      // var dataTypeText = dataType == 0x00 ? "I" : dataType == 0x01 ? "P" : dataType == 0x02 ? "B" : dataType == 0x03 ? "A" : dataType == 0x04 ? "O" : dataType;
      // var packageFlagText = packageFlag == 0 ? "Atom " : packageFlag == 1 ? "First" : packageFlag == 2 ? "Last " : packageFlag == 3 ? "Middl" : "Error";
      // console.log('read jtt1078 package: sn=' + currPkg.sn + '; tss=' + tss + '; duration=' + duration + '; type=' + dataTypeText + '(' + dataType + '); flag=' + packageFlagText + '(' + packageFlag + '); length=' + currPkg.dataLength + '; ts1=' + currPkg.timestamp1 + '; ts2=' + currPkg.timestamp2 + '; ifi=' + currPkg.lastIFrameInterval + '; pfi=' + currPkg.lastPFrameInterval);
      //this.jvp.priintBinaryArray(dataBuffer, 'jtt1078 package:');
    } }]);return JTT1078Demuxer;}(_eventHandler2.default);exports.default =


JTT1078Demuxer;

},{"../event-handler":10,"../events":11}],8:[function(require,module,exports){
'use strict';Object.defineProperty(exports, "__esModule", { value: true });var _createClass = function () {function defineProperties(target, props) {for (var i = 0; i < props.length; i++) {var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}return function (Constructor, protoProps, staticProps) {if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;};}();
var _events = require('../events');var _events2 = _interopRequireDefault(_events);
var _eventHandler = require('../event-handler');var _eventHandler2 = _interopRequireDefault(_eventHandler);
var _jtt1078Demuxer = require('./jtt1078-demuxer');var _jtt1078Demuxer2 = _interopRequireDefault(_jtt1078Demuxer);function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}function _classCallCheck(instance, Constructor) {if (!(instance instanceof Constructor)) {throw new TypeError("Cannot call a class as a function");}}function _possibleConstructorReturn(self, call) {if (!self) {throw new ReferenceError("this hasn't been initialised - super() hasn't been called");}return call && (typeof call === "object" || typeof call === "function") ? call : self;}function _inherits(subClass, superClass) {if (typeof superClass !== "function" && superClass !== null) {throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);}subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } });if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;} /** JTT1078 Package Reader */

var JT1078_Data_Type = {
    I: 0x00,
    P: 0x01,
    B: 0x02,
    AUDIO: 0x03,
    OTHER: 0x04 };var


JTT1078PackageReader = function (_EventHandler) {_inherits(JTT1078PackageReader, _EventHandler);

    function JTT1078PackageReader(jvp) {var config = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;_classCallCheck(this, JTT1078PackageReader);var _this = _possibleConstructorReturn(this, (JTT1078PackageReader.__proto__ || Object.getPrototypeOf(JTT1078PackageReader)).call(this,
        jvp, _events2.default.JTT1078_DATA_PARSING));

        _this.config = _this.jvp.config || config;
        _this.jtt1078Demuxer = new _jtt1078Demuxer2.default(jvp);
        _this.jvp = jvp;

        _this.lastBuf = null;
        _this.packages = [];return _this;
    }_createClass(JTT1078PackageReader, [{ key: 'destroy', value: function destroy()

        {
            this.lastBuf = null;
            this.packages = [];
            this.jtt1078Demuxer.destroy();
            _eventHandler2.default.prototype.destroy.call(this);
        }

        /////////////////////////////////////////////////////////////////////////////////////////////////

        // { data: copy, avFlag: this.avFlag }
    }, { key: 'onJTT1078DataParsing', value: function onJTT1078DataParsing(event) {
            this._read(event.data);
            var $this = this;
            this.packages.forEach(function (pkg) {
                $this.jvp.trigger(_events2.default.JTT1078_DATA_PARSED, { data: pkg, avFlag: event.avFlag });
            });
        }

        /////////////////////////////////////////////////////////////////////////////////////////////////
    }, { key: '_read', value: function _read(
        buffer) {
            var typedAr = null;
            this.packages = [];
            if (!buffer || buffer.byteLength < 1) return;

            // 合并断包
            if (this.lastBuf) {
                typedAr = new Uint8Array(buffer.byteLength + this.lastBuf.length);
                typedAr.set(this.lastBuf);
                typedAr.set(new Uint8Array(buffer), this.lastBuf.length);
                this.lastBuf = null;
            } else {
                typedAr = new Uint8Array(buffer);
            }

            // 分析包        
            for (var i = 0; i < typedAr.length; i += 1) {
                if (typedAr[i] == 0x30 && typedAr[i + 1] == 0x31 && typedAr[i + 2] == 0x63 && typedAr[i + 3] == 0x64) {
                    var p = this._readPackage(typedAr, i);
                    if (p == null) {
                        // 缓存未形成完整package单元的数据，以供下次合并后再解析
                        this.lastBuf = typedAr.subarray(i);
                    } else
                    {
                        this.packages.push(p);
                    }
                }
            }
        }

        // return package
    }, { key: '_readPackage', value: function _readPackage(buffer, startPos) {
            // 至少30位数据，才能判断是否是一个完整包
            if (buffer.length < startPos + 30) return null;

            var idx = startPos + 4;
            var v = buffer[idx] >> 6;
            var p = buffer[idx] >> 5 & 0x01;
            var x = buffer[idx] >> 4 & 0x01;
            var cc = buffer[idx] & 0x0F;
            idx++;

            var m = buffer[idx] >> 7;
            var pt = buffer[idx] & 0x7F;
            idx++;

            // 包序号
            var sn = this._readWord(buffer, idx);
            idx += 2;

            // SIM卡号 BCD(根据协议决定它的长度，2011协议为6位，2019协议为10位)
            // 这里不解析卡号，节省性能
            var simLength = 6;
            var simNumber = '';
            if (this.jvp.config.jtt1078Version == '2019') simLength = 10;
            //for (let i = 0; i < simLength; i++) {
            //    simNumber += buffer[idx + i] >> 4;
            //    simNumber += buffer[idx + i] & 0x0F;
            //}
            idx += simLength;

            // 逻辑通道号 1
            var channelId = buffer[idx++];

            // 数据类型 + 分包处理标记 1
            var dataType = buffer[idx] >> 4;
            var packageFlag = buffer[idx] & 0x0F;
            idx++;

            // 时间戳
            var timestamp = 0;
            var timestamp1 = 0;
            var timestamp2 = 0;
            if (dataType != JT1078_Data_Type.OTHER) {
                timestamp = this._readBigWord(buffer, idx);
                timestamp1 = this._readDWord(buffer, idx);
                timestamp2 = this._readDWord(buffer, idx + 4);
                idx += 8;
            }

            // Last I Frame Interval 2、Last Frame Interval   2 
            var lastIFrameInterval = 0;
            var lastPFrameInterval = 0;
            if (dataType == JT1078_Data_Type.I || dataType == JT1078_Data_Type.P || dataType == JT1078_Data_Type.B) {
                lastIFrameInterval = this._readWord(buffer, idx);
                lastPFrameInterval = this._readWord(buffer, idx + 2);
                idx += 4;
            }

            // 数据长度 2，长度不超过950
            var dataLength = this._readWord(buffer, idx);
            idx += 2;

            // H264数据
            var dataBuffer = buffer.subarray(idx, idx + dataLength);

            // 判断是否为完整包
            if (buffer.length < startPos + 30 + dataLength) return null;

            // if (dataType == JT1078_Data_Type.AUDIO) {
            //    var dataTypeText = dataType == JT1078_Data_Type.I ? "I" : dataType == JT1078_Data_Type.P ? "P" : dataType == JT1078_Data_Type.B ? "B" : dataType == JT1078_Data_Type.AUDIO ? "A" : dataType == JT1078_Data_Type.OTHER ? "O" : dataType;
            //    var packageFlagText = packageFlag == 0 ? "Atom " : packageFlag == 1 ? "First" : packageFlag == 2 ? "Last " : packageFlag == 3 ? "Middl" : "Error";
            //    console.log('read jtt1078 package: sim=' + simNumber + '; sn=' + sn + '; pt=' + pt + '; type=' + dataTypeText + '(' + dataType + '); flag=' + packageFlagText + '(' + packageFlag + '); length=' + dataLength + '; ts1=' + timestamp1 + '; ts2=' + timestamp2 + '; ifi=' + lastIFrameInterval + '; pfi=' + lastPFrameInterval);
            //    //this.jvp.priintBinaryArray(dataBuffer, 'jtt1078 package:');
            // }
            return {
                v: v, p: p, x: x, cc: cc, m: m, pt: pt, sn: sn,
                //simNumber: simNumber,
                channelId: channelId,
                dataType: dataType,
                packageFlag: packageFlag,
                timestamp1: timestamp1,
                timestamp2: timestamp2,
                lastIFrameInterval: lastIFrameInterval,
                lastPFrameInterval: lastPFrameInterval,
                dataLength: dataLength,
                dataBuffer: dataBuffer };

        } }, { key: '_readWord', value: function _readWord(

        buffer, startPos) {
            var workingBytes = new Uint8Array(2);
            workingBytes.set(buffer.subarray(startPos, startPos + 2));

            var word = new DataView(workingBytes.buffer).getUint16(0);
            return word;
        } }, { key: '_readDWord', value: function _readDWord(

        buffer, startPos) {
            var workingBytes = new Uint8Array(4);
            workingBytes.set(buffer.subarray(startPos, startPos + 4));

            var word = new DataView(workingBytes.buffer).getUint32(0);
            return word;
        } }, { key: '_readBigWord', value: function _readBigWord(

        buffer, startPos) {
            var workingBytes = new Uint8Array(8);
            workingBytes.set(buffer.subarray(startPos, startPos + 8));

            var word = new DataView(workingBytes.buffer).getBigUint64(0);
            return word;
        } }]);return JTT1078PackageReader;}(_eventHandler2.default);exports.default =


JTT1078PackageReader;

},{"../event-handler":10,"../events":11,"./jtt1078-demuxer":7}],9:[function(require,module,exports){
'use strict';Object.defineProperty(exports, "__esModule", { value: true });var ErrorTypes = exports.ErrorTypes = {
  // Identifier for a network error (loading error / timeout ...)
  NETWORK_ERROR: 'networkError',
  // Identifier for a media Error (video/parsing/mediasource error)
  MEDIA_ERROR: 'mediaError',
  // Identifier for all other errors
  OTHER_ERROR: 'otherError' };


var ErrorDetails = exports.ErrorDetails = {
  // Identifier for a manifest load error - data: { url : faulty URL, response : { code: error code, text: error text }}
  MANIFEST_LOAD_ERROR: 'manifestLoadError',
  // Identifier for a manifest load timeout - data: { url : faulty URL, response : { code: error code, text: error text }}
  MANIFEST_LOAD_TIMEOUT: 'manifestLoadTimeOut',
  // Identifier for a manifest parsing error - data: { url : faulty URL, reason : error reason}
  MANIFEST_PARSING_ERROR: 'manifestParsingError',
  // Identifier for a manifest with only incompatible codecs error - data: { url : faulty URL, reason : error reason}
  MANIFEST_INCOMPATIBLE_CODECS_ERROR: 'manifestIncompatibleCodecsError',


  // Identifier for a level load error - data: { url : faulty URL, response : { code: error code, text: error text }}
  LEVEL_LOAD_ERROR: 'levelLoadError',
  // Identifier for a level load timeout - data: { url : faulty URL, response : { code: error code, text: error text }}
  LEVEL_LOAD_TIMEOUT: 'levelLoadTimeOut',
  // Identifier for a level switch error - data: { level : faulty level Id, event : error description}
  LEVEL_SWITCH_ERROR: 'levelSwitchError',


  // Identifier for an audio track load error - data: { url : faulty URL, response : { code: error code, text: error text }}
  AUDIO_TRACK_LOAD_ERROR: 'audioTrackLoadError',
  // Identifier for an audio track load timeout - data: { url : faulty URL, response : { code: error code, text: error text }}
  AUDIO_TRACK_LOAD_TIMEOUT: 'audioTrackLoadTimeOut',


  // Identifier for fragment load error - data: { frag : fragment object, response : { code: error code, text: error text }}
  FRAG_LOAD_ERROR: 'fragLoadError',
  // Identifier for fragment loop loading error - data: { frag : fragment object}
  FRAG_LOOP_LOADING_ERROR: 'fragLoopLoadingError',
  // Identifier for fragment load timeout error - data: { frag : fragment object}
  FRAG_LOAD_TIMEOUT: 'fragLoadTimeOut',
  // Identifier for a fragment decryption error event - data: parsing error description
  FRAG_DECRYPT_ERROR: 'fragDecryptError',
  // Identifier for a fragment parsing error event - data: parsing error description
  FRAG_PARSING_ERROR: 'fragParsingError',


  // Identifier for decrypt key load error - data: { frag : fragment object, response : { code: error code, text: error text }}
  KEY_LOAD_ERROR: 'keyLoadError',
  // Identifier for decrypt key load timeout error - data: { frag : fragment object}
  KEY_LOAD_TIMEOUT: 'keyLoadTimeOut',


  // Triggered when an exception occurs while adding a sourceBuffer to MediaSource - data : {  err : exception , mimeType : mimeType }
  BUFFER_ADD_CODEC_ERROR: 'bufferAddCodecError',
  // Identifier for a buffer append error - data: append error description
  BUFFER_APPEND_ERROR: 'bufferAppendError',
  // Identifier for a buffer appending error event - data: appending error description
  BUFFER_APPENDING_ERROR: 'bufferAppendingError',
  // Identifier for a buffer stalled error event
  BUFFER_STALLED_ERROR: 'bufferStalledError',
  // Identifier for a buffer full event
  BUFFER_FULL_ERROR: 'bufferFullError',
  // Identifier for a buffer seek over hole event
  BUFFER_SEEK_OVER_HOLE: 'bufferSeekOverHole',


  // Identifier for an internal exception happening inside hls.js while handling an event
  INTERNAL_EXCEPTION: 'internalException' };

},{}],10:[function(require,module,exports){
'use strict';Object.defineProperty(exports, "__esModule", { value: true });var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {return typeof obj;} : function (obj) {return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;};var _createClass = function () {function defineProperties(target, props) {for (var i = 0; i < props.length; i++) {var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}return function (Constructor, protoProps, staticProps) {if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;};}(); /*** All objects in the event handling chain should inherit from this class **/
var _events = require('./events');var _events2 = _interopRequireDefault(_events);function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}function _classCallCheck(instance, Constructor) {if (!(instance instanceof Constructor)) {throw new TypeError("Cannot call a class as a function");}}var

EventHandler = function () {

  function EventHandler(jvp) {_classCallCheck(this, EventHandler);
    this.jvp = jvp;
    this.onEvent = this.onEvent.bind(this);for (var _len = arguments.length, events = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {events[_key - 1] = arguments[_key];}
    this.handledEvents = events;
    this.useGenericHandler = true;

    this.registerListeners();
  }_createClass(EventHandler, [{ key: 'destroy', value: function destroy()

    {
      this.unregisterListeners();
    }

    /////////////////////////////////////////////////////////////////////////////////////////////////
  }, { key: 'isEventHandler', value: function isEventHandler()
    {
      return _typeof(this.handledEvents) === 'object' && this.handledEvents.length && typeof this.onEvent === 'function';
    } }, { key: 'registerListeners', value: function registerListeners()

    {
      if (this.isEventHandler()) {
        this.handledEvents.forEach(function (event) {
          if (event === 'jvpEventGeneric') {
            console.log('Forbidden event name: ' + event);
          }
          this.jvp.on(event, this.onEvent);
        }.bind(this));
      }
    } }, { key: 'unregisterListeners', value: function unregisterListeners()

    {
      if (this.isEventHandler()) {
        this.handledEvents.forEach(function (event) {
          this.jvp.off(event, this.onEvent);
        }.bind(this));
      }
    }

    /////////////////////////////////////////////////////////////////////////////////////////////////

    /*** arguments: event (string), data (any) */ }, { key: 'onEvent', value: function onEvent(
    event, data) {
      this.onEventGeneric(event, data);
    } }, { key: 'onEventGeneric', value: function onEventGeneric(

    event, data) {
      var eventToFunction = function eventToFunction(event, data) {
        var funcName = 'on' + event.replace('jvp', '');
        if (typeof this[funcName] !== 'function') {
          console.log('Event ' + event + ' has no generic handler in this ' + this.constructor.name + ' class (tried ' + funcName + ')');
        }
        return this[funcName].bind(this, data);
      };

      try {
        eventToFunction.call(this, event, data).call();
      } catch (err) {
        console.log('internal error happened while processing ' + event + ':' + err.message);
      }
    } }]);return EventHandler;}();exports.default =


EventHandler;

},{"./events":11}],11:[function(require,module,exports){
'use strict';module.exports = {

  UI_WAITING: 'jvpWaiting',
  UI_PLAYING: 'jvpPlaying',
  UI_EVENT: 'jvpEvent',
  UI_TIME_UPDATE: 'jvpTimeUpdate',

  /////////////////////////////////////////////////////////////////////////////////////////////////

  MEDIA_ATTACHING: 'jvpMediaAttaching',

  MEDIA_ATTACHED: 'jvpMediaAttached',

  /////////////////////////////////////////////////////////////////////////////////////////////////

  WEBSOCKET_ATTACHING: 'jvpWebsocketAttaching',

  WEBSOCKET_ATTACHED: 'jvpWebsocketAttached',

  WEBSOCKET_DATA_UPLOADING: 'jvpWebsocketDataUploading',

  /////////////////////////////////////////////////////////////////////////////////////////////////

  BUFFER_CREATED: 'jvpBufferCreated',

  BUFFER_APPENDING: 'jvpBufferAppending',

  BUFFER_RESET: 'jvpBufferReset',

  /////////////////////////////////////////////////////////////////////////////////////////////////

  FRAG_LOADING: 'jvpFragLoading',

  FRAG_PARSING_DATA: 'jvpFragParsingData',

  FRAG_PARSING_INIT_SEGMENT: 'jvpFragParsingInitSegment',

  /////////////////////////////////////////////////////////////////////////////////////////////////

  H264_DATA_PARSING: 'jvpH264DataParsing',

  H264_DATA_PARSED: 'jvpH264DataParsed',

  /////////////////////////////////////////////////////////////////////////////////////////////////

  JTT1078_DATA_PARSING: 'jvpJTT1078DataParsing',

  JTT1078_DATA_PARSED: 'jvpJTT1078DataParsed'

  /////////////////////////////////////////////////////////////////////////////////////////////////
};

},{}],12:[function(require,module,exports){
'use strict';
module.exports = require('./jvp.js').default;

},{"./jvp.js":13}],13:[function(require,module,exports){
/*** JVP interface, Apex Hu 2021.07.16 */
'use strict';Object.defineProperty(exports, "__esModule", { value: true });var _createClass = function () {function defineProperties(target, props) {for (var i = 0; i < props.length; i++) {var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}return function (Constructor, protoProps, staticProps) {if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;};}();

var _events = require('./events');var _events2 = _interopRequireDefault(_events);
var _flowController = require('./controller/flow-controller');var _flowController2 = _interopRequireDefault(_flowController);
var _bufferController = require('./controller/buffer-controller');var _bufferController2 = _interopRequireDefault(_bufferController);
var _events3 = require('events');var _events4 = _interopRequireDefault(_events3);
var _audioRecorder = require('./loader/audio-recorder');var _audioRecorder2 = _interopRequireDefault(_audioRecorder);
var _websocketLoader = require('./loader/websocket-loader');var _websocketLoader2 = _interopRequireDefault(_websocketLoader);function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}function _classCallCheck(instance, Constructor) {if (!(instance instanceof Constructor)) {throw new TypeError("Cannot call a class as a function");}}var

Jvp = function () {_createClass(Jvp, null, [{ key: 'isSupported', value: function isSupported()






    {
      return window.MediaSource && typeof window.MediaSource.isTypeSupported === 'function' && window.MediaSource.isTypeSupported('video/mp4; codecs="avc1.42c01f,mp4a.40.2"');
    } }, { key: 'version', get: function get() {// replaced with browserify-versionify transform
      return '0.1.0' + 'v.0.0.0.1';} }, { key: 'Events', get: function get()
    {
      return _events2.default;
    } }, { key: 'DefaultConfig', get: function get()

    {
      if (!Jvp.defaultConfig) {
        Jvp.defaultConfig = {
          // autoStartLoad: true,
          // startPosition: -1,
          debug: false,
          // fLoader: undefined,
          // loader: XhrLoader,
          //loader: FetchLoader,
          // fmp4FileUrl: 'xxxx.mp4',
          // fragLoadingTimeOut: 20000,
          // fragLoadingMaxRetry: 6,
          // fragLoadingRetryDelay: 1000,
          // fragLoadingMaxRetryTimeout: 64000,
          // fragLoadingLoopThreshold: 3,
          // forceKeyFrameOnDiscontinuity: true,
          // appendErrorMaxRetry: 3,
          jtt1078Version: '2011', // 2011、2019
          onWaiting: undefined, // callback func
          onPlaying: undefined, // callback func
          onEvent: undefined, // callback func
          onError: undefined, // callback func
          onTimeUpdate: undefined // callback func
        };
      }
      return Jvp.defaultConfig;
    }, set: function set(

    defaultConfig) {
      Jvp.defaultConfig = defaultConfig;
    }

    /////////////////////////////////////////////////////////////////////////////////////////////////
  }]);
  function Jvp() {var config = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};_classCallCheck(this, Jvp);

    var defaultConfig = Jvp.DefaultConfig;
    for (var prop in defaultConfig) {
      if (prop in config) {continue;}
      config[prop] = defaultConfig[prop];
    }
    this.config = config;

    // observer setup
    var observer = this.observer = new _events4.default();
    observer.trigger = function trigger(event) {for (var _len = arguments.length, data = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {data[_key - 1] = arguments[_key];}
      observer.emit.apply(observer, [event, event].concat(data));
    };
    observer.off = function off(event) {for (var _len2 = arguments.length, data = Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {data[_key2 - 1] = arguments[_key2];}
      observer.removeListener.apply(observer, [event].concat(data));
    };
    this.on = observer.on.bind(observer);
    this.off = observer.off.bind(observer);
    this.trigger = observer.trigger.bind(observer);

    this.flowController = new _flowController2.default(this);
    this.bufferController = new _bufferController2.default(this);
    this.websocketLoader = new _websocketLoader2.default(this);
    this.mediaType = undefined;
    this.audioRecorder = undefined;

    // 浏览器类型
    this.browserType = 0;
    if (navigator.userAgent.toLowerCase().indexOf("msie") !== -1) {
      this.browserType = 0;
    }
    if (navigator.userAgent.toLowerCase().indexOf("firefox") !== -1) {
      this.browserType = 1;
    }
    if (navigator.userAgent.toLowerCase().indexOf("chrome") !== -1) {
      this.browserType = 2;
    }
    if (navigator.userAgent.toLowerCase().indexOf("edge") !== -1) {
      this.browserType = 3;
    }

    // 注册本地事件    
    this.on(_events2.default.UI_WAITING, this.onWaiting.bind(this));
    this.on(_events2.default.UI_PLAYING, this.onPlaying.bind(this));
    this.on(_events2.default.UI_EVENT, this.onEvent.bind(this));
    this.on(_events2.default.UI_TIME_UPDATE, this.onTimeUpdate.bind(this));
    this.on(_events2.default.ERROR, this.onError.bind(this));
  }_createClass(Jvp, [{ key: 'destroy', value: function destroy()

    {
      this.flowController.destroy();
      this.bufferController.destroy();
      this.websocketLoader.destroy();
      if (this.audioRecorder) this.audioRecorder.destroy();
    }

    /////////////////////////////////////////////////////////////////////////////////////////////////
  }, { key: 'onWaiting', value: function onWaiting()
    {
      if (this.config.onWaiting) this.config.onWaiting(this);
    } }, { key: 'onPlaying', value: function onPlaying()

    {
      if (this.config.onPlaying) this.config.onPlaying(this);
    } }, { key: 'onEvent', value: function onEvent(

    eventName) {
      if (this.config.onEvent) this.config.onEvent(this, eventName);
    }

    // currentTime: seconds
  }, { key: 'onTimeUpdate', value: function onTimeUpdate(eventName, data) {
      if (this.config.onTimeUpdate) this.config.onTimeUpdate(this, eventName, data.currentTime, data.receivedBytesPerSecond, data.uploadBytesPerSecond);
    } }, { key: 'onError', value: function onError(

    data) {
      if (this.config.onError) this.config.onError(this, data);
    }

    /////////////////////////////////////////////////////////////////////////////////////////////////
  }, { key: 'attachMedia', value: function attachMedia(
    media) {var channelName = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'chX';var mediaType = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'H264Raw';var websocketProtocol = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 'http';var websocketIP = arguments[4];var websocketPort = arguments[5];var websocketName = arguments[6];var wsParams = arguments[7]; // 'H264Raw' 'FMp4' 'JTT1078'
      this.trigger(_events2.default.UI_WAITING, {});
      this.mediaType = mediaType;
      this.media = media;
      this.trigger(_events2.default.MEDIA_ATTACHING, { media: media, channelName: channelName, mediaType: mediaType, websocketProtocol: websocketProtocol, websocketIP: websocketIP, websocketPort: websocketPort, websocketName: websocketName, wsParams: wsParams });
    } }, { key: 'startCommunication', value: function startCommunication()

    {
      if (!this.audioRecorder) {
        _audioRecorder2.default.get(this, this.config, function (rec) {
          this.audioRecorder = rec;
          this.audioRecorder.start();
        }.bind(this));
      }
    } }, { key: 'stopCommunication', value: function stopCommunication()

    {
      if (this.audioRecorder) {
        this.audioRecorder.stop();
        this.audioRecorder.destroy();
        this.audioRecorder = undefined;
      }
    } }, { key: 'priintBinaryArray', value: function priintBinaryArray(

    array, prevText) {
      var idx = 0;
      while (true) {
        var startIdx = idx * 1000;
        var endIdx = (idx + 1) * 1000 - 1;
        if (endIdx >= array.length) endIdx = array.length - 1;
        if (startIdx >= array.length) break;

        var result = "";
        for (var i = startIdx; i <= endIdx; i++) {
          var char = array[i].toString(16).toUpperCase();
          if (char.length == 1) result += '0' + char;else result += char;
        }
        console.log(prevText + ' Array ' + idx + ': ' + result);
        idx++;
      }
    } }]);return Jvp;}();exports.default =


Jvp;

},{"./controller/buffer-controller":2,"./controller/flow-controller":3,"./events":11,"./loader/audio-recorder":14,"./loader/websocket-loader":15,"events":1}],14:[function(require,module,exports){
'use strict';Object.defineProperty(exports, "__esModule", { value: true });var _createClass = function () {function defineProperties(target, props) {for (var i = 0; i < props.length; i++) {var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}return function (Constructor, protoProps, staticProps) {if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;};}();var _events = require('../events');var _events2 = _interopRequireDefault(_events);
var _eventHandler = require('../event-handler');var _eventHandler2 = _interopRequireDefault(_eventHandler);function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}function _classCallCheck(instance, Constructor) {if (!(instance instanceof Constructor)) {throw new TypeError("Cannot call a class as a function");}}function _possibleConstructorReturn(self, call) {if (!self) {throw new ReferenceError("this hasn't been initialised - super() hasn't been called");}return call && (typeof call === "object" || typeof call === "function") ? call : self;}function _inherits(subClass, superClass) {if (typeof superClass !== "function" && superClass !== null) {throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);}subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } });if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;}var

AudioRecorder = function (_EventHandler) {_inherits(AudioRecorder, _EventHandler);

    function AudioRecorder(jvp, config, stream) {_classCallCheck(this, AudioRecorder);var _this = _possibleConstructorReturn(this, (AudioRecorder.__proto__ || Object.getPrototypeOf(AudioRecorder)).call(this,
        jvp));

        window.URL = window.URL || window.webkitURL;
        navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;

        _this.config = config || {};
        _this.config.sampleBits = config.sampleBits || 16;
        _this.config.sampleRate = config.sampleRate || 8e3;
        _this.context = new (window.webkitAudioContext || window.AudioContext || window.mozAudioContext || window.msAudioContext)();

        _this.audioInput = _this.context.createMediaStreamSource(stream);
        _this.createScript = _this.context.createScriptProcessor || _this.context.createJavaScriptNode;
        _this.recorder = _this.createScript.apply(_this.context, [4096, 1, 1]);
        console.log("input sampleRate=" + _this.context.sampleRate + " output sampleRate=" + config.sampleRate + " outBits=" + config.sampleBits);

        // 判断端字节序
        _this.littleEdian = function () {
            var buffer = new ArrayBuffer(2);
            new DataView(buffer).setInt16(0, 256, true);
            return new Int16Array(buffer)[0] === 256;
        }();

        _this.timer = null;
        _this.duration = 0;
        _this.volumn = 0;
        _this.audioData = {
            size: 0,
            buffer: [],
            inputSampleRate: _this.context.sampleRate,
            inputSampleBits: 16,
            outputSampleRate: config.sampleRate,
            oututSampleBits: config.sampleBits,
            seq1078: 0,

            input: function input(data) {
                this.buffer.push(new Float32Array(data));
                this.size += data.length;
            },

            /**数据合并压缩
                * 根据输入和输出的采样率压缩数据，
                * 比如输入的采样率是48k的，我们需要的是（输出）的是8k的，由于48k与8k是6倍关系，所以输入数据中每隔6取1位 */
            compress: function compress() {
                var idx = 0;
                var blob = new Float32Array(this.size);
                for (var i = 0; i < this.buffer.length; i++) {
                    blob.set(this.buffer[i], idx);
                    idx += this.buffer[i].length;
                }
                this.buffer = [];
                this.size = 0;

                var outputStep = parseInt(this.inputSampleRate / this.outputSampleRate);
                var outputLenght = Math.floor(blob.length / outputStep); // blob.length / outputStep;
                var output = new Float32Array(outputLenght);
                var idx1 = 0,idx2 = 0;
                while (idx1 < outputLenght) {
                    output[idx1] = blob[idx2];
                    idx2 += outputStep;
                    idx1++;
                }
                return output;
            },

            encodeWAV: function encodeWAV(littleEdian) {
                var numChannels = 1;
                var sampleRate = Math.min(this.inputSampleRate, this.outputSampleRate);
                var sampleBits = Math.min(this.inputSampleBits, this.oututSampleBits);
                var samples = this.compress();
                var samplesLength = samples.length * (sampleBits / 8);
                var buffer = new ArrayBuffer(44 + samplesLength);
                var view = new DataView(buffer);

                var idx = 0;
                var w2s = function w2s(txt) {
                    for (var i = 0; i < txt.length; i++) {
                        view.setUint8(idx + i, txt.charCodeAt(i));
                    }
                };

                w2s("RIFF");idx += 4; /* RIFF identifier */
                view.setUint32(idx, 36 + samplesLength, true);idx += 4; /* RIFF chunk length */
                w2s("WAVE");idx += 4; /* RIFF type */

                w2s("fmt ");idx += 4; /* format chunk identifier */
                view.setUint32(idx, 16, true);idx += 4; /* format chunk length */
                view.setUint16(idx, 1, true);idx += 2; /* sample format (raw) */
                view.setUint16(idx, numChannels, true);idx += 2; /* channel count */
                view.setUint32(idx, sampleRate, true);idx += 4; /* sample rate */
                view.setUint32(idx, numChannels * sampleRate * (sampleBits / 8), true);idx += 4; /* byte rate (sample rate * block align) */
                view.setUint16(idx, numChannels * (sampleBits / 8), true);idx += 2; /* block align (channel count * bytes per sample) */
                view.setUint16(idx, sampleBits, true);idx += 2; /* bits per sample */

                w2s("data");idx += 4; /* data chunk identifier */
                view.setUint32(idx, samplesLength, true);idx += 4; /* data chunk length */
                this.floatTo16BitPCM(view, idx, samples, littleEdian);
                // if (sampleBits === 8) {
                //     for (var i = 0; i < samples.length; i++, idx++) {
                //         var h = Math.max(-1, Math.min(1, samples[i]));
                //         var c = h < 0 ? h * 0x8000 : h * 0x7FFF;
                //         c = parseInt(0xFF / (0xFFFF / (c + 0x8000)));
                //         view.setInt8(idx, c, true);
                //     }
                // }
                // else {
                //     for (var i = 0; i < samples.length; i++, idx += 2) {
                //         var y = Math.max(-1, Math.min(1, samples[i]));
                //         view.setInt16(idx, y < 0 ? y * 0x8000 : y * 0x7FFF, littleEdian);
                //     }
                // }

                return new Blob([view], { type: "audio/wav" });
            },

            encodePCM: function encodePCM(littleEdian) {
                var bytes = this.compress();
                if (bytes.length <= 0) return undefined;

                var sampleBits = 16;
                var samplesLength = bytes.length * (sampleBits / 8);
                var data = new Uint8Array(samplesLength);
                var view = new DataView(data.buffer);

                // 数据体
                this.floatTo16BitPCM(view, 0, bytes, littleEdian);
                return data;
            },

            floatTo16BitPCM: function floatTo16BitPCM(output, offset, input, littleEdian) {
                for (var i = 0; i < input.length; i++, offset += 2) {
                    var s = Math.max(-1, Math.min(1, input[i]));
                    output.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, littleEdian);
                }
            } };return _this;

    }_createClass(AudioRecorder, [{ key: 'destroy', value: function destroy()

        {
            _eventHandler2.default.prototype.destroy.call(this);
        }

        /////////////////////////////////////////////////////////////////////////////////////////////////
    }, { key: 'start',

































        /////////////////////////////////////////////////////////////////////////////////////////////////
        value: function start()
        {
            this.audioInput.connect(this.recorder);
            this.recorder.connect(this.context.destination);
            this.duration = 0;
            var the = this;
            this.sendMsg(the);

            // 音频采集
            this.recorder.onaudioprocess = function (e) {
                var lData = e.inputBuffer.getChannelData(0);
                // 统计录音时长
                the.duration += 4096 / the.context.sampleRate;
                // 计算音量百分比
                the.volumn = Math.max.apply(Math, lData) * 100;
                the.audioData.input(lData);
            };
        } }, { key: 'stop', value: function stop()

        {
            if (this.timer) clearInterval(this.timer);
            this.recorder.disconnect();
        } }, { key: 'sendMsg', value: function sendMsg(

        the) {
            this.timer = setInterval(function () {
                var e = the.audioData.encodePCM(the.littleEdian);
                if (e) the.jvp.trigger(_events2.default.WEBSOCKET_DATA_UPLOADING, { duration: the.duration, volumn: the.volumn, data: e.buffer });
            }, 300);
        }

        //获取音频文件
    }, { key: 'getBlob', value: function getBlob() {
            this.stop();
            return audioData.encodeWAV();
        }

        //回放
    }, { key: 'play', value: function play(audio) {
            audio.src = window.URL.createObjectURL(this.getBlob());
        }

        /** 下载录音的wav数据
           * @param {blob}   需要下载的blob数据类型
           * @param {string} [name='recorder']    重命名的名字     */ }, { key: 'downloadWAV', value: function downloadWAV(
        wavblob) {var name = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'recorder';
            _download(wavblob, name, 'wav');
        }

        /** 下载录音pcm数据
           * @param {blob}   需要下载的blob数据类型
           * @param {string} [name='recorder']    重命名的名字
           * @memberof Recorder     */ }, { key: 'downloadPCM', value: function downloadPCM(
        pcmBlob) {var name = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'recorder';
            var e = this.audioData.encodePCM(this.littleEdian);
            _download(pcmBlob, name, 'pcm');
        }

        /////////////////////////////////////////////////////////////////////////////////////////////////

        /** 下载录音文件
         * @private
         * @param {*} blob      blob数据
         * @param {string} name 下载的文件名
         * @param {string} type 下载的文件后缀 */ }, { key: '_download', value: function _download(
        blob, name, type) {
            var oA = document.createElement('a');

            oA.href = window.URL.createObjectURL(blob);
            oA.download = name + '.' + type;
            oA.click();
        } }], [{ key: 'get', value: function get(jvp, config, callback) {if (navigator.getUserMedia) {navigator.getUserMedia({ audio: true }, //只启用音频
                function (stream) {var rec = new AudioRecorder(jvp, config, stream);if (callback) callback(rec);}, function (error) {switch (error.code || error.name) {case 'PERMISSION_DENIED':case 'PermissionDeniedError':console.log('用户拒绝提供信息。');break;case 'NOT_SUPPORTED_ERROR':case 'NotSupportedError':console.log('浏览器不支持硬件设备。');break;case 'MANDATORY_UNSATISFIED_ERROR':case 'MandatoryUnsatisfiedError':console.log('无法发现指定的硬件设备。');break;default:console.log('无法打开麦克风。异常信息:' + (error.code || error.name));break;}});} else {console.log('当前浏览器不支持录音功能。');return;}} }]);return AudioRecorder;}(_eventHandler2.default);exports.default =

AudioRecorder;

},{"../event-handler":10,"../events":11}],15:[function(require,module,exports){
'use strict';Object.defineProperty(exports, "__esModule", { value: true });var _createClass = function () {function defineProperties(target, props) {for (var i = 0; i < props.length; i++) {var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}return function (Constructor, protoProps, staticProps) {if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;};}();

var _events = require('../events');var _events2 = _interopRequireDefault(_events);
var _eventHandler = require('../event-handler');var _eventHandler2 = _interopRequireDefault(_eventHandler);
var _h264NalSlicesreader = require('../demux/h264-nal-slicesreader.js');var _h264NalSlicesreader2 = _interopRequireDefault(_h264NalSlicesreader);
var _jtt1078PackageReader = require('../demux/jtt1078-package-reader.js');var _jtt1078PackageReader2 = _interopRequireDefault(_jtt1078PackageReader);function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}function _classCallCheck(instance, Constructor) {if (!(instance instanceof Constructor)) {throw new TypeError("Cannot call a class as a function");}}function _possibleConstructorReturn(self, call) {if (!self) {throw new ReferenceError("this hasn't been initialised - super() hasn't been called");}return call && (typeof call === "object" || typeof call === "function") ? call : self;}function _inherits(subClass, superClass) {if (typeof superClass !== "function" && superClass !== null) {throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);}subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } });if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;} /** Websocket Loader */var

WebsocketLoader = function (_EventHandler) {_inherits(WebsocketLoader, _EventHandler);

  function WebsocketLoader(jvp) {_classCallCheck(this, WebsocketLoader);var _this = _possibleConstructorReturn(this, (WebsocketLoader.__proto__ || Object.getPrototypeOf(WebsocketLoader)).call(this,
    jvp, _events2.default.WEBSOCKET_ATTACHING, _events2.default.WEBSOCKET_DATA_UPLOADING, _events2.default.WEBSOCKET_MESSAGE_SENDING));
    _this.slicesReader = new _h264NalSlicesreader2.default(jvp);
    _this.packageReader = new _jtt1078PackageReader2.default(jvp);
    _this.mediaType = undefined;
    _this.channelName = undefined;
    _this.websocketName = undefined;
    _this.avFlag = 0; // 0=音视频 1=音频 2=视频

    _this._msrLastTimeBufferSize = 0;

    _this._seconds = 0;
    _this._sendBytes = 0;
    _this._receivedBytes = 0;
    _this._updateTimer = undefined;

    _this._audioVolumn = 0;
    _this._audioDuration = 0;return _this;
  }_createClass(WebsocketLoader, [{ key: 'destroy', value: function destroy()

    {
      if (this.client instanceof WebSocket) {
        this.client.close();
        console.log("Websocket close!!!");
      } else {
        this.client.abort();
        console.log("XMLHttpRequest abort!!!");
      }
      this.stopUpdateTimer();
      this.slicesReader.destroy();
      this.packageReader.destroy();
      _eventHandler2.default.prototype.destroy.call(this);
    }

    /////////////////////////////////////////////////////////////////////////////////////////////////
  }, { key: 'onWebsocketAttaching', value: function onWebsocketAttaching(
    data) {
      this.mediaType = data.mediaType;
      this.channelName = data.channelName;
      this.websocketName = data.websocketName;

      // 从URL中获取音视频标志：0=音视频 1=音频 2=视频
      var wnArray = this.websocketName.split(".");
      if (wnArray.length >= 4) {
        this.avFlag = parseInt(wnArray[3]);
        console.log("onWebsocketAttaching register avFlag is " + this.avFlag);
      }

      // 创建数据接收
      if (data.websocket instanceof WebSocket) {
        this.client = data.websocket;
        this.client.onopen = this.initSocketClient.bind(this);
        this.client.onerror = function (e) {
          console.log('WebSocket发生错误');
          console.log(e);
        };
        this.client.onclose = function (e) {
          console.log('websocket Disconnected: ' + e.code + ' ' + e.reason + ' ' + e.wasClean);
          console.log(e);
        };
      } else
      if (data.websocket instanceof XMLHttpRequest) {
        this.client = data.websocket;
        if (this.jvp.browserType == 0) {// msie
          var a = this._reader = new self.MSStreamReader();
          a.onprogress = this._msrOnProgress.bind(this);
          a.onload = function (e) {console.log("http _msrOnLoad()");};
          a.onerror = function (e) {console.log("http _msrOnError()");};

          this.client.responseType = "ms-stream";
          this.client.onreadystatechange = this.receiveSocketMessageHttp.bind(this);
          this.client.ontimeout = function (e) {console.log("XMLHttpRequest ontimeout Disconnected!");};
          this.client.onerror = function (e) {console.log("XMLHttpRequest onerror Disconnected!");};
          this.client.send(null);
          console.log("XMLHttpRequest reg callback handle func OK, browserType=" + this.jvp.browserType);
        } else
        if (this.jvp.browserType == 1) {
          this.client.responseType = "moz-chunked-arraybuffer";
          this.client.onprogress = this.receiveSocketMessageHttp.bind(this);
          this.client.ontimeout = function (e) {console.log("XMLHttpRequest ontimeout Disconnected!");};
          this.client.onerror = function (e) {console.log("XMLHttpRequest onerror Disconnected!");};
          this.client.send(null);
          console.log("XMLHttpRequest reg callback handle func OK, browserType=" + this.jvp.browserType);
        } else
        {
          this.client.responseType = "moz-chunked-arraybuffer";
          this.client.onprogress = this.receiveSocketMessageHttp.bind(this);
          this.client.ontimeout = function (e) {console.log("XMLHttpRequest ontimeout Disconnected!");};
          this.client.onerror = function (e) {console.log("XMLHttpRequest onerror Disconnected!");};
          this.client.send(null);
          console.log("XMLHttpRequest reg callback handle func OK, browserType=" + this.jvp.browserType);
        }
      } else
      if (data.websocket.indexOf("http") != -1 && this.jvp.browserType == 2) {
        this.client = data.websocket;
        var processResponse = function processResponse(response) {
          this.startUpdateTimer();

          var reader = response.body.getReader();
          var processReceived = function processReceived(result) {
            if (result.done) {
              console.log("Fetch complete OVER");
              return;
            }
            if (!result.done && result.value) {
              this.receiveSocketMessage({ data: result.value });
            }
            return reader.read().then(processReceived.bind(this));
          };
          reader.read().then(processReceived.bind(this));
        };

        console.log("http chrome fetch Starting...");
        fetch(data.websocket, { method: "get", mode: 'cors' }).then(processResponse.bind(this)).catch(function (error) {console.log(error);});
      } else
      {
        console.log("mediaType Exception, so create client event handle func FAIL! mediaType=" + this.mediaType);
      }
    }

    // { duration: the.duration, volumn: the.volumn, data: e.buffer }
  }, { key: 'onWebsocketDataUploading', value: function onWebsocketDataUploading(event) {
      this._audioVolumn = event.volumn;
      this._audioDuration = event.duration;

      if (this.client instanceof WebSocket) {
        this.client.send(event.data);
        this._sendBytes += event.data.byteLength;
        //this.jvp.priintBinaryArray(new Uint8Array(event.data, 0), 'Duration: ' + this._audioDuration + ', Uploading');
      } else
      if (this.client instanceof XMLHttpRequest) {
        this.client.send(event.data);
        this._sendBytes += event.data.byteLength;
      } else
      {
        console.log("mediaType Exception, so create client event handle func FAIL! mediaType=" + this.mediaType);
      }
    }

    /////////////////////////////////////////////////////////////////////////////////////////////////
  }, { key: 'initSocketClient', value: function initSocketClient(
    client) {
      this.client.binaryType = 'arraybuffer';
      this.client.onmessage = this.receiveSocketMessage.bind(this);

      this.startUpdateTimer();
      console.log('Websocket Open And reg receiveSocketMessage handle func OK!');
    } }, { key: 'startUpdateTimer', value: function startUpdateTimer()

    {
      this.stopUpdateTimer();
      this._updateTimer = setInterval(function () {
        var sendBytes = this._sendBytes;
        var receivedBytes = this._receivedBytes;
        this._sendBytes = 0;
        this._receivedBytes = 0;
        this._seconds++;
        this.jvp.trigger(_events2.default.UI_TIME_UPDATE, { eventName: 'Updating', currentTime: this._seconds, receivedBytesPerSecond: receivedBytes, uploadBytesPerSecond: sendBytes, audioDuration: this._audioDuration, audioVolumn: this._audioVolumn });

      }.bind(this), 1000);
    } }, { key: 'stopUpdateTimer', value: function stopUpdateTimer()

    {
      if (this._updateTimer) clearInterval(this._updateTimer);
      this._updateTimer = undefined;
    } }, { key: 'receiveSocketMessage', value: function receiveSocketMessage(

    event) {
      if (document['hidden']) return;

      var copy = new Uint8Array(event.data);
      this._receivedBytes += copy.byteLength;
      if (this.mediaType === 'FMp4') {
        this.jvp.trigger(_events2.default.WEBSOCKET_ATTACHED, { payload: copy, avFlag: this.avFlag });
      }
      if (this.mediaType === 'H264Raw') {
        this.jvp.trigger(_events2.default.H264_DATA_PARSING, { data: copy, avFlag: this.avFlag });
      }
      if (this.mediaType === 'JTT1078') {
        this.jvp.trigger(_events2.default.JTT1078_DATA_PARSING, { data: copy, avFlag: this.avFlag });
      }
    } }, { key: 'receiveSocketMessageHttp', value: function receiveSocketMessageHttp(

    event) {
      if ((this.client.status >= 200 && this.client.status < 300 || this.client.status == 304) && this.client.readyState == 3) {
        var i = this.client.response;
        if (i) {
          this.receiveSocketMessage({ data: i });
        }
      } else {
        console.log("http Recv data readyState!=3 readyState=" + this.client.readyState);
      }
    } }, { key: '_msrOnProgress', value: function _msrOnProgress(

    event) {
      var target = event.target;
      var result = target.result;

      if (result == null) {
        console.log("http _msrOnProgress () bigbuffer is null");
        return;
      }

      var r = result.slice(this._msrLastTimeBufferSize);
      this._msrLastTimeBufferSize = result.byteLength;
      this.receiveSocketMessage({ data: r });
    } }]);return WebsocketLoader;}(_eventHandler2.default);exports.default =


WebsocketLoader;

},{"../demux/h264-nal-slicesreader.js":6,"../demux/jtt1078-package-reader.js":8,"../event-handler":10,"../events":11}],16:[function(require,module,exports){
'use strict';Object.defineProperty(exports, "__esModule", { value: true });var _createClass = function () {function defineProperties(target, props) {for (var i = 0; i < props.length; i++) {var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}return function (Constructor, protoProps, staticProps) {if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;};}(); /***  ADTS parser helper  
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 idx=0
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 1	  Syncword						            12	all bits must be 1
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 2	  MPEG version					          1	  0 for MPEG-4, 1 for MPEG-2
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 3	  Layer							              2	  always 0
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 4 	Protection Absent				        1	  et to 1 if there is no CRC and 0 if there is CRC
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 idx=3
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 5	  Profile							            2	  the MPEG-4 Audio Object Type minus 1
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 6	  MPEG-4 Sampling Frequency Index	4	  MPEG-4 Sampling Frequency Index (15 is forbidden)
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 7	  Private Stream					        1	  set to 0 when encoding, ignore when decoding
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 8	  MPEG-4 Channel Configuration	  3	  MPEG-4 Channel Configuration (in the case of 0, the channel configuration is sent via an inband PCE)
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 9	  Originality						          1	  set to 0 when encoding, ignore when decoding
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 10	Home							              1	  set to 0 when encoding, ignore when decoding
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 11	Copyrighted Stream				      1	  set to 0 when encoding, ignore when decoding
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 12	Copyrighted Start				        1	  set to 0 when encoding, ignore when decoding
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 13	Frame Length				            13	this value must include 7 or 9 bytes of header length: FrameLength = (ProtectionAbsent == 1 ? 7 : 9) + size(AACFrame)
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 14	Buffer Fullness					        11	buffer fullness
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 15	Number of AAC Frames			      2	  number of AAC frames (RDBs) in ADTS frame minus 1, for maximum compatibility always use 1 AAC frame per ADTS frame
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 idx=7
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 16	CRC								              16	CRC if protection absent is 0 */
var _events = require('../events');var _events2 = _interopRequireDefault(_events);
var _logger = require('../utils/logger');
var _errors = require('../errors');function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}function _classCallCheck(instance, Constructor) {if (!(instance instanceof Constructor)) {throw new TypeError("Cannot call a class as a function");}}var

ADTS = function () {function ADTS() {_classCallCheck(this, ADTS);}_createClass(ADTS, null, [{ key: 'initTrackConfig', value: function initTrackConfig(

    track, observer, data, offset, audioCodec) {
      if (!track.samplerate) {
        var config = ADTS.getAudioConfig(observer, data, offset, audioCodec);
        track.config = config.config;
        track.samplerate = config.samplerate;
        track.channelCount = config.channelCount;
        track.codec = config.codec;
        track.manifestCodec = config.manifestCodec;
        _logger.logger.log('parsed codec:' + track.codec + ',rate:' + config.samplerate + ',nb channel:' + config.channelCount);
      }
    } }, { key: 'getAudioConfig', value: function getAudioConfig(

    observer, data, offset, audioCodec) {
      var adtsObjectType = void 0, // :int
      adtsSampleingIndex = void 0, // :int
      adtsExtensionSampleingIndex = void 0, // :int
      adtsChanelConfig = void 0, // :int
      config = void 0,
      userAgent = navigator.userAgent.toLowerCase(),
      manifestCodec = audioCodec,
      adtsSampleingRates = [96000, 88200, 64000, 48000, 44100, 32000, 24000, 22050, 16000, 12000, 11025, 8000, 7350];

      // byte 2
      adtsObjectType = ((data[offset + 2] & 0xC0) >>> 6) + 1;
      adtsSampleingIndex = (data[offset + 2] & 0x3C) >>> 2;
      if (adtsSampleingIndex > adtsSampleingRates.length - 1) {
        observer.trigger(_events2.default.ERROR, { type: _errors.ErrorTypes.MEDIA_ERROR, details: _errors.ErrorDetails.FRAG_PARSING_ERROR, fatal: true, reason: 'invalid ADTS sampling index:' + adtsSampleingIndex });
        return;
      }
      adtsChanelConfig = (data[offset + 2] & 0x01) << 2;
      adtsChanelConfig |= (data[offset + 3] & 0xC0) >>> 6; // byte 3
      _logger.logger.log('manifest codec:' + audioCodec + ',ADTS data:type:' + adtsObjectType + ',sampleingIndex:' + adtsSampleingIndex + '[' + adtsSampleingRates[adtsSampleingIndex] + 'Hz],channelConfig:' + adtsChanelConfig);

      // firefox: freq less than 24kHz = AAC SBR (HE-AAC)
      if (/firefox/i.test(userAgent)) {
        if (adtsSampleingIndex >= 6) {
          adtsObjectType = 5;
          config = new Array(4);
          // HE-AAC uses SBR (Spectral Band Replication) , high frequencies are constructed from low frequencies
          // there is a factor 2 between frame sample rate and output sample rate
          // multiply frequency by 2 (see table below, equivalent to substract 3)
          adtsExtensionSampleingIndex = adtsSampleingIndex - 3;
        } else {
          adtsObjectType = 2;
          config = new Array(2);
          adtsExtensionSampleingIndex = adtsSampleingIndex;
        }
      }
      // Android : always use AAC
      else if (userAgent.indexOf('android') !== -1) {
          adtsObjectType = 2;
          config = new Array(2);
          adtsExtensionSampleingIndex = adtsSampleingIndex;
        }
        // for other browsers (Chrome/Vivaldi/Opera ...)
        // always force audio type to be HE-AAC SBR, as some browsers do not support audio codec switch properly (like Chrome ...)
        else {
            adtsObjectType = 5;
            config = new Array(4);
            // if (manifest codec is HE-AAC or HE-AACv2) OR (manifest codec not specified AND frequency less than 24kHz)
            if (audioCodec && (audioCodec.indexOf('mp4a.40.29') !== -1 || audioCodec.indexOf('mp4a.40.5') !== -1) || !audioCodec && adtsSampleingIndex >= 6) {
              // HE-AAC uses SBR (Spectral Band Replication) , high frequencies are constructed from low frequencies
              // there is a factor 2 between frame sample rate and output sample rate
              // multiply frequency by 2 (see table below, equivalent to substract 3)
              adtsExtensionSampleingIndex = adtsSampleingIndex - 3;
            } else {
              // if (manifest codec is AAC) AND (frequency less than 24kHz AND nb channel is 1) OR (manifest codec not specified and mono audio)
              // Chrome fails to play back with low frequency AAC LC mono when initialized with HE-AAC.  This is not a problem with stereo.
              if (audioCodec && audioCodec.indexOf('mp4a.40.2') !== -1 && (adtsSampleingIndex >= 6 && adtsChanelConfig === 1 || /vivaldi/i.test(userAgent)) || !audioCodec && adtsChanelConfig === 1) {
                adtsObjectType = 2;
                config = new Array(2);
              }
              adtsExtensionSampleingIndex = adtsSampleingIndex;
            }
          }

      /* refer to http://wiki.multimedia.cx/index.php?title=MPEG-4_Audio#Audio_Specific_Config
                ISO 14496-3 (AAC).pdf - Table 1.13 — Syntax of AudioSpecificConfig()
              Audio Profile / Audio Object Type
              0: Null
              1: AAC Main
              2: AAC LC (Low Complexity)
              3: AAC SSR (Scalable Sample Rate)
              4: AAC LTP (Long Term Prediction)
              5: SBR (Spectral Band Replication)
              6: AAC Scalable
             sampling freq
              0: 96000 Hz
              1: 88200 Hz
              2: 64000 Hz
              3: 48000 Hz
              4: 44100 Hz
              5: 32000 Hz
              6: 24000 Hz
              7: 22050 Hz
              8: 16000 Hz
              9: 12000 Hz
              10: 11025 Hz
              11: 8000 Hz
              12: 7350 Hz
              13: Reserved
              14: Reserved
              15: frequency is written explictly
              Channel Configurations
              These are the channel configurations:
              0: Defined in AOT Specifc Config
              1: 1 channel: front-center
              2: 2 channels: front-left, front-right
            */
      // audioObjectType = profile => profile, the MPEG-4 Audio Object Type minus 1
      config[0] = adtsObjectType << 3;
      // samplingFrequencyIndex
      config[0] |= (adtsSampleingIndex & 0x0E) >> 1;
      config[1] |= (adtsSampleingIndex & 0x01) << 7;
      // channelConfiguration
      config[1] |= adtsChanelConfig << 3;
      if (adtsObjectType === 5) {
        // adtsExtensionSampleingIndex
        config[1] |= (adtsExtensionSampleingIndex & 0x0E) >> 1;
        config[2] = (adtsExtensionSampleingIndex & 0x01) << 7;
        // adtsObjectType (force to 2, chrome is checking that object type is less than 5 ???
        //    https://chromium.googlesource.com/chromium/src.git/+/master/media/formats/mp4/aac.cc
        config[2] |= 2 << 2;
        config[3] = 0;
      }
      return { config: config, samplerate: adtsSampleingRates[adtsSampleingIndex], channelCount: adtsChanelConfig, codec: 'mp4a.40.' + adtsObjectType, manifestCodec: manifestCodec };
    }

    /////////////////////////////////////////////////////////////////////////////////////////////////

    // Look for ADTS header | 1111 1111 | 1111 X00X | where X can be either 0 or 1
    // Layer bits (position 14 and 15) in header should be always 0 for ADTS
    // More info https://wiki.multimedia.cx/index.php?title=ADTS
  }, { key: 'isHeader', value: function isHeader(data, offset) {
      if (offset + 1 < data.length && ADTS.isHeaderPattern(data, offset)) {
        return true;
      }
      return false;
    }

    // 与isHeader相同，但我们也检查ADTS帧是否紧跟在最后一个ADTS帧之后，或者是否到达了数据的末尾 
    // same as isHeader but we also check that ADTS frame follows last ADTS frame or end of data is reached
  }, { key: 'probe', value: function probe(data, offset) {
      if (offset + 1 < data.length && ADTS.isHeaderPattern(data, offset)) {
        // ADTS header Length
        var headerLength = ADTS.getHeaderLength(data, offset);
        // ADTS frame Length
        var frameLength = headerLength;
        if (offset + 5 < data.length) {
          frameLength = ADTS.getFullFrameLength(data, offset);
        }

        var newOffset = offset + frameLength;
        if (newOffset === data.length || newOffset + 1 < data.length && ADTS.isHeaderPattern(data, newOffset)) {
          return true;
        }
      }
      return false;
    }

    /////////////////////////////////////////////////////////////////////////////////////////////////

    // return  { offset, headerLength, frameLength, stamp }
  }, { key: 'parseFrameHeader', value: function parseFrameHeader(data, offset, pts, frameIndex, frameDuration) {
      var headerLength = void 0,frameLength = void 0,stamp = void 0;
      var length = data.length;

      // The protection skip bit tells us if we have 2 bytes of CRC data at the end of the ADTS header
      headerLength = ADTS.getHeaderLength(data, offset);

      // retrieve frame size
      frameLength = ADTS.getFullFrameLength(data, offset);
      frameLength -= headerLength;

      if (frameLength > 0 && offset + headerLength + frameLength <= length) {
        stamp = pts + frameIndex * frameDuration;
        // logger.log(`AAC frame, offset/length/total/pts:${offset+headerLength}/${frameLength}/${data.byteLength}/${(stamp/90).toFixed(0)}`);
        return { offset: offset, headerLength: headerLength, frameLength: frameLength, stamp: stamp };
      }
      return undefined;
    }

    // return { sample: aacSample, length: frameLength + headerLength }
  }, { key: 'appendFrame', value: function appendFrame(track, data, offset, pts, frameIndex) {
      var frameDuration = ADTS.getFrameDuration(track.samplerate);
      var header = ADTS.parseFrameHeader(data, offset, pts, frameIndex, frameDuration);
      if (header) {
        var stamp = header.stamp;
        var headerLength = header.headerLength;
        var frameLength = header.frameLength;

        // logger.log(`AAC frame, offset/length/total/pts:${offset+headerLength}/${frameLength}/${data.byteLength}/${(stamp/90).toFixed(0)}`);
        var aacSample = {
          unit: data.subarray(offset + headerLength, offset + headerLength + frameLength),
          pts: stamp,
          dts: stamp };


        track.samples.push(aacSample);
        track.len += frameLength;
        return { sample: aacSample, length: frameLength + headerLength };
      }

      return undefined;
    }

    /////////////////////////////////////////////////////////////////////////////////////////////////

    // 判断是否0xFFF打头，且Layer==00
    // 0xF6 = 1111 0110
  }, { key: 'isHeaderPattern', value: function isHeaderPattern(data, offset) {
      return data[offset] === 0xff && (data[offset + 1] & 0xf6) === 0xf0;
    } }, { key: 'getHeaderLength', value: function getHeaderLength(

    data, offset) {
      return data[offset + 1] & 0x01 ? 7 : 9;
    } }, { key: 'getFullFrameLength', value: function getFullFrameLength(

    data, offset) {
      return (data[offset + 3] & 0x03) << 11 | data[offset + 4] << 3 | (data[offset + 5] & 0xE0) >>> 5;
    } }, { key: 'getFrameDuration', value: function getFrameDuration(

    samplerate) {
      return 1024 * 90000 / samplerate;
    } }]);return ADTS;}();exports.default =


ADTS;

},{"../errors":9,"../events":11,"../utils/logger":20}],17:[function(require,module,exports){
"use strict";Object.defineProperty(exports, "__esModule", { value: true });var _createClass = function () {function defineProperties(target, props) {for (var i = 0; i < props.length; i++) {var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}return function (Constructor, protoProps, staticProps) {if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;};}();function _classCallCheck(instance, Constructor) {if (!(instance instanceof Constructor)) {throw new TypeError("Cannot call a class as a function");}} /***  AAC helper */var

AAC = function () {function AAC() {_classCallCheck(this, AAC);}_createClass(AAC, null, [{ key: "getSilentFrame", value: function getSilentFrame(
    channelCount) {
      if (channelCount === 1) {
        return new Uint8Array([0x00, 0xc8, 0x00, 0x80, 0x23, 0x80]);
      } else if (channelCount === 2) {
        return new Uint8Array([0x21, 0x00, 0x49, 0x90, 0x02, 0x19, 0x00, 0x23, 0x80]);
      } else if (channelCount === 3) {
        return new Uint8Array([0x00, 0xc8, 0x00, 0x80, 0x20, 0x84, 0x01, 0x26, 0x40, 0x08, 0x64, 0x00, 0x8e]);
      } else if (channelCount === 4) {
        return new Uint8Array([0x00, 0xc8, 0x00, 0x80, 0x20, 0x84, 0x01, 0x26, 0x40, 0x08, 0x64, 0x00, 0x80, 0x2c, 0x80, 0x08, 0x02, 0x38]);
      } else if (channelCount === 5) {
        return new Uint8Array([0x00, 0xc8, 0x00, 0x80, 0x20, 0x84, 0x01, 0x26, 0x40, 0x08, 0x64, 0x00, 0x82, 0x30, 0x04, 0x99, 0x00, 0x21, 0x90, 0x02, 0x38]);
      } else if (channelCount === 6) {
        return new Uint8Array([0x00, 0xc8, 0x00, 0x80, 0x20, 0x84, 0x01, 0x26, 0x40, 0x08, 0x64, 0x00, 0x82, 0x30, 0x04, 0x99, 0x00, 0x21, 0x90, 0x02, 0x00, 0xb2, 0x00, 0x20, 0x08, 0xe0]);
      }
      return null;
    } }]);return AAC;}();exports.default =


AAC;

},{}],18:[function(require,module,exports){
'use strict';Object.defineProperty(exports, "__esModule", { value: true });var _createClass = function () {function defineProperties(target, props) {for (var i = 0; i < props.length; i++) {var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}return function (Constructor, protoProps, staticProps) {if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;};}();function _classCallCheck(instance, Constructor) {if (!(instance instanceof Constructor)) {throw new TypeError("Cannot call a class as a function");}} /*** Generate MP4 Box */

//  MP4 boxes generator for ISO BMFF (ISO Base Media File Format, defined in ISO/IEC 14496-12)
var MP4 = function () {function MP4() {_classCallCheck(this, MP4);}_createClass(MP4, null, [{ key: 'init', value: function init()
    {
      MP4.types = {
        avc1: [], avcC: [], btrt: [], dinf: [],
        dref: [], esds: [], ftyp: [], hdlr: [],
        mdat: [], mdhd: [], mdia: [], mfhd: [],
        minf: [], moof: [], moov: [], mp4a: [],
        mvex: [], mvhd: [], sdtp: [], stbl: [],
        stco: [], stsc: [], stsd: [], stsz: [],
        stts: [], tfdt: [], tfhd: [], traf: [],
        trak: [], trun: [], trex: [], tkhd: [],
        vmhd: [], smhd: [], '.mp3': [] };


      for (var i in MP4.types) {
        if (MP4.types.hasOwnProperty(i)) {
          MP4.types[i] = [i.charCodeAt(0), i.charCodeAt(1), i.charCodeAt(2), i.charCodeAt(3)];
        }
      }

      var constants = MP4.constants = {};

      var videoHdlr = new Uint8Array([
      0x00, // version 0
      0x00, 0x00, 0x00, // flags
      0x00, 0x00, 0x00, 0x00, // pre_defined
      0x76, 0x69, 0x64, 0x65, // handler_type: 'vide'
      0x00, 0x00, 0x00, 0x00, // reserved
      0x00, 0x00, 0x00, 0x00, // reserved
      0x00, 0x00, 0x00, 0x00, // reserved
      0x56, 0x69, 0x64, 0x65,
      0x6f, 0x48, 0x61, 0x6e,
      0x64, 0x6c, 0x65, 0x72, 0x00 // name: 'VideoHandler'
      ]);

      var audioHdlr = new Uint8Array([
      0x00, // version 0
      0x00, 0x00, 0x00, // flags
      0x00, 0x00, 0x00, 0x00, // pre_defined
      0x73, 0x6f, 0x75, 0x6e, // handler_type: 'soun'
      0x00, 0x00, 0x00, 0x00, // reserved
      0x00, 0x00, 0x00, 0x00, // reserved
      0x00, 0x00, 0x00, 0x00, // reserved
      0x53, 0x6f, 0x75, 0x6e,
      0x64, 0x48, 0x61, 0x6e,
      0x64, 0x6c, 0x65, 0x72, 0x00 // name: 'SoundHandler'
      ]);

      MP4.HDLR_TYPES = {
        'video': videoHdlr,
        'audio': audioHdlr };


      var dref = new Uint8Array([
      0x00, // version 0
      0x00, 0x00, 0x00, // flags
      0x00, 0x00, 0x00, 0x01, // entry_count
      0x00, 0x00, 0x00, 0x0c, // entry_size
      0x75, 0x72, 0x6c, 0x20, // 'url' type
      0x00, // version 0
      0x00, 0x00, 0x01 // entry_flags
      ]);

      var stco = new Uint8Array([
      0x00, // version
      0x00, 0x00, 0x00, // flags
      0x00, 0x00, 0x00, 0x00 // entry_count
      ]);

      MP4.STTS = MP4.STSC = MP4.STCO = stco;

      MP4.STSZ = new Uint8Array([
      0x00, // version
      0x00, 0x00, 0x00, // flags
      0x00, 0x00, 0x00, 0x00, // sample_size
      0x00, 0x00, 0x00, 0x00]);

      MP4.VMHD = new Uint8Array([
      0x00, // version
      0x00, 0x00, 0x01, // flags
      0x00, 0x00, // graphicsmode
      0x00, 0x00,
      0x00, 0x00,
      0x00, 0x00 // opcolor
      ]);
      MP4.SMHD = new Uint8Array([
      0x00, // version
      0x00, 0x00, 0x00, // flags
      0x00, 0x00, // balance
      0x00, 0x00 // reserved
      ]);

      MP4.STSD = new Uint8Array([
      0x00, // version 0
      0x00, 0x00, 0x00, // flags
      0x00, 0x00, 0x00, 0x01]); // entry_count

      var majorBrand = new Uint8Array([105, 115, 111, 109]); // isom
      var avc1Brand = new Uint8Array([97, 118, 99, 49]); // avc1
      var minorVersion = new Uint8Array([0, 0, 0, 1]);

      MP4.FTYP = MP4.box(MP4.types.ftyp, majorBrand, minorVersion, majorBrand, avc1Brand);
      MP4.DINF = MP4.box(MP4.types.dinf, MP4.box(MP4.types.dref, dref));
    }

    /////////////////////////////////////////////////////////////////////////////////////////////////
  }, { key: 'box', value: function box(
    type) {
      var
      payload = Array.prototype.slice.call(arguments, 1),
      size = 8,
      i = payload.length,
      len = i,
      result;
      // calculate the total size we need to allocate
      while (i--) {
        size += payload[i].byteLength;
      }
      result = new Uint8Array(size);
      result[0] = size >> 24 & 0xff;
      result[1] = size >> 16 & 0xff;
      result[2] = size >> 8 & 0xff;
      result[3] = size & 0xff;
      result.set(type, 4);
      // copy the payload into the result
      for (i = 0, size = 8; i < len; i++) {
        // copy payload[i] array @ offset size
        result.set(payload[i], size);
        size += payload[i].byteLength;
      }
      return result;
    } }, { key: 'mdat', value: function mdat(

    data) {
      //console.log( "mdat==> ",data.length );
      return MP4.box(MP4.types.mdat, data);
    }

    /////////////////////////////////////////////////////////////////////////////////////////////////

    /**
     * @param tracks... (optional) {array} the tracks associated with this movie
     */ }, { key: 'moov', value: function moov(
    tracks) {
      var i = tracks.length,boxes = [];
      while (i--) {
        boxes[i] = MP4.trak(tracks[i]);
      }

      if (tracks[0].id === 1) {console.log("moov tracks[0].duration=" + tracks[0].duration + " id=" + tracks[0].id + " scale=" + tracks[0].timescale);}
      if (tracks[0].id === 2) {console.log("moov tracks[0].duration=" + tracks[0].duration + " id=" + tracks[0].id + " scale=" + tracks[0].timescale);}

      return MP4.box.apply(null, [MP4.types.moov, MP4.mvhd(tracks[0].timescale, tracks[0].duration)].concat(boxes).concat(MP4.mvex(tracks)));
    } }, { key: 'mvhd', value: function mvhd(

    timescale, duration) {
      duration = 0; //duration *= timescale; // 注销这句话后，视频长度将只显示一个数字，并每秒自动增长。Modified by Apex.
      var bytes = new Uint8Array([
      0x00, // version 0
      0x00, 0x00, 0x00, // flags
      0x00, 0x00, 0x00, 0x01, // creation_time
      0x00, 0x00, 0x00, 0x02, // modification_time
      timescale >> 24 & 0xFF,
      timescale >> 16 & 0xFF,
      timescale >> 8 & 0xFF,
      timescale & 0xFF, // timescale
      duration >> 24 & 0xFF,
      duration >> 16 & 0xFF,
      duration >> 8 & 0xFF,
      duration & 0xFF, // duration
      0x00, 0x01, 0x00, 0x00, // 1.0 rate
      0x01, 0x00, // 1.0 volume
      0x00, 0x00, // reserved
      0x00, 0x00, 0x00, 0x00, // reserved
      0x00, 0x00, 0x00, 0x00, // reserved

      0x00, 0x01, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00,
      0x00, 0x01, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00,

      0x40, 0x00, 0x00, 0x00, // transformation: unity matrix
      0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00, // pre_defined
      0xFF, 0xFF, 0xFF, 0xFF // next_track_ID
      ]);
      return MP4.box(MP4.types.mvhd, bytes);
    }

    /**
       * Generate a track box.
       * @param track {object} a track definition
       * @return {Uint8Array} the track box
       */ }, { key: 'trak', value: function trak(
    track) {
      track.duration = track.duration || 0xffffffff;
      return MP4.box(MP4.types.trak, MP4.tkhd(track), MP4.mdia(track));
    } }, { key: 'tkhd', value: function tkhd(

    track) {
      var id = track.id,
      duration = track.duration * track.timescale,
      width = track.width,
      height = track.height;

      var audioTrackVolume = 0x01; // 原版这里为0，根据长江通信代码，这里修改为1
      duration = 0; // 用于实现视频长度将每秒自动增长，避免定死视频长度。Modified by Apex.

      //console.log( "tkhd==> ",track.id, track.duration, track.timescale, width,height );
      return MP4.box(MP4.types.tkhd, new Uint8Array([
      0x00, // version 0
      0x00, 0x00, 0x07, // flags
      0x00, 0x00, 0x00, 0x00, // creation_time
      0x00, 0x00, 0x00, 0x00, // modification_time
      id >> 24 & 0xFF,
      id >> 16 & 0xFF,
      id >> 8 & 0xFF,
      id & 0xFF, // track_ID
      0x00, 0x00, 0x00, 0x00, // reserved
      duration >> 24,
      duration >> 16 & 0xFF,
      duration >> 8 & 0xFF,
      duration & 0xFF, // duration
      0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00, // reserved
      0x00, 0x00, // layer                    视频轨道的叠加顺序，数字越小越靠近观看者，比如1比2靠上，0比1靠上；
      0x00, 0x00, // alternate_group          当前track的分组ID，alternate_group值相同的track在同一个分组里面。
      audioTrackVolume, 0x00, // non-audio track volume   audio track的音量，介于0.0~1.0之间；
      0x00, 0x00, // reserved

      0x00, 0x01, 0x00, 0x00, // ----begin composition matrix----
      0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00,
      0x00, 0x01, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00, // ----end composition matrix----
      0x40, 0x00, 0x00, 0x00, // transformation: unity matrix

      width >> 8 & 0xFF, // width and height
      width & 0xFF,
      0x00, 0x00, // width
      height >> 8 & 0xFF,
      height & 0xFF,
      0x00, 0x00 // height
      ]));
    } }, { key: 'mdia', value: function mdia(

    track) {
      return MP4.box(MP4.types.mdia, MP4.mdhd(track.timescale, track.duration), MP4.hdlr(track.type), MP4.minf(track));
    } }, { key: 'hdlr', value: function hdlr(

    type) {
      return MP4.box(MP4.types.hdlr, MP4.HDLR_TYPES[type]);
    } }, { key: 'mdhd', value: function mdhd(

    timescale, duration) {
      duration = 0; //duration *= timescale; // 注销这句话后，视频长度将每秒自动增长，避免定死视频长度。Modified by Apex.
      return MP4.box(MP4.types.mdhd, new Uint8Array([
      0x00, // version 0
      0x00, 0x00, 0x00, // flags
      0x00, 0x00, 0x00, 0x00, // creation_time      // 根据长江通信代码，这里将最后一位0x02修改为0x00 Modified by Apex.
      0x00, 0x00, 0x00, 0x00, // modification_time  // 根据长江通信代码，这里将最后一位0x03修改为0x00 Modified by Apex.
      timescale >> 24 & 0xFF,
      timescale >> 16 & 0xFF,
      timescale >> 8 & 0xFF,
      timescale & 0xFF, // timescale
      duration >> 24,
      duration >> 16 & 0xFF,
      duration >> 8 & 0xFF,
      duration & 0xFF, // duration
      0x55, 0xc4, // 'und' language (undetermined)
      0x00, 0x00]));

    } }, { key: 'minf', value: function minf(

    track) {
      if (track.type === 'audio') {
        return MP4.box(MP4.types.minf, MP4.box(MP4.types.smhd, MP4.SMHD), MP4.DINF, MP4.stbl(track));
      } else {
        return MP4.box(MP4.types.minf, MP4.box(MP4.types.vmhd, MP4.VMHD), MP4.DINF, MP4.stbl(track));
      }
    } }, { key: 'stbl', value: function stbl(

    track) {
      return MP4.box(MP4.types.stbl, MP4.stsd(track), MP4.box(MP4.types.stts, MP4.STTS), MP4.box(MP4.types.stsc, MP4.STSC), MP4.box(MP4.types.stsz, MP4.STSZ), MP4.box(MP4.types.stco, MP4.STCO));
    } }, { key: 'stsd', value: function stsd(

    track) {
      if (track.type === 'audio') {
        return MP4.box(MP4.types.stsd, MP4.STSD, MP4.mp4a(track));
      } else {
        return MP4.box(MP4.types.stsd, MP4.STSD, MP4.avc1(track));
      }
    } }, { key: 'avc1', value: function avc1(

    track) {
      var sps = [],pps = [],i,data,len;

      // assemble the SPSs
      for (i = 0; i < track.sps.length; i++) {
        data = track.sps[i];
        len = data.byteLength;
        sps.push(len >>> 8 & 0xFF);
        sps.push(len & 0xFF);
        sps = sps.concat(Array.prototype.slice.call(data)); // SPS
      }

      // assemble the PPSs
      for (i = 0; i < track.pps.length; i++) {
        data = track.pps[i];
        len = data.byteLength;
        pps.push(len >>> 8 & 0xFF);
        pps.push(len & 0xFF);
        pps = pps.concat(Array.prototype.slice.call(data));
      }

      var avcc = MP4.box(MP4.types.avcC, new Uint8Array([
      0x01, // version
      sps[3], // profile
      sps[4], // profile compat
      sps[5], // level
      0xfc | 3, // lengthSizeMinusOne, hard-coded to 4 bytes
      0xE0 | track.sps.length // 3bit reserved (111) + numOfSequenceParameterSets
      ].
      concat(sps).
      concat([track.pps.length]) // numOfPictureParameterSets    
      .concat(pps))), // "PPS"
      width = track.width,
      height = track.height;

      //console.log('avcc:' + Hex.hexDump(avcc));
      return MP4.box(MP4.types.avc1, new Uint8Array([
      0x00, 0x00, 0x00, // reserved(3)
      0x00, 0x00, 0x00, // reserved(3)
      0x00, 0x01, // data_reference_index(2)
      0x00, 0x00, // pre_defined: 3 * 4 bytes
      0x00, 0x00, // reserved
      0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00, // pre_defined
      width >> 8 & 0xFF,
      width & 0xff, // width
      height >> 8 & 0xFF,
      height & 0xff, // height
      0x00, 0x48, 0x00, 0x00, // horizresolution
      0x00, 0x48, 0x00, 0x00, // vertresolution
      0x00, 0x00, 0x00, 0x00, // reserved
      0x00, 0x01, // frame_count
      0x12, // strlen
      0x6a, 0x65, 0x66, 0x66, // wfs.js
      0x2d, 0x79, 0x61, 0x6e,
      0x2f, 0x2f, 0x2f, 0x67,
      0x77, 0x66, 0x73, 0x2E,
      0x6A, 0x73, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, // compressorname
      0x00, 0x18, // depth = 24
      0xFF, 0xFF]), // pre_defined = -1 0x11 0x11 -> 0xFF, 0xFF
      avcc,
      MP4.box(MP4.types.btrt, new Uint8Array([
      0x00, 0x1c, 0x9c, 0x80, // bufferSizeDB
      0x00, 0x2d, 0xc6, 0xc0, // maxBitrate
      0x00, 0x2d, 0xc6, 0xc0])) // avgBitrate
      );
    } }, { key: 'mp4a', value: function mp4a(

    track) {
      var audiosamplerate = track.audiosamplerate;
      var channelCount = track.channelCount;
      if (channelCount != 1) channelCount = 1;
      return MP4.box(MP4.types.mp4a, new Uint8Array([
      0x00, 0x00, 0x00, // reserved
      0x00, 0x00, 0x00, // reserved
      0x00, 0x01, // data_reference_index
      0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00, // reserved: 2 * 4 bytes
      0x00, channelCount, // channelcount(2)
      0x00, 0x10, // sampleSize:16bits(2)
      0x00, 0x00, 0x00, 0x00, // reserved2
      audiosamplerate >> 8 & 0xFF,
      audiosamplerate & 0xFF, //
      0x00, 0x00]),
      MP4.box(MP4.types.esds, MP4.esds(track)));
    }

    // esds box中主要是存放Element Stream Descriptors（ESDs）
    // #define MP4ESDescrTag                   0x03  
    // #define MP4DecConfigDescrTag            0x04  
    // #define MP4DecSpecificDescrTag          0x05  
  }, { key: 'esds', value: function esds(track) {
      var config = track.config || [];
      var configlen = config.length;
      return new Uint8Array([
      0x00, // version 0
      0x00, 0x00, 0x00, // flags

      0x03, // descriptor_type
      0x17 + configlen, // length
      0x00, 0x01, // es_id
      0x00, // streamDependenceFlag(1) + URL_Flag(1) + OCRstreamFlag(1) + stream_priority(5)

      0x04, // descriptor_type
      0x0F + configlen, // length
      0x40, // codec : mpeg4_audio
      0x15, // stream_type
      0x00, 0x00, 0x00, // buffer_size
      0x00, 0x00, 0x00, 0x00, // maxBitrate
      0x00, 0x00, 0x00, 0x00, // avgBitrate

      0x05 // descriptor_type
      ].concat([
      configlen]).
      concat(
      config).
      concat([
      0x06, 0x01, 0x02]));
      // GASpecificConfig)); // length + audio config descriptor
    } }, { key: 'mvex', value: function mvex(

    tracks) {
      var i = tracks.length,boxes = [];
      while (i--) {
        boxes[i] = MP4.trex(tracks[i]);
      }
      return MP4.box.apply(null, [MP4.types.mvex].concat(boxes));
    } }, { key: 'trex', value: function trex(

    track) {
      var id = track.id;
      return MP4.box(MP4.types.trex, new Uint8Array([
      0x00, // version 0
      0x00, 0x00, 0x00, // flags
      id >> 24,
      id >> 16 & 0XFF,
      id >> 8 & 0XFF,
      id & 0xFF, // track_ID
      0x00, 0x00, 0x00, 0x01, // default_sample_description_index
      0x00, 0x00, 0x00, 0x00, // default_sample_duration
      0x00, 0x00, 0x00, 0x00, // default_sample_size
      0x00, 0x01, 0x00, 0x01 // default_sample_flags  根据长江通信代码，最后一位修改为0x00(原为0x01)，modified by Apex.
      ]));
    }

    /////////////////////////////////////////////////////////////////////////////////////////////////
  }, { key: 'moof', value: function moof(
    sn, baseMediaDecodeTime, track) {
      // let dms = parseFloat(track.duration) / parseFloat(track.timescale);
      // let dmst = parseFloat(baseMediaDecodeTime + track.duration) / parseFloat(track.timescale);
      // if (track.id === 1) { console.log("moof baseMediaDecodeTime=" + baseMediaDecodeTime + " track.duration=" + track.duration + " id=" + track.id + " scale=" + track.timescale + " next=" + (baseMediaDecodeTime + track.duration) + " duration(ms)=" + dms + " duration total(ms)=" + dmst); }
      // if (track.id === 2) { console.log("moof baseMediaDecodeTime=" + baseMediaDecodeTime + " track.duration=" + track.duration + " id=" + track.id + " scale=" + track.timescale + " next=" + (baseMediaDecodeTime + track.duration) + " duration(ms)=" + dms + " duration total(ms)=" + dmst); }
      return MP4.box(MP4.types.moof, MP4.mfhd(sn), MP4.traf(track, baseMediaDecodeTime));
    } }, { key: 'mfhd', value: function mfhd(

    sequenceNumber) {
      return MP4.box(MP4.types.mfhd, new Uint8Array([
      0x00,
      0x00, 0x00, 0x00, // flags
      sequenceNumber >> 24,
      sequenceNumber >> 16 & 0xFF,
      sequenceNumber >> 8 & 0xFF,
      sequenceNumber & 0xFF]) // sequence_number
      );
    } }, { key: 'traf', value: function traf(

    track, baseMediaDecodeTime) {
      var sampleDependencyTable = MP4.sdtp(track),id = track.id;

      //console.log("traf==> ", id, baseMediaDecodeTime);
      return MP4.box(MP4.types.traf,
      MP4.box(MP4.types.tfhd, new Uint8Array([
      0x00, // version 0
      0x00, 0x00, 0x00, // flags
      id >> 24,
      id >> 16 & 0XFF,
      id >> 8 & 0XFF,
      id & 0xFF]) // track_ID
      ),
      MP4.box(MP4.types.tfdt, new Uint8Array([
      0x00, // version 0
      0x00, 0x00, 0x00, // flags
      baseMediaDecodeTime >> 24,
      baseMediaDecodeTime >> 16 & 0XFF,
      baseMediaDecodeTime >> 8 & 0XFF,
      baseMediaDecodeTime & 0xFF]) // baseMediaDecodeTime
      ),
      MP4.trun(track,
      sampleDependencyTable.length +
      16 + // tfhd
      16 + // tfdt
      8 + // traf header
      16 + // mfhd
      8 + // moof header
      8), // mdat header
      sampleDependencyTable);
    } }, { key: 'trun', value: function trun(

    track, offset) {
      var samples = track.samples || [],
      len = samples.length,
      arraylen = 12 + 16 * len,
      array = new Uint8Array(arraylen),
      i,sample,duration,size,flags,cts;

      sample = samples[0];
      //console.log("trun==> ", sample.duration, sample.cts, sample.size, len);

      offset += 8 + arraylen;
      array.set([
      0x00, // version 0
      0x00, 0x0f, 0x01, // flags
      len >>> 24 & 0xFF,
      len >>> 16 & 0xFF,
      len >>> 8 & 0xFF,
      len & 0xFF, // sample_count
      offset >>> 24 & 0xFF,
      offset >>> 16 & 0xFF,
      offset >>> 8 & 0xFF,
      offset & 0xFF // data_offset
      ], 0);

      for (i = 0; i < len; i++) {
        sample = samples[i];
        duration = sample.duration;
        size = sample.size;
        flags = sample.flags;
        cts = sample.cts;
        array.set([
        duration >>> 24 & 0xFF,
        duration >>> 16 & 0xFF,
        duration >>> 8 & 0xFF,
        duration & 0xFF, // sample_duration
        size >>> 24 & 0xFF,
        size >>> 16 & 0xFF,
        size >>> 8 & 0xFF,
        size & 0xFF, // sample_size
        flags.isLeading << 2 | flags.dependsOn,
        flags.isDependedOn << 6 | flags.hasRedundancy << 4 | flags.paddingValue << 1 | flags.isNonSync,
        flags.degradPrio & 0xF0 << 8,
        flags.degradPrio & 0x0F, // sample_flags
        cts >>> 24 & 0xFF,
        cts >>> 16 & 0xFF,
        cts >>> 8 & 0xFF,
        cts & 0xFF // sample_composition_time_offset
        ], 12 + 16 * i);
      }
      return MP4.box(MP4.types.trun, array);
    } }, { key: 'sdtp', value: function sdtp(

    track) {
      var samples = track.samples || [],bytes = new Uint8Array(4 + samples.length),flags;

      // leave the full box header (4 bytes) all zero write the sample table
      for (var i = 0; i < samples.length; i++) {
        flags = samples[i].flags;
        bytes[i + 4] = flags.dependsOn << 4 | flags.isDependedOn << 2 | flags.hasRedundancy;
      }

      return MP4.box(MP4.types.sdtp, bytes);
    }

    /////////////////////////////////////////////////////////////////////////////////////////////////
  }, { key: 'initSegment', value: function initSegment(
    tracks) {
      if (!MP4.types) {MP4.init();}

      var movie = MP4.moov(tracks),result;
      result = new Uint8Array(MP4.FTYP.byteLength + movie.byteLength);
      result.set(MP4.FTYP);
      result.set(movie, MP4.FTYP.byteLength);
      return result;
    } }]);return MP4;}();exports.default =


MP4;

},{}],19:[function(require,module,exports){
'use strict';Object.defineProperty(exports, "__esModule", { value: true });var _createClass = function () {function defineProperties(target, props) {for (var i = 0; i < props.length; i++) {var descriptor = props[i];descriptor.enumerable = descriptor.enumerable || false;descriptor.configurable = true;if ("value" in descriptor) descriptor.writable = true;Object.defineProperty(target, descriptor.key, descriptor);}}return function (Constructor, protoProps, staticProps) {if (protoProps) defineProperties(Constructor.prototype, protoProps);if (staticProps) defineProperties(Constructor, staticProps);return Constructor;};}(); /*** fMP4 remuxer */
var _aacHelper = require('./aac-helper');var _aacHelper2 = _interopRequireDefault(_aacHelper);
var _mp4Generator = require('./mp4-generator');var _mp4Generator2 = _interopRequireDefault(_mp4Generator);
var _events = require('../events');var _events2 = _interopRequireDefault(_events);
var _logger = require('../utils/logger');
var _errors = require('../errors');
require('../utils/polyfill');function _interopRequireDefault(obj) {return obj && obj.__esModule ? obj : { default: obj };}function _classCallCheck(instance, Constructor) {if (!(instance instanceof Constructor)) {throw new TypeError("Cannot call a class as a function");}}var

MP4Remuxer = function () {

  function MP4Remuxer(observer, id, config) {_classCallCheck(this, MP4Remuxer);
    this.observer = observer;
    this.id = id;
    this.config = config;

    this.PES_TIMESCALE = 90000; // PTS/DTS的初始值，一般来源于录制的视频的频率，按照h264的设定是90HZ
    this.PES_TIMESCALE_SOUN = 8e3;
    this.PES2MP4SCALEFACTOR = 4;
    this.MP4_TIMESCALE = this.PES_TIMESCALE / this.PES2MP4SCALEFACTOR;
    this.H264_TIMEBASE = 3000; //3000; // 3000->320
    this.SOUN_TIMEBASE = 1024;

    this.ISGenerated = false;
    this.nextAvcDts = 320; //90300;
    this.nextAacPts = 1024;
  }_createClass(MP4Remuxer, [{ key: 'destroy', value: function destroy()

    {
    } }, { key: 'insertDiscontinuity',





    /////////////////////////////////////////////////////////////////////////////////////////////////
    value: function insertDiscontinuity()
    {
      this._initPTS = this._initDTS = undefined;
    } }, { key: 'switchLevel', value: function switchLevel()

    {
      this.ISGenerated = false;
    }

    // avFalg=2：仅视频
  }, { key: 'pushVideo', value: function pushVideo(level, sn, videoTrack, timeOffset, contiguous) {
      this.level = level;
      this.sn = sn;

      // generate Init Segment if needed
      if (!this.ISGenerated) {
        this.generateVideoIS(videoTrack, timeOffset);
      }

      if (this.ISGenerated) {
        if (videoTrack.samples.length) {
          this.remuxVideo_2(videoTrack, timeOffset, contiguous);
        }
      }
    }

    // avFalg=1：仅音频
  }, { key: 'pushAudio', value: function pushAudio(level, sn, auditTrack, timeOffset, contiguous) {// t, i, a, s, r
      this.level = level;
      this.sn_soun = sn;

      if (!this.ISGenerated) {
        this.generateAudioIS(auditTrack, timeOffset);
      }

      if (this.ISGenerated) {
        this.remuxAudio_2(auditTrack, timeOffset, contiguous);
      }
    }

    // avFalg=0：音视频-视频
  }, { key: 'pushVideo2', value: function pushVideo2(level, sn, videoTrack, auditTrack, timeOffset, contiguous) {// t i a s r n
      this.level = level;
      this.sn = sn;

      // generate Init Segment if needed
      if (!this.ISGenerated) {
        this.generateVideoAudioIS(videoTrack, auditTrack, timeOffset); // a s r
      }
      if (this.ISGenerated) {
        if (auditTrack.samples.length) {
          this.remuxAudio_2(auditTrack, timeOffset, contiguous);
        }
        if (videoTrack.samples.length) {
          this.remuxVideo_2(videoTrack, timeOffset, contiguous, auditTrack); // a r n s
        }
      }
    }

    // avFalg=0：音视频-音频
  }, { key: 'pushAudio2', value: function pushAudio2(level, sn, auditTrack, timeOffset, contiguous) {
      this.level = level;
      this.sn_soun = sn;

      if (this.ISGenerated) {
        this.remuxAudio_2(auditTrack, timeOffset, contiguous);
      }
    }

    /////////////////////////////////////////////////////////////////////////////////////////////////
  }, { key: 'generateVideoIS', value: function generateVideoIS(
    videoTrack, timeOffset) {
      var observer = this.observer,
      videoSamples = videoTrack.samples,
      pesTimeScale = this.PES_TIMESCALE,
      tracks = {},
      data = { id: this.id, level: this.level, sn: this.sn, tracks: tracks, unique: false },
      computePTSDTS = this._initPTS === undefined,
      initPTS,initDTS;

      if (computePTSDTS) {
        initPTS = initDTS = Infinity;
      }

      // video
      if (videoTrack.sps && videoTrack.pps && videoSamples.length) {
        videoTrack.timescale = this.PES_TIMESCALE; //90000;//this.MP4_TIMESCALE;
        videoTrack.duration = this.H264_TIMEBASE;
        tracks.video = { container: 'video/mp4', codec: videoTrack.codec, initSegment: _mp4Generator2.default.initSegment([videoTrack]), metadata: { width: videoTrack.width, height: videoTrack.height } };

        if (computePTSDTS) {
          initPTS = 0; //Math.min(initPTS, videoSamples[0].pts - this.H264_TIMEBASE);
          initDTS = 0; //Math.min(initDTS, videoSamples[0].dts - this.H264_TIMEBASE);
        }
      }

      // trigger event
      if (Object.keys(tracks).length) {
        observer.trigger(_events2.default.FRAG_PARSING_INIT_SEGMENT, data);
        this.ISGenerated = true;
        if (computePTSDTS) {
          this._initPTS = initPTS;
          this._initDTS = initDTS;
        }
      } else {
        console.log("generateVideoIS ERROR==> ", _errors.ErrorTypes.MEDIA_ERROR);
      }
    } }, { key: 'generateAudioIS', value: function generateAudioIS(

    audioTrack, timeOffset) {
      var observer = this.observer,
      audioSamples = audioTrack.samples,
      tracks = {},
      data = { id: 2, level: this.level, sn: this.sn_soun, tracks: tracks, unique: false },
      computePTSDTS = this._initPTS === undefined,
      initPTS,
      initDTS;

      if (computePTSDTS) {
        initPTS = initDTS = Infinity;
      }

      // audio
      if (audioTrack.config && audioSamples.length) {
        audioTrack.timescale = audioTrack.samplerate;
        audioTrack.duration = this.SOUN_TIMEBASE;

        tracks.audio = { container: "video/mp4", codec: audioTrack.codec, initSegment: _mp4Generator2.default.initSegment([audioTrack]), ISType: "audio", metadata: { channelCount: audioTrack.channelCount } };

        if (computePTSDTS) {
          initPTS = initDTS = 0; //Math.min(initPTS, audioSamples[0].pts - this.SOUN_TIMEBASE);
        }
      }

      // trigger event
      if (Object.keys(tracks).length) {
        observer.trigger(_events2.default.FRAG_PARSING_INIT_SEGMENT, data);
        this.ISGenerated = true;
        if (computePTSDTS) {
          this._initPTS = initPTS;
          this._initDTS = initDTS;
        }
      } else {
        console.log("generateAudioIS ERROR==> ", _errors.ErrorTypes.MEDIA_ERROR);
      }
    } }, { key: 'generateVideoAudioIS', value: function generateVideoAudioIS(

    videoTrack, audioTrack, timeOffset) {
      var observer = this.observer,
      videoSamples = videoTrack.samples,
      tracks = {},
      data = { id: this.id, level: this.level, sn: this.sn, tracks: tracks, unique: false },
      computePTSDTS = this._initPTS === undefined,
      initPTS,
      initDTS;

      if (computePTSDTS) {
        initPTS = initDTS = Infinity;
      }

      var avTracks = [];
      if (videoTrack.sps && videoTrack.pps && videoSamples.length) {
        videoTrack.timescale = this.PES_TIMESCALE;
        videoTrack.duration = this.H264_TIMEBASE;
        avTracks.push(videoTrack);

        audioTrack.timescale = this.PES_TIMESCALE_SOUN;
        audioTrack.duration = this.SOUN_TIMEBASE;
        audioTrack.channelCount = 1;
        avTracks.push(audioTrack);

        tracks.audio = {
          container: "video/mp4",
          codec: audioTrack.codec,
          initSegment: _mp4Generator2.default.initSegment([audioTrack]),
          ISType: "videoaudio",
          metadata: { channelCount: audioTrack.channelCount } };


        tracks.video = {
          container: "video/mp4",
          codec: videoTrack.codec,
          initSegment: _mp4Generator2.default.initSegment([videoTrack]),
          ISType: "videoaudio",
          metadata: { width: videoTrack.width, height: videoTrack.height } };


        if (computePTSDTS) {
          initPTS = 0; //Math.min(initPTS, videoSamples[0].pts - this.H264_TIMEBASE);
          initDTS = 0; //Math.min(initDTS, videoSamples[0].dts - this.H264_TIMEBASE);
        }
      }

      // trigger event
      if (Object.keys(tracks).length) {
        observer.trigger(_events2.default.FRAG_PARSING_INIT_SEGMENT, data);
        this.ISGenerated = true;
        if (computePTSDTS) {
          this._initPTS = initPTS;
          this._initDTS = initDTS;
        }
      } else {
        console.log("generateVideoAudioIS ERROR==> ", _errors.ErrorTypes.MEDIA_ERROR);
      }
    }

    /////////////////////////////////////////////////////////////////////////////////////////////////
  }, { key: 'remuxVideo_2', value: function remuxVideo_2(
    track, timeOffset, contiguous, audioTrackLength) {
      var offset = 8,
      pesTimeScale = this.PES_TIMESCALE,
      pes2mp4ScaleFactor = this.PES2MP4SCALEFACTOR,
      mp4SampleDuration,
      mdat,moof,
      firstPTS,firstDTS,
      nextDTS,
      inputSamples = track.samples,
      outputSamples = [];

      /* concatenate the video data and construct the mdat in place(need 8 more bytes to fill length and mpdat type) */
      mdat = new Uint8Array(track.len + 4 * track.nbNalu + 8);
      var view = new DataView(mdat.buffer);
      view.setUint32(0, mdat.byteLength);
      mdat.set(_mp4Generator2.default.types.mdat, 4);

      var sampleDuration = 0;
      var ptsnorm = void 0,dtsnorm = void 0,mp4Sample = void 0,lastDTS = void 0;

      var firstAvcSampleDts = void 0;
      var totalDuration = 0;
      for (var i = 0; i < inputSamples.length; i++) {
        var avcSample = inputSamples[i],mp4SampleLength = 0,compositionTimeOffset = void 0;

        // convert NALU bitstream to MP4 format (prepend NALU with size field)
        while (avcSample.units.units.length) {
          var unit = avcSample.units.units.shift();
          view.setUint32(offset, unit.data.byteLength);
          offset += 4;
          mdat.set(unit.data, offset);
          offset += unit.data.byteLength;
          mp4SampleLength += 4 + unit.data.byteLength;
        }

        if (firstAvcSampleDts == undefined) {
          firstAvcSampleDts = avcSample.dts;
        }
        totalDuration += avcSample.duration;

        mp4SampleDuration = avcSample.duration;
        var pts = avcSample.pts - this._initPTS;
        var dts = avcSample.dts - this._initDTS;
        dts = Math.min(pts, dts);

        if (lastDTS !== undefined) {
          ptsnorm = this._PTSNormalize(pts, lastDTS);
          dtsnorm = this._PTSNormalize(dts, lastDTS);
          sampleDuration = dtsnorm - lastDTS;
          if (sampleDuration <= 0) {
            _logger.logger.log('invalid sample duration at PTS/DTS: ' + avcSample.pts + '/' + avcSample.dts + '|dts norm: ' + dtsnorm + '|lastDTS: ' + lastDTS + ':' + sampleDuration);
            sampleDuration = 1;
          }
        } else
        {
          var nextAvcDts = this.nextAvcDts,delta;
          ptsnorm = this._PTSNormalize(pts, nextAvcDts);
          dtsnorm = this._PTSNormalize(dts, nextAvcDts);
          if (nextAvcDts) {
            delta = Math.round(dtsnorm - nextAvcDts);
            if ( /*contiguous ||*/Math.abs(delta) < 120) {// 600 => 120
              if (delta) {
                // if (delta > 1) {
                //   logger.log(`AVC:${delta} ms hole between fragments detected,filling it`);
                // } else if (delta < -1) {
                //   logger.log(`AVC:${(-delta)} ms overlapping between fragments detected`);
                // }
                dtsnorm = nextAvcDts;
                ptsnorm = Math.max(ptsnorm - delta, dtsnorm);
                _logger.logger.log('Video/PTS/DTS adjusted: ' + ptsnorm + '/' + dtsnorm + ',delta:' + delta);
              }
            }
          }
          this.firstPTS = Math.max(0, ptsnorm);
          this.firstDTS = Math.max(0, dtsnorm);
          sampleDuration = 0.04; // 0.03=>0.04
        }

        outputSamples.push({
          size: mp4SampleLength,
          duration: avcSample.duration, // this.H264_TIMEBASE, // mp4SampleDuration, //
          cts: 0,
          flags: { isLeading: 0, isDependedOn: 0, hasRedundancy: 0, degradPrio: 0, dependsOn: avcSample.key ? 2 : 1, isNonSync: avcSample.key ? 0 : 1 } });

        lastDTS = dtsnorm;
      }

      // var lastSampleDuration = 0;
      // if (outputSamples.length >= 2) {
      //   lastSampleDuration = outputSamples[outputSamples.length - 2].duration;
      //   outputSamples[0].duration = lastSampleDuration;
      // }

      //this.nextAvcDts = dtsnorm + lastSampleDuration;
      var dropped = track.dropped;
      track.len = 0;
      track.nbNalu = 0;
      track.dropped = 0;
      if (outputSamples.length && navigator.userAgent.toLowerCase().indexOf('chrome') > -1) {
        var flags = outputSamples[0].flags;
        flags.dependsOn = 2;
        flags.isNonSync = 0;
      }

      dtsnorm = firstAvcSampleDts;
      track.samples = outputSamples;
      track.duration = totalDuration;
      moof = _mp4Generator2.default.moof(track.sequenceNumber++, dtsnorm, track);
      track.samples = [];

      var data = {
        id: this.id,
        level: this.level,
        sn: this.sn,
        data1: moof,
        data2: mdat,
        startPTS: ptsnorm,
        endPTS: ptsnorm,
        startDTS: dtsnorm,
        endDTS: dtsnorm,
        type: 'video',
        nb: outputSamples.length,
        dropped: dropped };

      this.observer.trigger(_events2.default.FRAG_PARSING_DATA, data);
      return data;
    } }, { key: 'remuxAudio_2', value: function remuxAudio_2(

    track, timeOffset, contiguous) {
      var pesTimeScale = this.PES_TIMESCALE_SOUN,
      mp4timeScale = track.timescale,
      pes2mp4ScaleFactor = pesTimeScale / mp4timeScale,
      expectedSampleDuration = track.timescale * 1024 / track.samplerate;
      var view,
      offset = 8,
      aacSample,mp4Sample,
      unit,
      mdat,moof,
      firstPTS,firstDTS,lastDTS,
      pts,dts,ptsnorm,dtsnorm,
      samples = [],
      samples0 = [];

      track.samples.sort(function (a, b) {return a.pts - b.pts;});
      samples0 = track.samples;

      var nextAacPts = contiguous ? this.nextAacPts : timeOffset * pesTimeScale;

      // If the audio track is missing samples, the frames seem to get "left-shifted" within the
      // resulting mp4 segment, causing sync issues and leaving gaps at the end of the audio segment.
      // In an effort to prevent this from happening, we inject frames here where there are gaps.
      // When possible, we inject a silent frame; when that's not possible, we duplicate the last frame.
      var firstPtsNorm = this._PTSNormalize(samples0[0].pts - this._initPTS, nextAacPts),pesFrameDuration = expectedSampleDuration * pes2mp4ScaleFactor;
      var nextPtsNorm = firstPtsNorm + pesFrameDuration;
      var firstAAcSampleDts = void 0;
      var totalDuration = 0;

      while (samples0.length) {
        aacSample = samples0.shift();
        unit = aacSample.units.units.shift();

        pts = aacSample.pts - this._initDTS;
        dts = aacSample.dts - this._initDTS;
        //logger.log(`Audio/PTS:${Math.round(pts/90)}`);

        if (firstAAcSampleDts == undefined) {
          firstAAcSampleDts = aacSample.dts;
        }
        totalDuration += aacSample.duration;

        // if not first sample
        if (lastDTS !== undefined) {
          ptsnorm = this._PTSNormalize(pts, lastDTS);
          dtsnorm = this._PTSNormalize(dts, lastDTS);
          mp4Sample.duration = (dtsnorm - lastDTS) / pes2mp4ScaleFactor;
        } else
        {
          ptsnorm = this._PTSNormalize(pts, nextAacPts);
          dtsnorm = this._PTSNormalize(dts, nextAacPts);
          var delta = Math.round(1000 * (ptsnorm - nextAacPts) / pesTimeScale);
          // if fragment are contiguous, detect hole/overlapping between fragments
          if (contiguous) {
            // log delta
            if (delta) {
              // if (delta > 0) {
              //   logger.log(`${delta} ms hole between AAC samples detected,filling it`);
              //   // if we have frame overlap, overlapping for more than half a frame duraion
              // } else if (delta < -12) {
              //   // drop overlapping audio frames... browser will deal with it
              //   logger.log(`${(-delta)} ms overlapping between AAC samples detected, drop frame`);
              //   track.len -= unit.data.byteLength; //.length; //.byteLength;
              //   continue;
              // }
              // set PTS/DTS to expected PTS/DTS
              ptsnorm = dtsnorm = nextAacPts;
            }
          }

          // remember first PTS of our aacSamples, ensure value is positive
          firstPTS = Math.max(0, ptsnorm);
          firstDTS = Math.max(0, dtsnorm);
          if (track.len > 0) {
            /* concatenate the audio data and construct the mdat in place (need 8 more bytes to fill length and mdat type) */
            mdat = new Uint8Array(track.len + 8);
            view = new DataView(mdat.buffer);
            view.setUint32(0, mdat.byteLength);
            mdat.set(_mp4Generator2.default.types.mdat, 4);
          } else {
            // no audio samples
            return;
          }
        }

        mdat.set(unit.data, offset);
        offset += unit.data.byteLength;
        //console.log('PTS/DTS/initDTS/normPTS/normDTS/relative PTS : ${aacSample.pts}/${aacSample.dts}/${this._initDTS}/${ptsnorm}/${dtsnorm}/${(aacSample.pts/4294967296).toFixed(3)}');
        mp4Sample = {
          size: unit.data.byteLength,
          duration: aacSample.duration,
          pts: aacSample.pts,
          dts: aacSample.dts,
          cts: 0,
          flags: { isLeading: 0, isDependedOn: 0, hasRedundancy: 0, degradPrio: 0, dependsOn: 1 } };

        samples.push(mp4Sample);
        lastDTS = dtsnorm;
      }

      var lastSampleDuration = 0; // 0 => 1024
      var nbSamples = samples.length;
      //set last sample duration as being identical to previous sample
      if (nbSamples >= 2) {
        lastSampleDuration = samples[nbSamples - 2].duration;
        mp4Sample.duration = lastSampleDuration;
      }

      if (nbSamples) {
        // next aac sample PTS should be equal to last sample PTS + duration
        this.nextAacPts = ptsnorm + pes2mp4ScaleFactor * lastSampleDuration;
        //logger.log('Audio/PTS/PTSend:' + aacSample.pts.toFixed(0) + '/' + this.nextAacDts.toFixed(0));
        track.len = 0;
        track.samples = samples;
        track.duration = totalDuration;
        moof = _mp4Generator2.default.moof(track.sequenceNumber++, firstAAcSampleDts / pes2mp4ScaleFactor, track);
        track.samples = [];

        var audioData = {
          id: this.id,
          level: this.level,
          sn: this.sn_soun,
          data1: moof,
          data2: mdat,
          // startPTS: firstPTS / pesTimeScale,
          // endPTS: this.nextAacPts / pesTimeScale,
          // startDTS: firstDTS / pesTimeScale,
          // endDTS: (dtsnorm + pes2mp4ScaleFactor * lastSampleDuration) / pesTimeScale,
          type: 'audio',
          nb: nbSamples };

        this.observer.trigger(_events2.default.FRAG_PARSING_DATA, audioData);
        return audioData;
      }
      return null;
    }

    /////////////////////////////////////////////////////////////////////////////////////////////////
  }, { key: '_PTSNormalize', value: function _PTSNormalize(
    value, reference) {
      if (reference === undefined) {
        return value;
      }

      var offset;
      if (reference < value) {
        // - 2^33
        offset = -8589934592;
      } else {
        // + 2^33
        offset = 8589934592;
      }

      /* PTS is 33bit (from 0 to 2^33 -1)
          if diff between value and reference is bigger than half of the amplitude (2^32) then it means that
          PTS looping occured. fill the gap */
      while (Math.abs(value - reference) > 4294967296) {
        value += offset;
      }
      return value;
    } }, { key: 'passthrough', get: function get() {return false;} }]);return MP4Remuxer;}();exports.default =


MP4Remuxer;

},{"../errors":9,"../events":11,"../utils/logger":20,"../utils/polyfill":21,"./aac-helper":17,"./mp4-generator":18}],20:[function(require,module,exports){
'use strict';Object.defineProperty(exports, "__esModule", { value: true });var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {return typeof obj;} : function (obj) {return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;};

function noop() {}

var fakeLogger = {
  trace: noop,
  debug: noop,
  log: noop,
  warn: noop,
  info: noop,
  error: noop };


var exportedLogger = fakeLogger;

//let lastCallTime;
// function formatMsgWithTimeInfo(type, msg) {
//   const now = Date.now();
//   const diff = lastCallTime ? '+' + (now - lastCallTime) : '0';
//   lastCallTime = now;
//   msg = (new Date(now)).toISOString() + ' | [' +  type + '] > ' + msg + ' ( ' + diff + ' ms )';
//   return msg;
// }

function formatMsg(type, msg) {
  msg = '[' + type + '] > ' + msg;
  return msg;
}

function consolePrintFn(type) {
  var func = window.console[type];
  if (func) {
    return function () {for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {args[_key] = arguments[_key];}
      if (args[0]) {
        args[0] = formatMsg(type, args[0]);
      }
      func.apply(window.console, args);
    };
  }
  return noop;
}

function exportLoggerFunctions(debugConfig) {for (var _len2 = arguments.length, functions = Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {functions[_key2 - 1] = arguments[_key2];}
  functions.forEach(function (type) {
    exportedLogger[type] = debugConfig[type] ? debugConfig[type].bind(debugConfig) : consolePrintFn(type);
  });
}

var enableLogs = exports.enableLogs = function enableLogs(debugConfig) {
  if (debugConfig === true || (typeof debugConfig === 'undefined' ? 'undefined' : _typeof(debugConfig)) === 'object') {
    exportLoggerFunctions(debugConfig,
    'trace',
    'debug',
    'log',
    'info',
    'warn',
    'error');


    // Some browsers don't allow to use bind on console object anyway fallback to default if needed
    try {
      exportedLogger.log();
    } catch (e) {
      exportedLogger = fakeLogger;
    }
  } else
  {
    exportedLogger = fakeLogger;
  }
};

var logger = exports.logger = exportedLogger;

},{}],21:[function(require,module,exports){
'use strict';if (typeof ArrayBuffer !== 'undefined' && !ArrayBuffer.prototype.slice) {
  ArrayBuffer.prototype.slice = function (start, end) {
    var that = new Uint8Array(this);
    if (end === undefined) {
      end = that.length;
    }
    var result = new ArrayBuffer(end - start);
    var resultArray = new Uint8Array(result);
    for (var i = 0; i < resultArray.length; i++) {
      resultArray[i] = that[i + start];
    }
    return result;
  };
}

},{}]},{},[12])(12)
});
//# sourceMappingURL=jvp.js.map
