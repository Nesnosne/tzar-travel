;(function () {
	window.Nes = window.Nes || {};

	var urlManager = {
		url: {
			http: 'https://cloud-api.yandex.net:443',
			resources: '/v1/disk/public/resources',
			download: '/v1/disk/public/resources/download',
			local:'/i/photos'
		},

		getURL: function (downloadType, el) {
			var url, parameters = $(el).data();

			if (downloadType === 'local') {
				url = this.url[downloadType] + parameters.path;
			} else {
				url = this.url.http + this.url[downloadType] + '?' + this.urlParameters(el);
			}

			return url;
		},

		urlParameters: function (el) {
			var url = [],
				dataAttributes = $(el).data();

			$.each(dataAttributes, function (k, v) {
				url.push(k + '=' + encodeURIComponent(v)); // из атрибутов формируем пары ИмяАтрибута=ЗначениеАтрибута
			});

			return url.join('&'); // возвращаем все пары соединенные &, получаем часть url который стоит справа от ?
		}
	};

	var PopUp = Backbone.View.extend({
		id: 'yadi-container-popup',
		url: '',
		events: {
			'click #close': 'clickEventClose',
			'click #prev-arrow': 'clickEventPrev',
			'click #container-img': 'clickEventNext'
		},
		initialize: function (obj) {
			this.clickedObj = obj;
			this.genUrl(obj.target);
			this.on('loadSuccess', this.renderComplete);
			Nes.resource.load(this, true);
		},
		renderComplete: function (json) {
			this.renderImg(this.url);
			this.renderLeftArrow();
			this.renderCloseArrow();
			document.body.append(this.el);
		},
		clickEventClose: function () {
			this.remove();
		},
		clickEventPrev: function () {
			if (this.clickedObj.target.previousElementSibling) {
				this.clickedObj.target.previousElementSibling.click();
			}
			this.clickEventClose();
		},
		clickEventNext: function () {
			if (this.clickedObj.target.nextElementSibling) {
				this.clickedObj.target.nextElementSibling.click();
			}
			this.clickEventClose();
		},
		genUrl: function (el) {
			this.url = urlManager.getURL('local', el);
		},
		renderImg: function (json) {
			var el;
			el = document.createElement('div');
			Nes.utils.setAttributes(el, {
				'id': 'container-img',
				'style': "background-image: url('" + json + "');",
				'title': 'Вправо'
			});

			this.el.append(el);
		},

		renderLeftArrow: function () {
			var el;
			el = document.createElement('div');

			Nes.utils.setAttributes(el, {
				'id': 'prev-arrow',
				'class': 'control',
				'title': 'Налево'
			});
			this.el.append(el);
		},
		renderCloseArrow: function () {
			var el;
			el = document.createElement('div');
			Nes.utils.setAttributes(el, {
				'id': 'close',
				'class': 'control',
				'title': 'Закрыть'
			});
			this.el.append(el);
		}
	});

	var Images = Backbone.View.extend({ // набор картинок из одного input hidden
		className: 'yadi-container',
		template: null,
		size: {},
		events: {
			'click img': 'clickImgEvent'
		},

		initialize: function (o) {
			_.extend(this, o);
			this.template = _.template(this.template);
			this.on('loadSuccess', this.renderComplete);
		},


		render: function () {
			this.size = {
				w: this.marker.getAttribute('data-preview_size').split('x')[0] || '',
				h: this.marker.getAttribute('data-preview_size').split('x')[1] || ''
			};
			Nes.resource.load(this, true);
		},

		renderComplete: function (json) {
			// 6. заменить маркеры на контейнеры с картинками
			json._embedded.items.forEach(function (item) {
				this.el.insertAdjacentHTML('beforeend', this.template({
					// src: item.preview,
					src: '/i/photos/' + item.path,
					w: this.size.w,
					h: this.size.h,
					path: item.path,
					public_key: item.public_key
				}));
			}, this);
			this.marker.replaceWith(this.el);
		},

		clickImgEvent: function (e) {
			new PopUp(e);
			this.cacheAll(e);
			this.cacheAll = function () {
			};
		},
		cacheAll: function (e) {
			var objNext, objPrev, url;

			for (objPrev = e.target;
				 objPrev.previousElementSibling;
				 objPrev = objPrev.previousElementSibling) {
				url = urlManager.getURL('local', objPrev.previousElementSibling);
				this.cacheJSON(url);
			}

			for (objNext = e.target;
				 objNext.nextElementSibling;
				 objNext = objNext.nextElementSibling) {
				url = urlManager.getURL('local', objNext.nextElementSibling);
				this.cacheJSON(url);
			}
		},

		cacheJSON: function (url) {
			$.ajax(url).done(function (data) {
				Nes.resource.cached.push({
					url: url,
					json: data
				});
				Nes.utils.preloadImage(data.href);
			});
		}
	});

	window.Nes.yadi = {
		init: function (o) {
			_.extend(this, o);
			NodeList.prototype.forEach = Array.prototype.forEach;
		},

		render: function (o) {
			_.extend(this, o);

			// 1. найти все маркеры (input type=hidden name=yadi-marker)
			this.context.querySelectorAll('[role="yadi-marker"]').forEach(function (item) {
				var markers;
				markers = ({ // перебор всех input в контексте
					view: new Images({
						marker: item, // ссылка на DOM где стоит input
						template: this.template,
						url: urlManager.getURL('resources', item)
					})
				});
				markers.view.render();
			}.bind(this)); // в context находим NodeList всех маркеров
		}
	};
})(window);
