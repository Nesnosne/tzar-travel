/***************************************************************************************************************
 *    prepend https://github.com/jserz/js_piece/blob/master/DOM/ParentNode/prepend()/prepend().md
 ****************************************************************************************************************/
(function (arr) {
	arr.forEach(function (item) {
		if (item.hasOwnProperty('prepend')) {
			return;
		}
		Object.defineProperty(item, 'prepend', {
			configurable: true,
			enumerable: true,
			writable: true,
			value: function prepend() {
				var argArr = Array.prototype.slice.call(arguments),
					docFrag = document.createDocumentFragment();

				argArr.forEach(function (argItem) {
					var isNode = argItem instanceof Node;
					docFrag.appendChild(isNode ? argItem : document.createTextNode(String(argItem)));
				});

				this.insertBefore(docFrag, this.firstChild);
			}
		});
	});
})([Element.prototype, Document.prototype, DocumentFragment.prototype]);

/***************************************************************************************************************
 *    append https://github.com/jserz/js_piece/blob/master/DOM/ParentNode/append()/append().md
 ****************************************************************************************************************/

(function (arr) {
	arr.forEach(function (item) {
		if (item.hasOwnProperty('append')) {
			return;
		}
		Object.defineProperty(item, 'append', {
			configurable: true,
			enumerable: true,
			writable: true,
			value: function append() {
				var argArr = Array.prototype.slice.call(arguments),
					docFrag = document.createDocumentFragment();

				argArr.forEach(function (argItem) {
					var isNode = argItem instanceof Node;
					docFrag.appendChild(isNode ? argItem : document.createTextNode(String(argItem)));
				});

				this.appendChild(docFrag);
			}
		});
	});
})([Element.prototype, Document.prototype, DocumentFragment.prototype]);


/***************************************************************************************************************
 *    indexOf
 ****************************************************************************************************************/

if (!Array.prototype.indexOf) {
	Array.prototype.indexOf = function (vMember, nStartFrom) {
		/*
		In non-strict mode, if the `this` variable is null or undefined, then it is
		set the the window object. Otherwise, `this` is automatically converted to an
		object. In strict mode if the `this` variable is null or undefined a
		`TypeError` is thrown.
		*/
		if (this == null) {
			throw new TypeError("Array.prototype.indexOf() - can't convert `" + this + "` to object");
		}
		var
			nIdx = isFinite(nStartFrom) ? Math.floor(nStartFrom) : 0,
			oThis = this instanceof Object ? this : new Object(this),
			nLen = isFinite(oThis.length) ? Math.floor(oThis.length) : 0;

		if (nIdx >= nLen) {
			return -1;
		}

		if (nIdx < 0) {
			nIdx = Math.max(nLen + nIdx, 0);
		}

		if (vMember === undefined) {
			/*
			Since `vMember` is undefined, keys that don't exist will have the same
			value as `vMember`, and thus do need to be checked.
			*/
			do {
				if (nIdx in oThis && oThis[nIdx] === undefined) {
					return nIdx;
				}
			} while (++nIdx < nLen);
		} else {
			do {
				if (oThis[nIdx] === vMember) {
					return nIdx;
				}
			} while (++nIdx < nLen);
		}
		return -1;
	};
}


/***************************************************************************************************************
 *    startsWith
 ****************************************************************************************************************/

if (!String.prototype.startsWith) {
	Object.defineProperty(String.prototype, 'startsWith', {
		enumerable: false,
		configurable: false,
		writable: false,
		value: function (searchString, position) {
			position = position || 0;
			return this.indexOf(searchString, position) === position;
		}
	});
}


/***************************************************************************************************************
 *    ReplaceWith
 ****************************************************************************************************************/

function ReplaceWith(Ele) {
	'use-strict'; // For safari, and IE > 10
	var parent = this.parentNode,
		i = arguments.length,
		firstIsNode = +(parent && typeof Ele === 'object');
	if (!parent) return;

	while (i-- > firstIsNode) {
		if (parent && typeof arguments[i] !== 'object') {
			arguments[i] = document.createTextNode(arguments[i]);
		}
		if (!parent && arguments[i].parentNode) {
			arguments[i].parentNode.removeChild(arguments[i]);
			continue;
		}
		parent.insertBefore(this.previousSibling, arguments[i]);
	}
	if (firstIsNode) parent.replaceChild(Ele, this);
}

if (!Element.prototype.replaceWith)
	Element.prototype.replaceWith = ReplaceWith;
if (!CharacterData.prototype.replaceWith)
	CharacterData.prototype.replaceWith = ReplaceWith;
if (!DocumentType.prototype.replaceWith)
	DocumentType.prototype.replaceWith = ReplaceWith;