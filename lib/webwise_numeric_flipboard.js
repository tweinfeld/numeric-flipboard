(function () {

// Flipboard jQuery-UI widget definition
    $.widget("ui.webwise_numeric_flipboard", {
        widgetBaseClass:"webwise_numeric_flipboard",
        options:{
            digits:1,
            value:0
        },
        widgetEventPrefix:"webwise_numeric_flipboard_",
        _init:function (digits) {
            this._polyfill();
            this._render();
        },
        _render:function () {
            var _this = this;
            var digitValues = this._getNumericArray();
            //.extend());
            _.times(this.options.digits, function (i) {
                var currentDigitValue = digitValues[i] || "0";
                var digit = $('<div class="digit l' + i.toString() + '"/>').appendTo(_this.element);
                digit
                    .append($('<div class="back top i' + currentDigitValue + '"/>'))
                    .append($('<div class="back bottom i' + currentDigitValue + '"/>'))
                    .append($('<div class="front top i' + currentDigitValue + '"/>'))
                    .append($('<div class="front bottom i' + currentDigitValue + '"/>'));
            });
        },
        _getNumericArray:function () {
            return  _(_.range(0, this.options.digits)).chain().map(function () {
                return "0"
            }).extend(this.options.value.toString().split('').reverse()).value().reverse();
        },
        update:function (number) {
            var previousArray = this._getNumericArray();
            this.options.value = number;
            var digits = this._getNumericArray();
            var _this = this, updatedCount = 0, calledCount = 0;

            _.times(this.options.digits, function (i) {
                if (previousArray[i] !== digits[i]) {
                    updatedCount++;
                    _this._flipDigit(digits[i], $(_this.element).find('.digit.l' + i.toString()), function () {
                        calledCount++;
                        if (calledCount === updatedCount) {
                            _this._trigger('flip_animation_completed');
                        }
                    });
                }
            });

            if (updatedCount === 0) _this._trigger('flip_animation_completed');
        },
        _polyfill:function () {
            // Request animation frame polyfill
            (function () {
                var lastTime = 0;
                var vendors = ['ms', 'moz', 'webkit', 'o'];
                for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
                    window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
                    window.cancelAnimationFrame =
                        window[vendors[x] + 'CancelAnimationFrame'] || window[vendors[x] + 'CancelRequestAnimationFrame'];
                }

                if (!window.requestAnimationFrame)
                    window.requestAnimationFrame = function (callback, element) {
                        var currTime = new Date().getTime();
                        var timeToCall = Math.max(0, 16 - (currTime - lastTime));
                        var id = window.setTimeout(function () {
                                callback(currTime + timeToCall);
                            },
                            timeToCall);
                        lastTime = currTime + timeToCall;
                        return id;
                    };

                if (!window.cancelAnimationFrame)
                    window.cancelAnimationFrame = function (id) {
                        clearTimeout(id);
                    };
            }());
        },
        _flipDigit:function (digit, el, finishCallback) {

            var _this = this;
            var bt = $('.back.top', el),
                bb = $('.back.bottom', el),
                ft = $('.front.top', el),
                fb = $('.front.bottom', el),
                dl = 60;

            async.series([
                function (next) {
                    requestAnimationFrame(function () {
                        bt.removeClass('i0 i1 i2 i3 i4 i5 i6 i7 i8 i9').addClass('i' + digit);
                        ft.addClass('flip1');
                        _.delay(next, dl, null);
                    });
                }, function (next) {
                    requestAnimationFrame(function () {
                        ft.removeClass('flip1').addClass('flip2');
                        _.delay(next, dl, null);
                    });
                }, function (next) {
                    requestAnimationFrame(function () {
                        ft.removeClass('i0 i1 i2 i3 i4 i5 i6 i7 i8 i9 flip2').addClass('i' + digit);
                        fb.removeClass('i0 i1 i2 i3 i4 i5 i6 i7 i8 i9').addClass('flip2 i' + digit);
                        _.delay(next, dl, null);
                    });
                }, function (next) {
                    requestAnimationFrame(function () {
                        fb.removeClass('flip2').addClass('flip1');
                        _.delay(next, dl / 2, null);
                    });
                }, function (next) {
                    requestAnimationFrame(function () {
                        _([bt, bb, ft, fb]).each(function (s) {
                            s.removeClass('i0 i1 i2 i3 i4 i5 i6 i7 i8 i9 flip1 flip2').addClass('i' + digit);
                        });
                        next(null);
                    });

                }
            ], function (err, result) {
                finishCallback && (function () {
                    finishCallback()
                })();
            });
        }
    });
})();