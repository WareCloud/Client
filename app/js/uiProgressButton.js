/**
 * uiProgressButton.js v1.0.0
 * http://www.codrops.com
 *
 * Licensed under the MIT license.
 * http://www.opensource.org/licenses/mit-license.php
 *
 * Copyright 2014, Codrops
 * http://www.codrops.com
 */
;(function(window) {

	'use strict';

	function extend(a, b) {
		for (var key in b) {
			if (b.hasOwnProperty(key)) {
				a[key] = b[key];
			}
		}
		return a;
	}

	function SVGEl(el) {
		this.el = el;

		// the path elements
		this.paths = [].slice.call(this.el.querySelectorAll('path'));

		// we will save both paths and its lengths in arrays
		this.pathsArr = [];
		this.lengthsArr = [];
		this._init();
	}

	SVGEl.prototype._init = function() {
		var self = this;
		this.paths.forEach(function(path, i) {
			self.pathsArr[i] = path;
			path.style.strokeDasharray = self.lengthsArr[i] = path.getTotalLength();
		});

		// undraw stroke
		this.draw(0);
	};

	// val in [0,1] : 0 - no stroke is visible, 1 - stroke is visible
	SVGEl.prototype.draw = function(val) {
		for(var i = 0, len = this.pathsArr.length; i < len; ++i){
			this.pathsArr[ i ].style.strokeDashoffset = this.lengthsArr[ i ] * (1 - val);
		}
	};

	function UIProgressButton(el, options) {
		this.el = el;
		this.options = extend({}, this.options);
		extend(this.options, options);
		this._init();
	}

	UIProgressButton.prototype.options = {
		// time in ms that the status (success or error will be displayed) - should be at least higher than the transition-duration value defined for the stroke-dashoffset transition of both checkmark and cross strokes
		statusTime : 3000
	};

	UIProgressButton.prototype._init = function() {
		// the button
		this.button = this.el.querySelector('button');
		// progress el
		this.progressEl = new SVGEl(this.el.querySelector('svg.progress-circle'));
		// the success/error elems
		this.successEl = new SVGEl(this.el.querySelector('svg.checkmark'));
		this.errorEl = new SVGEl(this.el.querySelector('svg.cross'));
		// init events
		this._initEvents();
		// enable button
		this._enable();
	};

	UIProgressButton.prototype._initEvents = function() {
		var self = this;
		this.button.addEventListener('click', function() { self._submit(); });
	};

	UIProgressButton.prototype._submit = function() {
		// by adding the loading class the button will transition to a "circle"
        this.el.className = this.el.className + ' loading';

		var self = this;
		var onEndBtnTransitionFn = function(ev) {
			if (ev.propertyName !== 'width') return false;
				this.removeEventListener('transitionend', onEndBtnTransitionFn);

			// disable the button - this should have been the first thing to do when clicking the button.
			// however if we do so Firefox does not seem to fire the transitionend event.
			this.disabled = true;

			if (typeof self.options.callback === 'function')
				self.options.callback(self);
			else
			{
				// fill it (time will be the one defined in the CSS transition-duration property)
				self.setProgress(1);
				self.stop();
			}
		};

		this.button.addEventListener('transitionend', onEndBtnTransitionFn);
	};

	// runs after the progress reaches 100%
	UIProgressButton.prototype.stop = function(status) {
		var self = this;
		var endLoading = function() {
			// first undraw progress stroke.
			self.progressEl.draw(0);

			var statusClass = status ? 'success' : 'error';
			var statusEl = status ? self.successEl : self.errorEl;

			// draw stroke of success (checkmark) or error (cross).
			statusEl.draw(1);

			// add respective class to the element
			self.el.className = self.el.className + ' ' + statusClass;

			// after options.statusTime remove status and undraw the respective stroke. Also enable the button.
			setTimeout(function() {
                self.el.className = self.el.className.replace(' ' + statusClass, '');
				statusEl.draw(0);
				self._enable();
			}, self.options.statusTime);

			// finally remove class loading.
            self.el.className = self.el.className.replace(' loading', '');
		};

		// give it a time (ideally the same like the transition time) so that the last progress increment animation is still visible.
		setTimeout(endLoading, 300);
	};

	UIProgressButton.prototype.setProgress = function(val) {
		this.progressEl.draw(val);
	};

	// enable button
	UIProgressButton.prototype._enable = function() {
		this.button.disabled = false;
	};

	// add to global namespace
	window.UIProgressButton = UIProgressButton;

})(window);