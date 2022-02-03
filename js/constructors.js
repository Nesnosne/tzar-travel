;(function (window) {
	window.TZT = window.TZT || {};

	window.TZT.Header = Backbone.View.extend({
		img: null,
		url: '',
		nexturl: '',
		urls: null,
		events: {
			'click': 'clickEvent'
		},
		initialize: function (o) { // context, url
			_.extend(this, o);
			this.setElement(o.context); // если делать this.el = o.context , то не работает events
			this.on('loadSuccess', this.onLoadComplete);
			Nes.resource.load(this);
		},
		onLoadComplete: function (data) {
			this.urls = data;

			this.url = this.chooseUrl('');
			this.nexturl = this.chooseUrl(this.url);
			this.prepareImg();
		},

		prepareImg: function () {
			this.render();
			this.url = this.nexturl;
			this.nexturl = this.chooseUrl(this.nexturl);
		},

		randomUrl: function () {
			return this.urls[_.random(0, this.urls.length - 1)];
		},

		chooseUrl: function (prevurl) { // возвращает url не равный переданному
			var url;
			do {
				url = this.randomUrl();
			} while (url === prevurl);
			return url;
		},

		render: function () {
			this.context.setAttribute('style', 'background-image: url(' + this.url + '), url(/i/header/i000.jpg), url(' + this.nexturl + ');');
		},

		clickEvent: function (e) {
			if (e.target === this.context) {
				this.prepareImg();
			}
		}
	});

	window.TZT.Review = Backbone.View.extend({
		events: {
			'click': 'clickReviewEvent'
		},
		initialize: function (o) {
			this.template = _.template(o.template);
			this.url = o.url;
			this.reviewContextOne = o.reviewContextOne;
			this.on('loadSuccess', this.renderAfterLoaded);
		},

		render: function () {
			Nes.resource.load(this, true);
		},

		renderAfterLoaded: function (data) {
			var reviews = data,
				n = reviews.length - 1,
				content = this.template(reviews[_.random(0, n)]);

			this.setElement(content);
			document.querySelector(this.reviewContextOne).prepend(this.el);
		},
		clickReviewEvent: function (e) {
			e.currentTarget.classList.remove('mini');
		}
	});

	window.TZT.Reviews = Backbone.View.extend({
		initialize: function (o) {
			this.template = _.template(o.templates);
			this.url = o.url;
			this.reviewsContextAll = o.reviewsContextAll;
			this.on('loadSuccess', this.renderAfterLoaded);
		},

		render: function () {
			Nes.resource.load(this, true);
		},

		renderAfterLoaded: function (data) {
			data.forEach(function (item) {
				var content = this.template(item);
				this.el.insertAdjacentHTML('beforeend', content);
			}, this);

			document.querySelector(this.reviewsContextAll).append(this.el);
		}
	});

	window.TZT.PartView = Backbone.View.extend({
		tabs: null,
		events: {
			'click .tab': 'clickEventTab'
		},

		extraScript: {
			// index: function () {
			// 	TZT.reviews.review.render();
			// },
			reviews: function () {
				TZT.reviews.reviews.render();
			}
		},

		initialize: function (o) {
			_.extend(this, o);
			this.setElement('<article>');
			this.el.setAttribute('id', this.id);
			this.bindEvents();
			Nes.resource.load(this, true); // запрашиваем currentPage.url и помещаем ответ в currentPage.content
		},

		render: function (resetTab) {
			this.context.append(this.el); // в этот момент part может быть ещё не загружена

			if (resetTab) { // этот кусок срабатывает только когда view закеширована и .tab уже в DOM
				this.tabs = this.el.querySelectorAll('.tab');
				if (this.tabs) {
					this.tabs.forEach(function (item) {
						item.parentElement.classList.remove('current');
					})
				}
			}
		},

		renderAfterLoaded: function (data) {
			this.el.insertAdjacentHTML('beforeend', data); // кладем дату во вьюшку

			this.tabs = this.el.querySelectorAll('.tab');

			if (this.tabs) {
				this.tabs.forEach(function (item) {
					if (document.location.href.startsWith(item.href)) {
						item.parentElement.classList.add('current');
					}
				});
			}

			this.postRender();
		},

		postRender: function () {
			Nes.yadi.render({
				context: this.el
			});

			if (this.extraScript[this.id]) {
				this.extraScript[this.id]();
			}
		},

		clickEventTab: function (e) {
			this.tabs.forEach(function (item) {
				item.parentElement.classList.remove('current');
			});
			e.target.parentElement.classList.add('current');
		},

		bindEvents: function () {
			this.on('loadSuccess', function (data) {
				this.renderAfterLoaded(data);
			});

			this.on('loadFailed', function () {
				TZT.pageManager.switchPage(['index']);
			});
		}
	});

	window.TZT.Router = Backbone.Router.extend({
		routes: {
			'': 'index',
			'(:part1)(/)(:part2)(/)(:part3)(/)': 'path'
		},

		index: function () {
			TZT.pageManager.switchPage(['index']);
		},

		path: function () {// нужно пробежать псевдомассив arguments чтобы вынуть из него OwnProperties
			var parts = [];
			arguments.forEach = Array.prototype.forEach;
			arguments.forEach(function (item, index) {
				if (arguments.hasOwnProperty(index) && item) {
					parts.push(item);
				}
			});

			TZT.pageManager.switchPage(parts); // ['cruise-visitors', 'one-day-tour', 'option-a']
			TZT.currentMenu.setCurrentItem(parts[0]);
		}
	});
})(window);
