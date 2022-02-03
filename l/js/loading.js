"use strict"

;(function (window) {
	window.Nes = window.Nes || {};


	/* *
	 * добавляет убирает класс в контекстный элемент
	 * */

	window.Nes.loading = {
		loadingClass: 'loading',
		init: function (o) {
			_.extend(this, o);
			this.removeClass(this.loadingClass);
		},
		start: function () {
			this.context.classList.add(this.loadingClass)
		},
		stop: function () {
			this.removeClass(this.loadingClass);
		},
		removeClass: function () {
			this.context.classList.remove(this.loadingClass);
		}
	};
	
})(window);

