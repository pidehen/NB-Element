;(() => {
  const htmlTagRE = /<([!\w]+)[^>]?\/?>/;
  const singleTagRE = /<([!\w]+)\s*\/?>(?:<\/\1>|)$/;
  const elementMap = {
    'li': document.createElement('ul'),
    '*': document.createElement('div')
  };
  const NBElement = NBClass({
    initialize(selector, context) {
      const createInstance = this.constructor.createInstance;
      const createFragment = this.constructor.createFragment;
      let elements;

      if (selector == null) {
        return createInstance.call(this);
      } else if (NBUtil.getType(selector) === 'string') {
        if (htmlTagRE.test(selector)) {
          elements = createFragment(selector, RegExp.$1, context);
        }
      }
    },
    get(index) {

    }
  }, {
    each: NBUtil.iterate((fn, item, index, obj) => {
      return fn(item, index, obj);
    }),
    createInstance(elements, selector) {

    },
    createFragment(html, tagName, props) {
      var element, parent;

      if (singleTagRE.test(html)) {
        element = document.createElement(tagName);
      } else {
        if (!elementMap[tagName]) {
          tagName = '*';
        }

        parent = elementMap[tagName];
        parent.innerHTML = html;
        element = parent.firstElementChild;
      }

      if (NBUtil.isPlainObject(props)) {
        $.each(props, (value, key) => {
          element.setAttribute(key, value);
        });
      }

      return element;
    }
  });

  function $ (selector, context) {
    return new NBElement(selector, context);
  }

  window.$ = $;
})();
