;(function (window) {
    window.Nes = window.Nes || {};

    var PopUpMessageView = Backbone.View.extend({
        timeoutID: null,
        className: 'notification-message',

        close: function () {
            window.clearTimeout(this.timeoutID);
            this.remove();
        },

        initialize: function (o) {
            this.o = o;
        },

        markClosed: function () {
            this.el.classList.add('closed');
        },

        render: function () {
            this.el.insertAdjacentText('beforeend', this.o.text);
            this.el.classList.add(this.o.type);
            this.$el.on('click', this.close);
            this.$el.on('transitionend', this.close);
            this.timeoutID = window.setTimeout(this.markClosed.bind(this), 3000);

            return this;
        }
    });

    window.Nes.notification = {
        container: document.createElement('div'),

        init: function (o) {
            this.container.setAttribute('id', 'notification');
            o.context.append(this.container);
        },

        showMessage: function (text, type) {
            var popUpMessage = new PopUpMessageView({
                text: text,
                type: type || 'info'
            }).render().el;

            this.container.append(popUpMessage);
        }
    };

})(window);

