
// TODO заменить ебучие картинки

;(function (window) {
	window.TZT = window.TZT || {};

	window.TZT.header = {
		instance: null,
		init: function (o) {
			this.instance = new TZT.Header(o);
		}
	};

	window.TZT.reviews = {
		review: null,
		reviews: null,
		init: function (o) {
			// this.review = new TZT.Review(o);
			this.reviews = new TZT.Reviews(o);
		}

	};

	window.TZT.pageManager = {
		prev: [],
		toRemove: [],
		toShow: [],
		pages: {},

		resetAll: function () {
			this.toShow.length = 0;
			this.toRemove.length = 0;
		},
		//                              ['cruise-visitors']
		//                              ['cruise-visitors', 'two-day-tour']
		//                              ['cruise-visitors', 'three-day-tour']
		// принимаем моссиф папок типа  ['cruise-visitors', 'one-day-tour', 'option-a'], в этих папках лежит файл this.o.pageContent, вот его-то и  надо подгрузить в this.o.context
		//                              ['cruise-visitors', 'one-day-tour', 'option-c']
		//                              ['cruise-visitors']
		//                              ['land-visitors']
		switchPage: function (parts) {
			this.resetAll();
			this.initNewViews(parts); // пробегаем parts, из них создаем иерархию pages, создем новую view и инициализируем (происходит загрузка index.html)
			this.findObsoleteViews(parts);
			this.renderAll();
			this.prev = parts;
		},

		findObsoleteViews: function (parts) {
			var currentPage = this.pages;
			this.prev.forEach(function (item, index) { // смотрим какие view нужно remove
				if (parts[index] !== item && currentPage[this.prev[index]] || parts[index] === undefined) {
					// если part не совпадает с prev и есть view, то remove
					// если текущий part undefined, значит урль короче чем предыдущий, то remove

					this.toRemove.push(currentPage[this.prev[index]]);
				}

				currentPage = currentPage[item]; // углубляемся по иерархии parts
			}.bind(this));
		},

		initNewViews: function (parts) {
			var currentPage = this.pages,
				prev = '';

			parts.forEach(function (item) {  // нужно пробежать parts с целью создать view на каждый part
				prev += item + '/';             // накапливаем папки, разделяя слешом 'cruise-visitors/one-day-tour/option-a/'

				if (currentPage[item] === undefined || currentPage[item].view === undefined) { // если нет поля, то создаём view
					currentPage[item] = {
						view: new TZT.PartView({
							id: item,
							context: this.o.context,
							url: '/' + this.o.lang + '/' + prev + this.o.pageContent // получаем строку типа '/en/cruise-visitors/one-day-tour/option-a/index.html' это путь к файлу с контентом. // создаем this.pages['cruise-visitors'].url
						})
					};
				}
				currentPage = currentPage[item]; // углубляемся по иерархии parts
				this.toShow.push(currentPage.view);
			}.bind(this));
		},

		renderAll: function () {
			this.toRemove.forEach(function (item) {
				item.view.remove();
				item.view = undefined; // удаляем ссылку на view чтобы она создавалась заного чтобы не делать delegateEvents
			});

			this.toShow.forEach(function (item, index, arr) {
				item.render((arr.length - 1) === index); // если item это последняя view, то ищем и удаляем current из tabs
			});
		}
	};

	window.TZT.currentMenu = {
		allItems: null,
		allItemsMask: '[class*="nav-"]',
		init: function (data) {
			this.$context = $(data.context);
			this.bindEvents();
			this.allItems = this.$context.find(this.allItemsMask);
		},
		bindEvents: function () {
			this.$context.on('click', this.allItemsMask, function (e) {
				this.allItems.removeClass('current');
				e.currentTarget.classList.add('current');
			}.bind(this));
		},
		setCurrentItem: function (item) {
			var currentMenuItemClass = '.nav-' + item;
			this.$context.find(currentMenuItemClass).addClass('current');
		}
	};

	window.TZT.main = {
		init: function (o) {
			TZT.pageManager.o = o;

			TZT.currentMenu.init({
				context: o.currentMenuContext
			});

			this.initRouter();
			this.bindEvents();
		},

		initRouter: function () {
			TZT.router = new TZT.Router();
			Backbone.history.start({pushState: true}); // запускаем отслеживание изменения url // запускаем switchpage
		},

		bindEvents: function () {
			$(document).on('click', '.js-navigate', this.navigateEvent);
		},

		navigateEvent: function (e) {
			var url = e.currentTarget.pathname; // "/cruise-visitors/one-day-tour/option-c/" // подходит для navigate
			e.preventDefault();
			TZT.router.navigate(url, {trigger: true}); // отправляеи url в router и запускаем функцию если url совпадет с паттерном роута
			TZT.header.instance.prepareImg();
		}
	}

})(window);
