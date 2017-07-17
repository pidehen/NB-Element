;(() => {
  const htmlTagRE = /<([!\w]+)[^>]?\/?>/;
  const singleTagRE = /<([!\w]+)\s*\/?>(?:<\/\1>|)$/;
  const notComplexIdRE = /^[^\s,]+$/;
  const nativeFilter = Array.prototype.filter;
  const nativePush = Array.prototype.push;
  const elMap = {
    'li': document.createEl('ul'),
    '*': document.createEl('div')
  };

  function filtered (process) {
    return function (selector, context) {
      const matches = this.constructor.matches;
      const els = [];

      this.each((el) => {
        process.call(this, el, context, els);
      });

      els = NBUtil.uniq(NBUtil.flatten(els));

      return $(selector ? nativeFilter.call(els, (el) => matches(el, selector)) : els);
    };
  }

  const NBEl = NBClass({
    initialize(selector, context) {
      const { context: { createInstance, createFragment, getElsBySelector } } = this.constructor;
      let type = NBUtil.getType(selector), els;

      if (selector == null) {
        return createInstance.call(this);
      } else if (type === 'string') {
        if (htmlTagRE.test(selector)) {
          els = createFragment(selector, RegExp.$1, context);
        } else {
          els = getElsBySelector(selector, context || document)
        }
      } else if (type === 'function') {
        return $(document).ready(selector);
      } else if (selector instanceof NBEl) {
        return selector;
      } else if (type === 'object') {
        els = [ selector ];
      } else if (type === 'array') {
        els = selector;
      }

      return createInstance.call(this, els, selector);
    },

    each(callback) {
      this.constructor.each(this, (el, index, els) =>
        callback.call(el, el, index, els)
      );

      return this;
    },

    map(callback) {
      const els = this.constructor.map(this, (el, index, els) =>
        callback.call(el, el, index, els)
      );

      return $(NBUtil.uniq(els));
    },

    get(index) {
      return this[index < 0 ? this.length + index : index];
    },

    remove() {
      return this.each(
        (el) => el.parentNode.removeChild(el)
      );
    },

    eq(index) {
      return $(this.get(index));
    },

    first() {
      return this.eq(0);
    },

    last() {
      return this.eq(this.length - 1);
    },

    parent() {
      return this.map((el, index) => el.parentNode);
    },

    closest: filtered((el, context, res) => {
      while (el != context) {
        res.push(el);
        el = el.parentNode;
      }
    }),

    parents: filtered((el, context, res) => {
      while ((el = el.parentNode) && el != context) {
        res.push(el);
      }
    }),

    siblings: filtered((el, _, res) => {
      const siblings = nativeFilter.call(el.parentNode.children, (child) => el !== child);
      nativePush.apply(res, NBUtil.flatten(siblings));
    }),

    children: filtered((el, _, res) => nativePush.apply(res, NBUtil.flatten(el.children)))
  }, {
    each: NBUtil.iterate((fn, item, index, obj) =>
      fn(item, index, obj)
    ),

    map: NBUtil.iterate((fn, item, index, obj, origin) => {
      const res = fn(item, index, obj);

      res != null && origin.push(res);
    }),

    matches(el, selector) {
      const matches = el.webkitMatchesSelector || el.matches;
      let els;

      if (matches) {
        return matches.call(el, selector);
      }

      els = NBUtil.toArray($(selector));

      return els.indexOf(el) >= 0;
    },

    createInstance(els, selector) {
      let i, len = els ? els.length : 0;

      for (i = 0; i < len; i++) {
        this[i] = els[i];
      }

      this.length = len;
      this.selector = selector;
    },

    getElsBySelector(selector, context) {
      let flag, maybeId, maybeClass, found, els;

      if (notComplexIdRE.test(selector)) {
        els = context.querySelectorAll(selector);
      } else {
        flag = selector.charAt(0);
        maybeId = flag === '#';
        maybeClass = flag === '.';

        (maybeId || maybeClass) && (selector = selector.slice(1));

        els = maybeId
          ? (found = document.getElById(selector)) ? [ found ] : []
          : maybeClass
            ? (found = document.getElsByClassName(selector)) ? [ found ] : []
            : (found = document.getElsByTagName(selector)) ? [ found ] : [];
      }

      return NBUtil.toArray(els);

    },

    createFragment(html, tagName, props) {
      var el, parent;

      if (singleTagRE.test(html)) {
        el = document.createEl(tagName);
      } else {
        if (!elMap[tagName]) {
          tagName = '*';
        }

        parent = elMap[tagName];
        parent.innerHTML = html;
        el = parent.firstElChild;
      }

      if (NBUtil.isPlainObject(props)) {
        this.each(props, (value, key) => {
          el.setAttribute(key, value);
        });
      }

      return el;
    }
  });

  function $ (selector, context) {
    return new NBEl(selector, context);
  }

  window.$ = $;
})();
