组件内使用的指令

```js
// 点击组件之外隐藏
function defaultConditional() {
  return true;
}
function directive(e, el, binding) {
  if (e.target.className.indexOf("picker") >= 0) return;
  var handler =
    typeof binding.value === "function" ? binding.value : binding.value.handler;
  var isActive =
    (typeof binding.value === "object" && binding.value.closeConditional) ||
    defaultConditional;
  if (!e || isActive(e) === false) return;
  var elements = (
    (typeof binding.value === "object" && binding.value.include) ||
    function () {
      return [];
    }
  )();
  elements.push(el);
  !elements.some(function (el) {
    return el.contains(e.target);
  }) &&
    setTimeout(function () {
      isActive(e) && handler && handler(e);
    }, 0);
}

export const clickOutside = {
  inserted: function (el, binding) {
    var onClick = function (e) {
      return directive(e, el, binding);
    };
    var app = document.body;
    app.addEventListener("click", onClick, true);
    el._clickOutside = onClick;
  },
  unbind: function (el) {
    if (!el._clickOutside) return;
    var app = document.body;
    app && app.removeEventListener("click", el._clickOutside, true);
    delete el._clickOutside;
  },
};
```
