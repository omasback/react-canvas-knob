"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var React = require("react");
var Knob = (function (_super) {
    __extends(Knob, _super);
    function Knob(props) {
        var _this = _super.call(this, props) || this;
        _this.getArcToValue = function (v, type, cursor) {
            if (type === void 0) { type = 'knob'; }
            var startAngle, endAngle, cursorExt, connectStartAngle, connectEndAngle;
            var angle = !_this.props.log
                ? ((v - _this.props.min) * _this.angleArc) / (_this.props.max - _this.props.min)
                : Math.log(Math.pow(v / _this.props.min, _this.angleArc)) / Math.log(_this.props.max / _this.props.min);
            if (!_this.props.clockwise) {
                startAngle = _this.endAngle + 0.00001;
                endAngle = startAngle - angle - 0.00001;
                connectStartAngle = _this.connectEndAngle + 0.00001;
                connectEndAngle = connectStartAngle - angle - 0.00001;
            }
            else {
                startAngle = _this.startAngle - 0.00001;
                endAngle = startAngle + angle + 0.00001;
                connectStartAngle = _this.connectStartAngle - 0.00001;
                connectEndAngle = connectStartAngle + angle + 0.00001;
            }
            if (_this.props.connector && Array.isArray(_this.props.cursor) && _this.props.cursor.length > 1 && type === 'connector') {
                var multiplier = _this.props.angleArc / (_this.props.max - _this.props.min) - 1;
                var length = multiplier * (_this.props.cursor[1].value - _this.props.cursor[0].value);
                var connector = length / 100;
                startAngle = connectEndAngle - connector;
                endAngle += connector;
            }
            else if (_this.props.cursor && type === 'cursor') {
                cursorExt = cursor.widthMultiplier / 100;
                startAngle = endAngle - cursorExt;
                endAngle += cursorExt;
            }
            return {
                startAngle: startAngle,
                endAngle: endAngle,
                acw: !_this.props.clockwise && !_this.props.cursor
            };
        };
        _this.getCanvasScale = function (ctx) {
            var devicePixelRatio = window.devicePixelRatio ||
                window.screen.deviceXDPI / window.screen.logicalXDPI ||
                1;
            var backingStoreRatio = ctx.webkitBackingStorePixelRatio || 1;
            return devicePixelRatio / backingStoreRatio;
        };
        _this.coerceToStep = function (v) {
            var val = !_this.props.log
                ? ~~((v < 0 ? -0.5 : 0.5) + v / _this.props.step) * _this.props.step
                : Math.pow(_this.props.step, ~~((Math.abs(v) < 1 ? -0.5 : 0.5) + Math.log(v) / Math.log(_this.props.step)));
            val = Math.max(Math.min(val, _this.props.max), _this.props.min);
            if (isNaN(val)) {
                val = 0;
            }
            return Math.round(val * 1000) / 1000;
        };
        _this.eventToValue = function (e) {
            var bounds = _this.canvasRef.getBoundingClientRect();
            var x = e.clientX - bounds.left;
            var y = e.clientY - bounds.top;
            var a = Math.atan2(x - _this.w / 2, _this.w / 2 - y) - _this.angleOffset;
            if (!_this.props.clockwise) {
                a = _this.angleArc - a - 2 * Math.PI;
            }
            if (_this.angleArc !== Math.PI * 2 && a < 0 && a > -0.5) {
                a = 0;
            }
            else if (a < 0) {
                a += Math.PI * 2;
            }
            var val = !_this.props.log ? (a * (_this.props.max - _this.props.min)) / _this.angleArc + _this.props.min : Math.pow(_this.props.max / _this.props.min, a / _this.angleArc) * _this.props.min;
            return _this.coerceToStep(val);
        };
        _this.handleMouseDown = function (e) {
            _this.props.onChange(_this.eventToValue(e));
            document.addEventListener('mousemove', _this.handleMouseMove);
            document.addEventListener('mouseup', _this.handleMouseUp);
            document.addEventListener('keyup', _this.handleEsc);
        };
        _this.handleMouseMove = function (e) {
            e.preventDefault();
            _this.props.onChange(_this.eventToValue(e));
        };
        _this.handleMouseUp = function (e) {
            _this.props.onChangeEnd(_this.eventToValue(e));
            document.removeEventListener('mousemove', _this.handleMouseMove);
            document.removeEventListener('mouseup', _this.handleMouseUp);
            document.removeEventListener('keyup', _this.handleEsc);
        };
        _this.handleTouchStart = function (e) {
            e.preventDefault();
            _this.touchIndex = e.targetTouches.length - 1;
            _this.props.onChange(_this.eventToValue(e.targetTouches[_this.touchIndex]));
            document.addEventListener('touchmove', _this.handleTouchMove, { passive: false });
            document.addEventListener('touchend', _this.handleTouchEnd);
            document.addEventListener('touchcancel', _this.handleTouchEnd);
        };
        _this.handleTouchMove = function (e) {
            e.preventDefault();
            _this.props.onChange(_this.eventToValue(e.targetTouches[_this.touchIndex]));
        };
        _this.handleTouchEnd = function (e) {
            _this.props.onChangeEnd(_this.eventToValue(e.changedTouches[_this.touchIndex]));
            document.removeEventListener('touchmove', _this.handleTouchMove);
            document.removeEventListener('touchend', _this.handleTouchEnd);
            document.removeEventListener('touchcancel', _this.handleTouchEnd);
        };
        _this.handleEsc = function (e) {
            if (e.keyCode === 27) {
                e.preventDefault();
                _this.handleMouseUp();
            }
        };
        _this.handleTextInput = function (e) {
            var val = Math.max(Math.min(+e.target.value, _this.props.max), _this.props.min) || _this.props.min;
            _this.props.onChange(val);
        };
        _this.handleWheel = function (e) {
            e.preventDefault();
            if (e.deltaX > 0 || e.deltaY > 0) {
                _this.props.onChange(_this.coerceToStep(!_this.props.log ? _this.props.value + _this.props.step : _this.props.value * _this.props.step));
            }
            else if (e.deltaX < 0 || e.deltaY < 0) {
                _this.props.onChange(_this.coerceToStep(!_this.props.log ? _this.props.value - _this.props.step : _this.props.value / _this.props.step));
            }
        };
        _this.handleArrowKey = function (e) {
            if (e.keyCode === 37 || e.keyCode === 40) {
                e.preventDefault();
                _this.props.onChange(_this.coerceToStep(!_this.props.log ? _this.props.value - _this.props.step : _this.props.value / _this.props.step));
            }
            else if (e.keyCode === 38 || e.keyCode === 39) {
                e.preventDefault();
                _this.props.onChange(_this.coerceToStep(!_this.props.log ? _this.props.value + _this.props.step : _this.props.value * _this.props.step));
            }
        };
        _this.inputStyle = function () {
            return ({
                width: ((_this.w / 2 + 4) >> 0) + "px",
                height: ((_this.w / 3) >> 0) + "px",
                position: 'absolute',
                verticalAlign: 'middle',
                marginTop: ((_this.w / 3) >> 0) + "px",
                marginLeft: "-" + (((_this.w * 3) / 4 + 2) >> 0) + "px",
                border: 0,
                background: 'none',
                font: _this.props.fontWeight + " " + ((_this.w / _this.digits) >> 0) + "px " + _this.props.font,
                textAlign: 'center',
                color: _this.props.inputColor || _this.props.fgColor,
                padding: '0px',
                WebkitAppearance: 'none'
            });
        };
        _this.renderCenter = function () {
            var _a = _this.props, displayCustom = _a.displayCustom, displayInput = _a.displayInput, disableTextInput = _a.disableTextInput, readOnly = _a.readOnly, value = _a.value;
            if (displayInput) {
                return React.createElement("input", { style: _this.inputStyle(), type: "text", value: value, onChange: _this.handleTextInput, onKeyDown: _this.handleArrowKey, readOnly: readOnly || disableTextInput });
            }
            else if (displayCustom && typeof displayCustom === 'function') {
                return displayCustom();
            }
            return null;
        };
        _this.w = _this.props.width || 200;
        _this.h = _this.props.height || _this.w;
        _this.angleArc = (_this.props.angleArc * Math.PI) / 180;
        _this.angleOffset = (_this.props.angleOffset * Math.PI) / 180;
        _this.startAngle = 1.5 * Math.PI + _this.angleOffset;
        _this.endAngle = 1.5 * Math.PI + _this.angleOffset + _this.angleArc;
        _this.connectStartAngle = 1.5 * Math.PI + _this.angleOffset;
        _this.connectEndAngle = 1.5 * Math.PI + _this.angleOffset + _this.angleArc;
        _this.digits = Math.max(String(Math.abs(_this.props.min)).length, String(Math.abs(_this.props.max)).length, 2) + 2;
        return _this;
    }
    Knob.prototype.componentDidMount = function () {
        this.drawCanvas();
        if (!this.props.readOnly) {
            this.canvasRef.addEventListener('touchstart', this.handleTouchStart, { passive: false });
        }
    };
    Knob.prototype.componentWillReceiveProps = function (nextProps) {
        if (nextProps.width && this.w !== nextProps.width) {
            this.w = nextProps.width;
        }
        if (nextProps.height && this.h !== nextProps.height) {
            this.h = nextProps.height;
        }
    };
    Knob.prototype.componentDidUpdate = function () {
        this.drawCanvas();
    };
    Knob.prototype.componentWillUnmount = function () {
        this.canvasRef.removeEventListener('touchstart', this.handleTouchStart);
    };
    Knob.prototype.drawCanvas = function () {
        var ctx = this.canvasRef.getContext('2d');
        var scale = this.getCanvasScale(ctx);
        this.canvasRef.width = this.w * scale;
        this.canvasRef.height = this.h * scale;
        ctx.scale(scale, scale);
        this.xy = this.w / 2;
        this.lineWidth = this.xy * this.props.thickness;
        this.radius = this.xy - this.lineWidth / 2;
        ctx.lineWidth = this.lineWidth;
        ctx.lineCap = this.props.lineCap;
        ctx.beginPath();
        if (Array.isArray(this.props.bgColor)) {
            var gradient = ctx.createLinearGradient(0, 0, this.w, 0);
            gradient.addColorStop(0, this.props.bgColor[0]);
            gradient.addColorStop(1, this.props.bgColor[1]);
            ctx.strokeStyle = gradient;
        }
        else {
            ctx.strokeStyle = this.props.bgColor;
        }
        ctx.arc(this.xy, this.xy, this.radius, this.endAngle - 0.00001, this.startAngle + 0.00001, true);
        ctx.stroke();
        if (this.props.connector && Array.isArray(this.props.cursor) && this.props.cursor.length > 1) {
            var average = (this.props.cursor[0].value + this.props.cursor[1].value) / 2;
            var c = this.getArcToValue(average, 'connector');
            ctx.beginPath();
            ctx.strokeStyle = this.props.connector.color;
            ctx.lineWidth = this.props.connector.width || this.lineWidth;
            ctx.arc(this.xy, this.xy, this.radius, c.startAngle, c.endAngle, c.acw);
            ctx.stroke();
        }
        if (this.props.cursor && Array.isArray(this.props.cursor) && this.props.cursor.length > 0) {
            for (var i = this.props.cursor.length - 1; i >= 0; i--) {
                var cursor = this.props.cursor[i];
                var value = cursor.value ? cursor.value : this.props.value;
                var b = this.getArcToValue(value, 'cursor', cursor);
                ctx.beginPath();
                ctx.strokeStyle = this.props.cursor[i].color || this.props.fgColor;
                ctx.lineWidth = this.props.cursor[i].widthMultiplier ? this.lineWidth * this.props.cursor[i].widthMultiplier : this.lineWidth;
                ctx.arc(this.xy, this.xy, this.radius, b.startAngle, b.endAngle, b.acw);
                ctx.stroke();
            }
        }
        else if (this.props.cursor) {
            var a = this.getArcToValue(this.props.value);
            ctx.beginPath();
            ctx.strokeStyle = this.props.fgColor;
            ctx.arc(this.xy, this.xy, this.radius, a.startAngle, a.endAngle, a.acw);
            ctx.stroke();
        }
    };
    Knob.prototype.render = function () {
        var _this = this;
        var _a = this.props, canvasClassName = _a.canvasClassName, className = _a.className, disableMouseWheel = _a.disableMouseWheel, readOnly = _a.readOnly, title = _a.title, value = _a.value;
        return (React.createElement("div", { className: className, style: { width: this.w, height: this.h }, onWheel: readOnly || disableMouseWheel ? null : this.handleWheel },
            React.createElement("canvas", { ref: function (ref) {
                    _this.canvasRef = ref;
                }, className: canvasClassName, style: { width: '100%', height: '100%' }, onMouseDown: readOnly ? null : this.handleMouseDown, title: title ? title + ": " + value : value + '' }),
            this.renderCenter()));
    };
    Knob.propTypes = {};
    Knob.defaultProps = {
        onChangeEnd: function () { },
        min: 0,
        max: 100,
        step: 1,
        log: false,
        width: 200,
        height: 200,
        thickness: 0.35,
        lineCap: 'butt',
        bgColor: '#EEE',
        fgColor: '#EA2',
        inputColor: '',
        font: 'Arial',
        fontWeight: 'bold',
        clockwise: true,
        cursor: false,
        connector: null,
        stopper: true,
        readOnly: false,
        disableTextInput: false,
        displayInput: true,
        angleArc: 360,
        angleOffset: 0,
        disableMouseWheel: false,
        className: null,
        canvasClassName: null
    };
    return Knob;
}(React.Component));
exports.default = Knob;
