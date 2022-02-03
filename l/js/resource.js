;(function () {
	window.Nes = window.Nes || {};

	window.Nes.resource = {
		cached: [],
		load: function (view, caching) {
			if (caching === undefined){
				caching = true;
			}
			this.caching = caching;

			if (this.caching) {
				this.cached.some(function (item) {
					this.foundCached = item;
					return view.url === item.url; // true если закешировано
				}, this) ? this.loadSuccess(view, this.foundCached.json) : this.doAjax(view);
			} else {
				this.doAjax(view);
			}
		},

		doAjax: function (view) {
			Nes.loading.start();

			$.ajax(view.url, {
				context: this
			})
				.done(function (data) {
					if (this.caching) {
						this.cached.push({
							url: view.url,
							json: data
						})
					}

					this.loadSuccess(view, data);
				})
				.fail(function () {
					this.loadFailed(view);
				})
				.always(function () {
					Nes.loading.stop();
				});
		},

		loadSuccess: function (view, data) {
			view.trigger('loadSuccess', data);
		},

		loadFailed: function (view) {
			view.trigger('loadFailed');
		}
	};
})(window);
