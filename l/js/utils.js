;(function () {
	window.Nes = window.Nes || {};

	window.Nes.utils = {
		setAttributes: function (el, attrs) {
			for (var key in attrs) {
				if (attrs.hasOwnProperty(key)) {
					el.setAttribute(key, attrs[key]);
				}
			}
		},

		preloadImages: function (arrayOfImages) { // принимет Array урлов
			arrayOfImages.forEach(function (item) {
				(new Image()).src = item;
			});
		},

		preloadImage: function (url) {
			(new Image()).src = url;
		}
	}

})(window);
