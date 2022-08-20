
// node_modules/imba/src/imba/utils.imba
var $__initor__$ = Symbol.for("#__initor__");
var $__inited__$ = Symbol.for("#__inited__");
var $__hooks__$ = Symbol.for("#__hooks__");
var $type$ = Symbol.for("#type");
var $__listeners__$ = Symbol.for("#__listeners__");
function getDeepPropertyDescriptor(item, key, stop) {
  if (!item) {
    return void 0;
  }
  ;
  let desc = Object.getOwnPropertyDescriptor(item, key);
  if (desc || item == stop) {
    return desc || void 0;
  }
  ;
  return getDeepPropertyDescriptor(Reflect.getPrototypeOf(item), key, stop);
}
var emit__ = function(event, args, node) {
  let prev;
  let cb;
  let ret;
  while ((prev = node) && (node = node.next)) {
    if (cb = node.listener) {
      if (node.path && cb[node.path]) {
        ret = args ? cb[node.path].apply(cb, args) : cb[node.path]();
      } else {
        ret = args ? cb.apply(node, args) : cb.call(node);
      }
      ;
    }
    ;
    if (node.times && --node.times <= 0) {
      prev.next = node.next;
      node.listener = null;
    }
    ;
  }
  ;
  return;
};
function emit(obj, event, params) {
  let cb;
  if (cb = obj[$__listeners__$]) {
    if (cb[event]) {
      emit__(event, params, cb[event]);
    }
    ;
    if (cb.all) {
      emit__(event, [event, params], cb.all);
    }
    ;
  }
  ;
  return;
}

// node_modules/imba/src/imba/scheduler.imba
function iter$__(a) {
  let v;
  return a ? (v = a.toIterable) ? v.call(a) : a : a;
}
var $__init__$ = Symbol.for("#__init__");
var $__patch__$ = Symbol.for("#__patch__");
var $__initor__$2 = Symbol.for("#__initor__");
var $__inited__$2 = Symbol.for("#__inited__");
var $__hooks__$2 = Symbol.for("#__hooks__");
var $schedule$ = Symbol.for("#schedule");
var $frames$ = Symbol.for("#frames");
var $interval$ = Symbol.for("#interval");
var $stage$ = Symbol.for("#stage");
var $scheduled$ = Symbol.for("#scheduled");
var $version$ = Symbol.for("#version");
var $fps$ = Symbol.for("#fps");
var $ticker$ = Symbol.for("#ticker");
var rAF = globalThis.requestAnimationFrame || function(blk) {
  return globalThis.setTimeout(blk, 1e3 / 60);
};
var SPF = 1 / 60;
var Scheduled = class {
  [$__patch__$]($$ = {}) {
    var $12;
    ($12 = $$.owner) !== void 0 && (this.owner = $12);
    ($12 = $$.target) !== void 0 && (this.target = $12);
    ($12 = $$.active) !== void 0 && (this.active = $12);
    ($12 = $$.value) !== void 0 && (this.value = $12);
    ($12 = $$.skip) !== void 0 && (this.skip = $12);
    ($12 = $$.last) !== void 0 && (this.last = $12);
  }
  constructor($$ = null) {
    this[$__init__$]($$);
  }
  [$__init__$]($$ = null, deep = true) {
    var $2;
    this.owner = $$ && ($2 = $$.owner) !== void 0 ? $2 : null;
    this.target = $$ && ($2 = $$.target) !== void 0 ? $2 : null;
    this.active = $$ && ($2 = $$.active) !== void 0 ? $2 : false;
    this.value = $$ && ($2 = $$.value) !== void 0 ? $2 : void 0;
    this.skip = $$ && ($2 = $$.skip) !== void 0 ? $2 : 0;
    this.last = $$ && ($2 = $$.last) !== void 0 ? $2 : 0;
  }
  tick(scheduler2, source) {
    this.last = this.owner[$frames$];
    this.target.tick(this, source);
    return 1;
  }
  update(o, activate\u03A6) {
    let on = this.active;
    let val = o.value;
    let changed = this.value != val;
    if (changed) {
      this.deactivate();
      this.value = val;
    }
    ;
    if (this.value || on || activate\u03A6) {
      this.activate();
    }
    ;
    return this;
  }
  queue() {
    this.owner.add(this);
    return;
  }
  activate() {
    if (this.value === true) {
      this.owner.on("commit", this);
    } else if (this.value === false) {
      true;
    } else if (typeof this.value == "number") {
      let tock = this.value / (1e3 / 60);
      if (tock <= 2) {
        this.owner.on("raf", this);
      } else {
        this[$interval$] = globalThis.setInterval(this.queue.bind(this), this.value);
      }
      ;
    }
    ;
    this.active = true;
    return this;
  }
  deactivate() {
    if (this.value === true) {
      this.owner.un("commit", this);
    }
    ;
    this.owner.un("raf", this);
    if (this[$interval$]) {
      globalThis.clearInterval(this[$interval$]);
      this[$interval$] = null;
    }
    ;
    this.active = false;
    return this;
  }
};
var Scheduler = class {
  constructor() {
    var self = this;
    this.id = Symbol();
    this.queue = [];
    this.stage = -1;
    this[$stage$] = -1;
    this[$frames$] = 0;
    this[$scheduled$] = false;
    this[$version$] = 0;
    this.listeners = {};
    this.intervals = {};
    this.commit = function() {
      self.add("commit");
      return self;
    };
    this[$fps$] = 0;
    this.$promise = null;
    this.$resolve = null;
    this[$ticker$] = function(e) {
      self[$scheduled$] = false;
      return self.tick(e);
    };
    this;
  }
  touch() {
    return this[$version$]++;
  }
  get version() {
    return this[$version$];
  }
  add(item, force) {
    if (force || this.queue.indexOf(item) == -1) {
      this.queue.push(item);
    }
    ;
    if (!this[$scheduled$]) {
      this[$schedule$]();
    }
    ;
    return this;
  }
  get committing\u03A6() {
    return this.queue.indexOf("commit") >= 0;
  }
  get syncing\u03A6() {
    return this[$stage$] == 1;
  }
  listen(ns, item) {
    let set = this.listeners[ns];
    let first = !set;
    set || (set = this.listeners[ns] = new Set());
    set.add(item);
    if (ns == "raf" && first) {
      this.add("raf");
    }
    ;
    return this;
  }
  unlisten(ns, item) {
    var $32;
    let set = this.listeners[ns];
    set && set.delete(item);
    if (ns == "raf" && set && set.size == 0) {
      $32 = this.listeners.raf, delete this.listeners.raf, $32;
    }
    ;
    return this;
  }
  on(ns, item) {
    return this.listen(ns, item);
  }
  un(ns, item) {
    return this.unlisten(ns, item);
  }
  get promise() {
    var self = this;
    return this.$promise || (this.$promise = new Promise(function(resolve) {
      return self.$resolve = resolve;
    }));
  }
  tick(timestamp) {
    var self = this;
    let items = this.queue;
    let frame = this[$frames$]++;
    if (!this.ts) {
      this.ts = timestamp;
    }
    ;
    this.dt = timestamp - this.ts;
    this.ts = timestamp;
    this.queue = [];
    this[$stage$] = 1;
    this[$version$]++;
    if (items.length) {
      for (let i = 0, $4 = iter$__(items), $5 = $4.length; i < $5; i++) {
        let item = $4[i];
        if (typeof item === "string" && this.listeners[item]) {
          this.listeners[item].forEach(function(listener) {
            if (listener.tick instanceof Function) {
              return listener.tick(self, item);
            } else if (listener instanceof Function) {
              return listener(self, item);
            }
            ;
          });
        } else if (item instanceof Function) {
          item(this.dt, this);
        } else if (item.tick) {
          item.tick(this.dt, this);
        }
        ;
      }
      ;
    }
    ;
    this[$stage$] = this[$scheduled$] ? 0 : -1;
    if (this.$promise) {
      this.$resolve(this);
      this.$promise = this.$resolve = null;
    }
    ;
    if (this.listeners.raf && true) {
      this.add("raf");
    }
    ;
    return this;
  }
  [$schedule$]() {
    if (!this[$scheduled$]) {
      this[$scheduled$] = true;
      if (this[$stage$] == -1) {
        this[$stage$] = 0;
      }
      ;
      rAF(this[$ticker$]);
    }
    ;
    return this;
  }
  schedule(item, o) {
    var $6, $72;
    o || (o = item[$6 = this.id] || (item[$6] = {value: true}));
    let state = o[$72 = this.id] || (o[$72] = new Scheduled({owner: this, target: item}));
    return state.update(o, true);
  }
  unschedule(item, o = {}) {
    o || (o = item[this.id]);
    let state = o && o[this.id];
    if (state && state.active) {
      state.deactivate();
    }
    ;
    return this;
  }
};
var scheduler = new Scheduler();
function commit() {
  return scheduler.add("commit").promise;
}
function setTimeout2(fn, ms) {
  return globalThis.setTimeout(function() {
    fn();
    commit();
    return;
  }, ms);
}
function setInterval(fn, ms) {
  return globalThis.setInterval(function() {
    fn();
    commit();
    return;
  }, ms);
}
var clearInterval = globalThis.clearInterval;
var clearTimeout = globalThis.clearTimeout;
var instance = globalThis.imba || (globalThis.imba = {});
instance.commit = commit;
instance.setTimeout = setTimeout2;
instance.setInterval = setInterval;
instance.clearInterval = clearInterval;
instance.clearTimeout = clearTimeout;

// node_modules/imba/src/imba/dom/flags.imba
var $toStringDeopt$ = Symbol.for("#toStringDeopt");
var $__initor__$3 = Symbol.for("#__initor__");
var $__inited__$3 = Symbol.for("#__inited__");
var $__hooks__$3 = Symbol.for("#__hooks__");
var $symbols$ = Symbol.for("#symbols");
var $batches$ = Symbol.for("#batches");
var $extras$ = Symbol.for("#extras");
var $stacks$ = Symbol.for("#stacks");
var Flags = class {
  constructor(dom) {
    this.dom = dom;
    this.string = "";
  }
  contains(ref) {
    return this.dom.classList.contains(ref);
  }
  add(ref) {
    if (this.contains(ref)) {
      return this;
    }
    ;
    this.string += (this.string ? " " : "") + ref;
    this.dom.classList.add(ref);
    return this;
  }
  remove(ref) {
    if (!this.contains(ref)) {
      return this;
    }
    ;
    let regex = new RegExp("(^|\\s)" + ref + "(?=\\s|$)", "g");
    this.string = this.string.replace(regex, "");
    this.dom.classList.remove(ref);
    return this;
  }
  toggle(ref, bool) {
    if (bool === void 0) {
      bool = !this.contains(ref);
    }
    ;
    return bool ? this.add(ref) : this.remove(ref);
  }
  incr(ref, duration = 0) {
    var self = this;
    let m = this.stacks;
    let c = m[ref] || 0;
    if (c < 1) {
      this.add(ref);
    }
    ;
    if (duration > 0) {
      setTimeout(function() {
        return self.decr(ref);
      }, duration);
    }
    ;
    return m[ref] = Math.max(c, 0) + 1;
  }
  decr(ref) {
    let m = this.stacks;
    let c = m[ref] || 0;
    if (c == 1) {
      this.remove(ref);
    }
    ;
    return m[ref] = Math.max(c, 1) - 1;
  }
  reconcile(sym, str) {
    let syms = this[$symbols$];
    let vals = this[$batches$];
    let dirty = true;
    if (!syms) {
      syms = this[$symbols$] = [sym];
      vals = this[$batches$] = [str || ""];
      this.toString = this.valueOf = this[$toStringDeopt$];
    } else {
      let idx = syms.indexOf(sym);
      let val = str || "";
      if (idx == -1) {
        syms.push(sym);
        vals.push(val);
      } else if (vals[idx] != val) {
        vals[idx] = val;
      } else {
        dirty = false;
      }
      ;
    }
    ;
    if (dirty) {
      this[$extras$] = " " + vals.join(" ");
      this.sync();
    }
    ;
    return;
  }
  valueOf() {
    return this.string;
  }
  toString() {
    return this.string;
  }
  [$toStringDeopt$]() {
    return this.string + (this[$extras$] || "");
  }
  sync() {
    return this.dom.flagSync$();
  }
  get stacks() {
    return this[$stacks$] || (this[$stacks$] = {});
  }
};

// node_modules/imba/src/imba/dom/context.imba
var $__init__$2 = Symbol.for("#__init__");
var $__patch__$2 = Symbol.for("#__patch__");
var $__initor__$4 = Symbol.for("#__initor__");
var $__inited__$4 = Symbol.for("#__inited__");
var $__hooks__$4 = Symbol.for("#__hooks__");
var $getRenderContext$ = Symbol.for("#getRenderContext");
var $getDynamicContext$ = Symbol.for("#getDynamicContext");
var $1 = Symbol();
var renderContext = {
  context: null
};
var Renderer = class {
  [$__patch__$2]($$ = {}) {
    var $2;
    ($2 = $$.stack) !== void 0 && (this.stack = $2);
  }
  constructor($$ = null) {
    this[$__init__$2]($$);
  }
  [$__init__$2]($$ = null, deep = true) {
    var $32;
    this.stack = $$ && ($32 = $$.stack) !== void 0 ? $32 : [];
  }
  push(el) {
    return this.stack.push(el);
  }
  pop(el) {
    return this.stack.pop();
  }
};
var renderer = new Renderer();
var RenderContext = class extends Map {
  static [$__init__$2]() {
    this.prototype[$__initor__$4] = $1;
    return this;
  }
  constructor(parent, sym = null) {
    super();
    this._ = parent;
    this.sym = sym;
    this[$__initor__$4] === $1 && (this[$__hooks__$4] && this[$__hooks__$4].inited(this), this[$__inited__$4] && this[$__inited__$4]());
  }
  pop() {
    return renderContext.context = null;
  }
  [$getRenderContext$](sym) {
    let out = this.get(sym);
    out || this.set(sym, out = new RenderContext(this._, sym));
    return renderContext.context = out;
  }
  [$getDynamicContext$](sym, key) {
    return this[$getRenderContext$](sym)[$getRenderContext$](key);
  }
  run(value2) {
    this.value = value2;
    if (renderContext.context == this) {
      renderContext.context = null;
    }
    ;
    return this.get(value2);
  }
  cache(val) {
    this.set(this.value, val);
    return val;
  }
};
RenderContext[$__init__$2]();
function createRenderContext(cache, key = Symbol(), up = cache) {
  return renderContext.context = cache[key] || (cache[key] = new RenderContext(up, key));
}
function getRenderContext() {
  let ctx = renderContext.context;
  let res = ctx || new RenderContext(null);
  if (true) {
    if (!ctx && renderer.stack.length > 0) {
      console.warn("detected unmemoized nodes in", renderer.stack, "see https://imba.io", res);
    }
    ;
  }
  ;
  if (ctx) {
    renderContext.context = null;
  }
  ;
  return res;
}

// node_modules/imba/src/imba/dom/core.web.imba
function extend$__(target, ext) {
  const descriptors = Object.getOwnPropertyDescriptors(ext);
  delete descriptors.constructor;
  Object.defineProperties(target, descriptors);
  return target;
}
function iter$__2(a) {
  let v;
  return a ? (v = a.toIterable) ? v.call(a) : a : a;
}
var $parent$ = Symbol.for("#parent");
var $closestNode$ = Symbol.for("#closestNode");
var $parentNode$ = Symbol.for("#parentNode");
var $context$ = Symbol.for("#context");
var $__init__$3 = Symbol.for("#__init__");
var $$inited$ = Symbol.for("##inited");
var $getRenderContext$2 = Symbol.for("#getRenderContext");
var $getDynamicContext$2 = Symbol.for("#getDynamicContext");
var $insertChild$ = Symbol.for("#insertChild");
var $appendChild$ = Symbol.for("#appendChild");
var $replaceChild$ = Symbol.for("#replaceChild");
var $removeChild$ = Symbol.for("#removeChild");
var $insertInto$ = Symbol.for("#insertInto");
var $insertIntoDeopt$ = Symbol.for("#insertIntoDeopt");
var $removeFrom$ = Symbol.for("#removeFrom");
var $removeFromDeopt$ = Symbol.for("#removeFromDeopt");
var $replaceWith$ = Symbol.for("#replaceWith");
var $replaceWithDeopt$ = Symbol.for("#replaceWithDeopt");
var $placeholderNode$ = Symbol.for("#placeholderNode");
var $attachToParent$ = Symbol.for("#attachToParent");
var $detachFromParent$ = Symbol.for("#detachFromParent");
var $placeChild$ = Symbol.for("#placeChild");
var $beforeReconcile$ = Symbol.for("#beforeReconcile");
var $afterReconcile$ = Symbol.for("#afterReconcile");
var $afterVisit$ = Symbol.for("#afterVisit");
var $visitContext$ = Symbol.for("#visitContext");
var $$parent$ = Symbol.for("##parent");
var $$up$ = Symbol.for("##up");
var $$context$ = Symbol.for("##context");
var $domNode$ = Symbol.for("#domNode");
var $$placeholderNode$ = Symbol.for("##placeholderNode");
var $domDeopt$ = Symbol.for("#domDeopt");
var $$visitContext$ = Symbol.for("##visitContext");
var $isRichElement$ = Symbol.for("#isRichElement");
var $src$ = Symbol.for("#src");
var $htmlNodeName$ = Symbol.for("#htmlNodeName");
var $getSlot$ = Symbol.for("#getSlot");
var $ImbaElement$ = Symbol.for("#ImbaElement");
var $cssns$ = Symbol.for("#cssns");
var $cssid$ = Symbol.for("#cssid");
var {
  Event,
  UIEvent,
  MouseEvent,
  PointerEvent,
  KeyboardEvent,
  CustomEvent,
  Node,
  Comment,
  Text,
  Element,
  HTMLElement,
  HTMLHtmlElement,
  HTMLSelectElement,
  HTMLInputElement,
  HTMLTextAreaElement,
  HTMLButtonElement,
  HTMLOptionElement,
  HTMLScriptElement,
  SVGElement,
  DocumentFragment,
  ShadowRoot,
  Document,
  Window,
  customElements
} = globalThis.window;
var descriptorCache = {};
function getDescriptor(item, key, cache) {
  if (!item) {
    return cache[key] = null;
  }
  ;
  if (cache[key] !== void 0) {
    return cache[key];
  }
  ;
  let desc = Object.getOwnPropertyDescriptor(item, key);
  if (desc !== void 0 || item == SVGElement) {
    return cache[key] = desc || null;
  }
  ;
  return getDescriptor(Reflect.getPrototypeOf(item), key, cache);
}
var CustomTagConstructors = {};
var CustomTagToElementNames = {};
var TYPES = {};
var CUSTOM_TYPES = {};
var contextHandler = {
  get(target, name) {
    let ctx = target;
    let val = void 0;
    while (ctx && val == void 0) {
      if (ctx = ctx[$parent$]) {
        val = ctx[name];
      }
      ;
    }
    ;
    return val;
  },
  set(target, name, value2) {
    let ctx = target;
    let val = void 0;
    while (ctx && val == void 0) {
      let desc = getDeepPropertyDescriptor(ctx, name, Element);
      if (desc) {
        ctx[name] = value2;
        return true;
      } else {
        ctx = ctx[$parent$];
      }
      ;
    }
    ;
    return true;
  }
};
var \u03A9Document\u03A91 = class {
  get flags() {
    return this.documentElement.flags;
  }
};
extend$__(Document.prototype, \u03A9Document\u03A91.prototype);
var \u03A9Node\u03A92 = class {
  get [$parent$]() {
    return this[$$parent$] || this.parentNode || this[$$up$];
  }
  get [$closestNode$]() {
    return this;
  }
  get [$parentNode$]() {
    return this[$parent$][$closestNode$];
  }
  get [$context$]() {
    return this[$$context$] || (this[$$context$] = new Proxy(this, contextHandler));
  }
  [$__init__$3]() {
    return this;
  }
  [$$inited$]() {
    return this;
  }
  [$getRenderContext$2](sym) {
    return createRenderContext(this, sym);
  }
  [$getDynamicContext$2](sym, key) {
    return this[$getRenderContext$2](sym)[$getRenderContext$2](key);
  }
  [$insertChild$](newnode, refnode) {
    return newnode[$insertInto$](this, refnode);
  }
  [$appendChild$](newnode) {
    return newnode[$insertInto$](this, null);
  }
  [$replaceChild$](newnode, oldnode) {
    let res = this[$insertChild$](newnode, oldnode);
    this[$removeChild$](oldnode);
    return res;
  }
  [$removeChild$](node) {
    return node[$removeFrom$](this);
  }
  [$insertInto$](parent, before = null) {
    if (before) {
      parent.insertBefore(this, before);
    } else {
      parent.appendChild(this);
    }
    ;
    return this;
  }
  [$insertIntoDeopt$](parent, before) {
    if (before) {
      parent.insertBefore(this[$domNode$] || this, before);
    } else {
      parent.appendChild(this[$domNode$] || this);
    }
    ;
    return this;
  }
  [$removeFrom$](parent) {
    return parent.removeChild(this);
  }
  [$removeFromDeopt$](parent) {
    return parent.removeChild(this[$domNode$] || this);
  }
  [$replaceWith$](other, parent) {
    return parent[$replaceChild$](other, this);
  }
  [$replaceWithDeopt$](other, parent) {
    return parent[$replaceChild$](other, this[$domNode$] || this);
  }
  get [$placeholderNode$]() {
    return this[$$placeholderNode$] || (this[$$placeholderNode$] = globalThis.document.createComment("placeholder"));
  }
  set [$placeholderNode$](value2) {
    let prev = this[$$placeholderNode$];
    this[$$placeholderNode$] = value2;
    if (prev && prev != value2 && prev.parentNode) {
      prev[$replaceWith$](value2);
    }
    ;
  }
  [$attachToParent$]() {
    let ph = this[$domNode$];
    let par = ph && ph.parentNode;
    if (ph && par && ph != this) {
      this[$domNode$] = null;
      this[$insertInto$](par, ph);
      ph[$removeFrom$](par);
    }
    ;
    return this;
  }
  [$detachFromParent$]() {
    if (this[$domDeopt$] != true ? (this[$domDeopt$] = true, true) : false) {
      this[$replaceWith$] = this[$replaceWithDeopt$];
      this[$removeFrom$] = this[$removeFromDeopt$];
      this[$insertInto$] = this[$insertIntoDeopt$];
      this[$$up$] || (this[$$up$] = this[$parent$]);
    }
    ;
    let ph = this[$placeholderNode$];
    if (this.parentNode && ph != this) {
      ph[$insertInto$](this.parentNode, this);
      this[$removeFrom$](this.parentNode);
    }
    ;
    this[$domNode$] = ph;
    return this;
  }
  [$placeChild$](item, f, prev) {
    let type = typeof item;
    if (type === "undefined" || item === null) {
      if (prev && prev instanceof Comment) {
        return prev;
      }
      ;
      let el = globalThis.document.createComment("");
      return prev ? prev[$replaceWith$](el, this) : el[$insertInto$](this, null);
    }
    ;
    if (item === prev) {
      return item;
    } else if (type !== "object") {
      let res;
      let txt = item;
      if (f & 128 && f & 256 && false) {
        this.textContent = txt;
        return;
      }
      ;
      if (prev) {
        if (prev instanceof Text) {
          prev.textContent = txt;
          return prev;
        } else {
          res = globalThis.document.createTextNode(txt);
          prev[$replaceWith$](res, this);
          return res;
        }
        ;
      } else {
        this.appendChild(res = globalThis.document.createTextNode(txt));
        return res;
      }
      ;
    } else {
      if (true) {
        if (!item[$insertInto$]) {
          console.warn("Tried to insert", item, "into", this);
          throw new TypeError("Only DOM Nodes can be inserted into DOM");
        }
        ;
      }
      ;
      return prev ? prev[$replaceWith$](item, this) : item[$insertInto$](this, null);
    }
    ;
    return;
  }
};
extend$__(Node.prototype, \u03A9Node\u03A92.prototype);
var \u03A9Element\u03A93 = class {
  log(...params) {
    console.log(...params);
    return this;
  }
  emit(name, detail, o = {bubbles: true, cancelable: true}) {
    if (detail != void 0) {
      o.detail = detail;
    }
    ;
    let event = new CustomEvent(name, o);
    let res = this.dispatchEvent(event);
    return event;
  }
  text$(item) {
    this.textContent = item;
    return this;
  }
  [$beforeReconcile$]() {
    return this;
  }
  [$afterReconcile$]() {
    return this;
  }
  [$afterVisit$]() {
    if (this.render) {
      this.render();
    }
    ;
    if (this[$$visitContext$]) {
      this[$$visitContext$] = null;
    }
    ;
    return;
  }
  get [$visitContext$]() {
    return this[$$visitContext$] || (this[$$visitContext$] = {});
  }
  get flags() {
    if (!this.$flags) {
      this.$flags = new Flags(this);
      if (this.flag$ == Element.prototype.flag$) {
        this.flags$ext = this.className;
      }
      ;
      this.flagDeopt$();
    }
    ;
    return this.$flags;
  }
  flag$(str) {
    let ns = this.flags$ns;
    this.className = ns ? ns + (this.flags$ext = str) : this.flags$ext = str;
    return;
  }
  flagDeopt$() {
    var self = this;
    this.flag$ = this.flagExt$;
    this.flagSelf$ = function(str) {
      return self.flagSync$(self.flags$own = str);
    };
    return;
  }
  flagExt$(str) {
    return this.flagSync$(this.flags$ext = str);
  }
  flagSelf$(str) {
    this.flagDeopt$();
    return this.flagSelf$(str);
  }
  flagSync$() {
    return this.className = (this.flags$ns || "") + (this.flags$ext || "") + " " + (this.flags$own || "") + " " + (this.$flags || "");
  }
  set$(key, value2) {
    let desc = getDeepPropertyDescriptor(this, key, Element);
    if (!desc || !desc.set) {
      this.setAttribute(key, value2);
    } else {
      this[key] = value2;
    }
    ;
    return;
  }
  get richValue() {
    return this.value;
  }
  set richValue(value2) {
    this.value = value2;
  }
};
extend$__(Element.prototype, \u03A9Element\u03A93.prototype);
Element.prototype.setns$ = Element.prototype.setAttributeNS;
Element.prototype[$isRichElement$] = true;
function createElement(name, parent, flags, text) {
  let el = globalThis.document.createElement(name);
  if (flags) {
    el.className = flags;
  }
  ;
  if (text !== null) {
    el.text$(text);
  }
  ;
  if (parent && parent[$appendChild$]) {
    parent[$appendChild$](el);
  }
  ;
  return el;
}
var \u03A9SVGElement\u03A94 = class {
  set$(key, value2) {
    var $12;
    let cache = descriptorCache[$12 = this.nodeName] || (descriptorCache[$12] = {});
    let desc = getDescriptor(this, key, cache);
    if (!desc || !desc.set) {
      this.setAttribute(key, value2);
    } else {
      this[key] = value2;
    }
    ;
    return;
  }
  flag$(str) {
    let ns = this.flags$ns;
    this.setAttribute("class", ns ? ns + (this.flags$ext = str) : this.flags$ext = str);
    return;
  }
  flagSelf$(str) {
    var self = this;
    this.flag$ = function(str2) {
      return self.flagSync$(self.flags$ext = str2);
    };
    this.flagSelf$ = function(str2) {
      return self.flagSync$(self.flags$own = str2);
    };
    return this.flagSelf$(str);
  }
  flagSync$() {
    return this.setAttribute("class", (this.flags$ns || "") + (this.flags$ext || "") + " " + (this.flags$own || "") + " " + (this.$flags || ""));
  }
};
extend$__(SVGElement.prototype, \u03A9SVGElement\u03A94.prototype);
var \u03A9SVGSVGElement\u03A95 = class {
  set src(value2) {
    if (this[$src$] != value2 ? (this[$src$] = value2, true) : false) {
      if (value2) {
        if (value2.adoptNode) {
          value2.adoptNode(this);
        } else if (value2.content) {
          for (let $4 = value2.attributes, $2 = 0, $32 = Object.keys($4), $5 = $32.length, k, v; $2 < $5; $2++) {
            k = $32[$2];
            v = $4[k];
            this.setAttribute(k, v);
          }
          ;
          this.innerHTML = value2.content;
        }
        ;
      }
      ;
    }
    ;
    return;
  }
};
extend$__(SVGSVGElement.prototype, \u03A9SVGSVGElement\u03A95.prototype);
var navigator = globalThis.navigator;
var vendor = navigator && navigator.vendor || "";
var ua = navigator && navigator.userAgent || "";
var isSafari = vendor.indexOf("Apple") > -1 || ua.indexOf("CriOS") >= 0 || ua.indexOf("FxiOS") >= 0;
var supportsCustomizedBuiltInElements = !isSafari;
var CustomDescriptorCache = new Map();
var CustomHook = class extends HTMLElement {
  connectedCallback() {
    if (supportsCustomizedBuiltInElements) {
      return this.parentNode.removeChild(this);
    } else {
      return this.parentNode.connectedCallback();
    }
    ;
  }
  disconnectedCallback() {
    if (!supportsCustomizedBuiltInElements) {
      return this.parentNode.disconnectedCallback();
    }
    ;
  }
};
window.customElements.define("i-hook", CustomHook);
function getCustomDescriptors(el, klass) {
  let props = CustomDescriptorCache.get(klass);
  if (!props) {
    props = {};
    let proto = klass.prototype;
    let protos = [proto];
    while (proto = proto && Object.getPrototypeOf(proto)) {
      if (proto.constructor == el.constructor) {
        break;
      }
      ;
      protos.unshift(proto);
    }
    ;
    for (let $6 = 0, $72 = iter$__2(protos), $8 = $72.length; $6 < $8; $6++) {
      let item = $72[$6];
      let desc = Object.getOwnPropertyDescriptors(item);
      Object.assign(props, desc);
    }
    ;
    CustomDescriptorCache.set(klass, props);
  }
  ;
  return props;
}
function createComponent(name, parent, flags, text, ctx) {
  let el;
  if (typeof name != "string") {
    if (name && name.nodeName) {
      name = name.nodeName;
    }
    ;
  }
  ;
  let cmpname = CustomTagToElementNames[name] || name;
  if (CustomTagConstructors[name]) {
    let cls = CustomTagConstructors[name];
    let typ = cls.prototype[$htmlNodeName$];
    if (typ && supportsCustomizedBuiltInElements) {
      el = globalThis.document.createElement(typ, {is: name});
    } else if (cls.create$ && typ) {
      el = globalThis.document.createElement(typ);
      el.setAttribute("is", cmpname);
      let props = getCustomDescriptors(el, cls);
      Object.defineProperties(el, props);
      el.__slots = {};
      el.appendChild(globalThis.document.createElement("i-hook"));
    } else if (cls.create$) {
      el = cls.create$(el);
      el.__slots = {};
    } else {
      console.warn("could not create tag " + name);
    }
    ;
  } else {
    el = globalThis.document.createElement(CustomTagToElementNames[name] || name);
  }
  ;
  el[$$parent$] = parent;
  el[$__init__$3]();
  el[$$inited$]();
  if (text !== null) {
    el[$getSlot$]("__").text$(text);
  }
  ;
  if (flags || el.flags$ns) {
    el.flag$(flags || "");
  }
  ;
  return el;
}
function defineTag(name, klass, options = {}) {
  TYPES[name] = CUSTOM_TYPES[name] = klass;
  klass.nodeName = name;
  let componentName = name;
  let proto = klass.prototype;
  if (name.indexOf("-") == -1) {
    componentName = "" + name + "-tag";
    CustomTagToElementNames[name] = componentName;
  }
  ;
  if (options.cssns) {
    let ns = (proto._ns_ || proto[$cssns$] || "") + " " + (options.cssns || "");
    proto._ns_ = ns.trim() + " ";
    proto[$cssns$] = options.cssns;
  }
  ;
  if (options.cssid) {
    let ids = (proto.flags$ns || "") + " " + options.cssid;
    proto[$cssid$] = options.cssid;
    proto.flags$ns = ids.trim() + " ";
  }
  ;
  if (proto[$htmlNodeName$] && !options.extends) {
    options.extends = proto[$htmlNodeName$];
  }
  ;
  if (options.extends) {
    proto[$htmlNodeName$] = options.extends;
    CustomTagConstructors[name] = klass;
    if (supportsCustomizedBuiltInElements) {
      window.customElements.define(componentName, klass, {extends: options.extends});
    }
    ;
  } else {
    window.customElements.define(componentName, klass);
  }
  ;
  return klass;
}
var instance2 = globalThis.imba || (globalThis.imba = {});
instance2.document = globalThis.document;

// node_modules/imba/src/imba/dom/component.imba
var $__init__$4 = Symbol.for("#__init__");
var $__patch__$3 = Symbol.for("#__patch__");
var $$inited$2 = Symbol.for("##inited");
var $afterVisit$2 = Symbol.for("#afterVisit");
var $beforeReconcile$2 = Symbol.for("#beforeReconcile");
var $afterReconcile$2 = Symbol.for("#afterReconcile");
var $__hooks__$5 = Symbol.for("#__hooks__");
var $autorender$ = Symbol.for("#autorender");
var $$visitContext$2 = Symbol.for("##visitContext");
var hydrator = new class {
  [$__patch__$3]($$ = {}) {
    var $12;
    ($12 = $$.items) !== void 0 && (this.items = $12);
    ($12 = $$.current) !== void 0 && (this.current = $12);
    ($12 = $$.lastQueued) !== void 0 && (this.lastQueued = $12);
    ($12 = $$.tests) !== void 0 && (this.tests = $12);
  }
  constructor($$ = null) {
    this[$__init__$4]($$);
  }
  [$__init__$4]($$ = null, deep = true) {
    var $2;
    this.items = $$ && ($2 = $$.items) !== void 0 ? $2 : [];
    this.current = $$ && ($2 = $$.current) !== void 0 ? $2 : null;
    this.lastQueued = $$ && ($2 = $$.lastQueued) !== void 0 ? $2 : null;
    this.tests = $$ && ($2 = $$.tests) !== void 0 ? $2 : 0;
  }
  flush() {
    let item = null;
    while (item = this.items.shift()) {
      if (!item.parentNode || item.hydrated\u03A6) {
        continue;
      }
      ;
      let prev = this.current;
      this.current = item;
      item.__F |= 1024;
      item.connectedCallback();
      this.current = prev;
    }
    ;
    return;
  }
  queue(item) {
    var self = this;
    let len = this.items.length;
    let idx = 0;
    let prev = this.lastQueued;
    this.lastQueued = item;
    let BEFORE = Node.DOCUMENT_POSITION_PRECEDING;
    let AFTER = Node.DOCUMENT_POSITION_FOLLOWING;
    if (len) {
      let prevIndex = this.items.indexOf(prev);
      let index = prevIndex;
      let compare = function(a, b) {
        self.tests++;
        return a.compareDocumentPosition(b);
      };
      if (prevIndex == -1 || prev.nodeName != item.nodeName) {
        index = prevIndex = 0;
      }
      ;
      let curr = this.items[index];
      while (curr && compare(curr, item) & AFTER) {
        curr = this.items[++index];
      }
      ;
      if (index != prevIndex) {
        curr ? this.items.splice(index, 0, item) : this.items.push(item);
      } else {
        while (curr && compare(curr, item) & BEFORE) {
          curr = this.items[--index];
        }
        ;
        if (index != prevIndex) {
          curr ? this.items.splice(index + 1, 0, item) : this.items.unshift(item);
        }
        ;
      }
      ;
    } else {
      this.items.push(item);
      if (!this.current) {
        globalThis.queueMicrotask(this.flush.bind(this));
      }
      ;
    }
    ;
    return;
  }
}();
var Component = class extends HTMLElement {
  constructor() {
    super();
    if (this.flags$ns) {
      this.flag$ = this.flagExt$;
    }
    ;
    this.setup$();
    this.build();
  }
  setup$() {
    this.__slots = {};
    return this.__F = 0;
  }
  [$__init__$4]() {
    this.__F |= 1 | 2;
    return this;
  }
  [$$inited$2]() {
    if (this[$__hooks__$5]) {
      return this[$__hooks__$5].inited(this);
    }
    ;
  }
  flag$(str) {
    this.className = this.flags$ext = str;
    return;
  }
  build() {
    return this;
  }
  awaken() {
    return this;
  }
  mount() {
    return this;
  }
  unmount() {
    return this;
  }
  rendered() {
    return this;
  }
  dehydrate() {
    return this;
  }
  hydrate() {
    this.autoschedule = true;
    return this;
  }
  tick() {
    return this.commit();
  }
  visit() {
    return this.commit();
  }
  commit() {
    if (!this.render\u03A6) {
      this.__F |= 8192;
      return this;
    }
    ;
    this.__F |= 256;
    this.render && this.render();
    this.rendered();
    return this.__F = (this.__F | 512) & ~256 & ~8192;
  }
  get autoschedule() {
    return (this.__F & 64) != 0;
  }
  set autoschedule(value2) {
    value2 ? this.__F |= 64 : this.__F &= ~64;
  }
  set autorender(value2) {
    let o = this[$autorender$] || (this[$autorender$] = {});
    o.value = value2;
    if (this.mounted\u03A6) {
      scheduler.schedule(this, o);
    }
    ;
    return;
  }
  get render\u03A6() {
    return !this.suspended\u03A6;
  }
  get mounting\u03A6() {
    return (this.__F & 16) != 0;
  }
  get mounted\u03A6() {
    return (this.__F & 32) != 0;
  }
  get awakened\u03A6() {
    return (this.__F & 8) != 0;
  }
  get rendered\u03A6() {
    return (this.__F & 512) != 0;
  }
  get suspended\u03A6() {
    return (this.__F & 4096) != 0;
  }
  get rendering\u03A6() {
    return (this.__F & 256) != 0;
  }
  get scheduled\u03A6() {
    return (this.__F & 128) != 0;
  }
  get hydrated\u03A6() {
    return (this.__F & 2) != 0;
  }
  get ssr\u03A6() {
    return (this.__F & 1024) != 0;
  }
  schedule() {
    scheduler.on("commit", this);
    this.__F |= 128;
    return this;
  }
  unschedule() {
    scheduler.un("commit", this);
    this.__F &= ~128;
    return this;
  }
  async suspend(cb = null) {
    let val = this.flags.incr("_suspended_");
    this.__F |= 4096;
    if (cb instanceof Function) {
      await cb();
      this.unsuspend();
    }
    ;
    return this;
  }
  unsuspend() {
    let val = this.flags.decr("_suspended_");
    if (val == 0) {
      this.__F &= ~4096;
      this.commit();
      ;
    }
    ;
    return this;
  }
  [$afterVisit$2]() {
    this.visit();
    if (this[$$visitContext$2]) {
      return this[$$visitContext$2] = null;
    }
    ;
  }
  [$beforeReconcile$2]() {
    if (this.__F & 1024) {
      this.__F = this.__F & ~1024;
      this.classList.remove("_ssr_");
      if (this.flags$ext && this.flags$ext.indexOf("_ssr_") == 0) {
        this.flags$ext = this.flags$ext.slice(5);
      }
      ;
      if (!(this.__F & 512)) {
        this.innerHTML = "";
      }
      ;
    }
    ;
    if (true) {
      renderer.push(this);
    }
    ;
    return this;
  }
  [$afterReconcile$2]() {
    if (true) {
      renderer.pop(this);
    }
    ;
    return this;
  }
  connectedCallback() {
    let flags = this.__F;
    let inited = flags & 1;
    let awakened = flags & 8;
    if (!inited && !(flags & 1024)) {
      hydrator.queue(this);
      return;
    }
    ;
    if (flags & (16 | 32)) {
      return;
    }
    ;
    this.__F |= 16;
    if (!inited) {
      this[$__init__$4]();
    }
    ;
    if (!(flags & 2)) {
      this.flags$ext = this.className;
      this.__F |= 2;
      this.hydrate();
      this.commit();
    }
    ;
    if (!awakened) {
      this.awaken();
      this.__F |= 8;
    }
    ;
    emit(this, "mount");
    let res = this.mount();
    if (res && res.then instanceof Function) {
      res.then(scheduler.commit);
    }
    ;
    flags = this.__F = (this.__F | 32) & ~16;
    if (flags & 64) {
      this.schedule();
    }
    ;
    if (this[$autorender$]) {
      scheduler.schedule(this, this[$autorender$]);
    }
    ;
    return this;
  }
  disconnectedCallback() {
    this.__F = this.__F & (~32 & ~16);
    if (this.__F & 128) {
      this.unschedule();
    }
    ;
    emit(this, "unmount");
    this.unmount();
    if (this[$autorender$]) {
      return scheduler.unschedule(this, this[$autorender$]);
    }
    ;
  }
};

// node_modules/imba/src/imba/dom/mount.imba
var $insertInto$2 = Symbol.for("#insertInto");
var $removeFrom$2 = Symbol.for("#removeFrom");
function mount(mountable, into) {
  if (false) {
  }
  ;
  let parent = into || globalThis.document.body;
  let element = mountable;
  if (mountable instanceof Function) {
    let ctx = new RenderContext(parent, null);
    let tick = function() {
      let prev = renderContext.context;
      renderContext.context = ctx;
      let res = mountable(ctx);
      if (renderContext.context == ctx) {
        renderContext.context = prev;
      }
      ;
      return res;
    };
    element = tick();
    scheduler.listen("commit", tick);
  } else {
    element.__F |= 64;
  }
  ;
  element[$insertInto$2](parent);
  return element;
}
function unmount(el) {
  if (el && el[$removeFrom$2]) {
    el[$removeFrom$2](el.parentNode);
  }
  ;
  return el;
}
var instance3 = globalThis.imba || (globalThis.imba = {});
instance3.mount = mount;
instance3.unmount = unmount;

// node_modules/imba/src/imba/dom/bind.imba
function extend$__2(target, ext) {
  const descriptors = Object.getOwnPropertyDescriptors(ext);
  delete descriptors.constructor;
  Object.defineProperties(target, descriptors);
  return target;
}
function iter$__3(a) {
  let v;
  return a ? (v = a.toIterable) ? v.call(a) : a : a;
}
var $$onchange$ = Symbol.for("##onchange");
var $afterVisit$3 = Symbol.for("#afterVisit");
var $$oninput$ = Symbol.for("##oninput");
var $$onclick$ = Symbol.for("##onclick");
var $$bound$ = Symbol.for("##bound");
var $$visitContext$3 = Symbol.for("##visitContext");
function use_dom_bind() {
  return true;
}
var toBind = {
  INPUT: true,
  SELECT: true,
  TEXTAREA: true,
  BUTTON: true
};
var isGroup = function(obj) {
  return obj instanceof Array || obj && obj.has instanceof Function;
};
var bindHas = function(object, value2) {
  if (object == value2) {
    return true;
  } else if (object instanceof Array) {
    return object.indexOf(value2) >= 0;
  } else if (object && object.has instanceof Function) {
    return object.has(value2);
  } else if (object && object.contains instanceof Function) {
    return object.contains(value2);
  } else {
    return false;
  }
  ;
};
var bindAdd = function(object, value2) {
  if (object instanceof Array) {
    return object.push(value2);
  } else if (object && object.add instanceof Function) {
    return object.add(value2);
  }
  ;
};
var bindRemove = function(object, value2) {
  if (object instanceof Array) {
    let idx = object.indexOf(value2);
    if (idx >= 0) {
      return object.splice(idx, 1);
    }
    ;
  } else if (object && object.delete instanceof Function) {
    return object.delete(value2);
  }
  ;
};
function createProxyProperty(target) {
  function getter() {
    return target[0] ? target[0][target[1]] : void 0;
  }
  ;
  function setter(v) {
    return target[0] ? target[0][target[1]] = v : null;
  }
  ;
  return {
    get: getter,
    set: setter
  };
}
var \u03A9Element\u03A91 = class {
  getRichValue() {
    return this.value;
  }
  setRichValue(value2) {
    return this.value = value2;
  }
  bind$(key, value2) {
    let o = value2 || [];
    if (key == "data" && !this[$$bound$] && toBind[this.nodeName]) {
      this[$$bound$] = true;
      if (this[$$onchange$]) {
        this.addEventListener("change", this[$$onchange$] = this[$$onchange$].bind(this));
      }
      ;
      if (this[$$oninput$]) {
        this.addEventListener("input", this[$$oninput$] = this[$$oninput$].bind(this), {capture: true});
      }
      ;
      if (this[$$onclick$]) {
        this.addEventListener("click", this[$$onclick$] = this[$$onclick$].bind(this), {capture: true});
      }
      ;
    }
    ;
    Object.defineProperty(this, key, o instanceof Array ? createProxyProperty(o) : o);
    return o;
  }
};
extend$__2(Element.prototype, \u03A9Element\u03A91.prototype);
Object.defineProperty(Element.prototype, "richValue", {
  get: function() {
    return this.getRichValue();
  },
  set: function(v) {
    return this.setRichValue(v);
  }
});
var \u03A9HTMLSelectElement\u03A92 = class {
  [$$onchange$](e) {
    let model = this.data;
    let prev = this.$$value;
    this.$$value = void 0;
    let values = this.getRichValue();
    if (this.multiple) {
      if (prev) {
        for (let $12 = 0, $2 = iter$__3(prev), $32 = $2.length; $12 < $32; $12++) {
          let value2 = $2[$12];
          if (values.indexOf(value2) != -1) {
            continue;
          }
          ;
          bindRemove(model, value2);
        }
        ;
      }
      ;
      for (let $4 = 0, $5 = iter$__3(values), $6 = $5.length; $4 < $6; $4++) {
        let value2 = $5[$4];
        if (!prev || prev.indexOf(value2) == -1) {
          bindAdd(model, value2);
        }
        ;
      }
      ;
    } else {
      this.data = values[0];
    }
    ;
    commit();
    return this;
  }
  getRichValue() {
    var $72;
    if (this.$$value) {
      return this.$$value;
    }
    ;
    $72 = [];
    for (let $8 = 0, $94 = iter$__3(this.selectedOptions), $1010 = $94.length; $8 < $1010; $8++) {
      let o = $94[$8];
      $72.push(o.richValue);
    }
    ;
    return this.$$value = $72;
  }
  syncValue() {
    let model = this.data;
    if (this.multiple) {
      let vals = [];
      for (let i = 0, $11 = iter$__3(this.options), $12 = $11.length; i < $12; i++) {
        let option = $11[i];
        let val = option.richValue;
        let sel = bindHas(model, val);
        option.selected = sel;
        if (sel) {
          vals.push(val);
        }
        ;
      }
      ;
      this.$$value = vals;
    } else {
      for (let i = 0, $132 = iter$__3(this.options), $14 = $132.length; i < $14; i++) {
        let option = $132[i];
        let val = option.richValue;
        if (val == model) {
          this.$$value = [val];
          this.selectedIndex = i;
          break;
        }
        ;
      }
      ;
    }
    ;
    return;
  }
  [$afterVisit$3]() {
    this.syncValue();
    if (this[$$visitContext$3]) {
      return this[$$visitContext$3] = null;
    }
    ;
  }
};
extend$__2(HTMLSelectElement.prototype, \u03A9HTMLSelectElement\u03A92.prototype);
var \u03A9HTMLOptionElement\u03A93 = class {
  setRichValue(value2) {
    this.$$value = value2;
    return this.value = value2;
  }
  getRichValue() {
    if (this.$$value !== void 0) {
      return this.$$value;
    }
    ;
    return this.value;
  }
};
extend$__2(HTMLOptionElement.prototype, \u03A9HTMLOptionElement\u03A93.prototype);
var \u03A9HTMLTextAreaElement\u03A94 = class {
  setRichValue(value2) {
    this.$$value = value2;
    return this.value = value2;
  }
  getRichValue() {
    if (this.$$value !== void 0) {
      return this.$$value;
    }
    ;
    return this.value;
  }
  [$$oninput$](e) {
    this.data = this.value;
    return commit();
  }
  [$afterVisit$3]() {
    let val = this.data;
    if (val === null || val === void 0) {
      val = "";
    }
    ;
    if (this[$$bound$] && this.value != val) {
      this.value = val;
    }
    ;
    if (this[$$visitContext$3]) {
      return this[$$visitContext$3] = null;
    }
    ;
  }
};
extend$__2(HTMLTextAreaElement.prototype, \u03A9HTMLTextAreaElement\u03A94.prototype);
var \u03A9HTMLInputElement\u03A95 = class {
  [$$oninput$](e) {
    let typ = this.type;
    if (typ == "checkbox" || typ == "radio") {
      return;
    }
    ;
    this.$$value = void 0;
    this.data = this.richValue;
    return commit();
  }
  [$$onchange$](e) {
    let model = this.data;
    let val = this.richValue;
    if (this.type == "checkbox" || this.type == "radio") {
      let checked = this.checked;
      if (isGroup(model)) {
        checked ? bindAdd(model, val) : bindRemove(model, val);
      } else {
        this.data = checked ? val : false;
      }
      ;
    }
    ;
    return commit();
  }
  setRichValue(value2) {
    if (this.$$value !== value2) {
      this.$$value = value2;
      if (this.value !== value2) {
        this.value = value2;
      }
      ;
    }
    ;
    return;
  }
  getRichValue() {
    if (this.$$value !== void 0) {
      return this.$$value;
    }
    ;
    let value2 = this.value;
    let typ = this.type;
    if (typ == "range" || typ == "number") {
      value2 = this.valueAsNumber;
      if (Number.isNaN(value2)) {
        value2 = null;
      }
      ;
    } else if (typ == "checkbox") {
      if (value2 == void 0 || value2 === "on") {
        value2 = true;
      }
      ;
    }
    ;
    return value2;
  }
  [$afterVisit$3]() {
    if (this[$$bound$]) {
      let typ = this.type;
      if (typ == "checkbox" || typ == "radio") {
        let val = this.data;
        if (val === true || val === false || val == null) {
          this.checked = !!val;
        } else {
          this.checked = bindHas(val, this.richValue);
        }
        ;
      } else {
        this.richValue = this.data;
      }
      ;
    }
    ;
    if (this[$$visitContext$3]) {
      this[$$visitContext$3] = null;
    }
    ;
    return;
  }
};
extend$__2(HTMLInputElement.prototype, \u03A9HTMLInputElement\u03A95.prototype);
var \u03A9HTMLButtonElement\u03A96 = class {
  get checked() {
    return this.$checked;
  }
  set checked(val) {
    if (val != this.$checked) {
      this.$checked = val;
      this.flags.toggle("checked", !!val);
    }
    ;
  }
  setRichValue(value2) {
    this.$$value = value2;
    return this.value = value2;
  }
  getRichValue() {
    if (this.$$value !== void 0) {
      return this.$$value;
    }
    ;
    return this.value;
  }
  [$$onclick$](e) {
    let data = this.data;
    let toggled = this.checked;
    let val = this.richValue;
    if (isGroup(data)) {
      toggled ? bindRemove(data, val) : bindAdd(data, val);
    } else if (this.$$value == void 0) {
      this.data = toggled ? false : true;
    } else {
      this.data = toggled ? null : val;
    }
    ;
    this[$afterVisit$3]();
    return commit();
  }
  [$afterVisit$3]() {
    if (this[$$bound$]) {
      let data = this.data;
      let val = this.$$value == void 0 ? true : this.$$value;
      if (isGroup(data)) {
        this.checked = bindHas(data, val);
      } else {
        this.checked = data == val;
      }
      ;
    }
    ;
    if (this[$$visitContext$3]) {
      this[$$visitContext$3] = null;
    }
    ;
    return;
  }
};
extend$__2(HTMLButtonElement.prototype, \u03A9HTMLButtonElement\u03A96.prototype);

// app/client.imba
var $3 = Symbol();
var $7 = Symbol();
var $9 = Symbol();
var $10 = Symbol();
var $13 = Symbol();
var $15 = Symbol();
var $16 = Symbol();
var $17 = Symbol();
var $19 = Symbol();
var $21 = Symbol();
var $22 = Symbol();
var $26 = Symbol();
var $28 = Symbol();
var $31 = Symbol();
var $34 = Symbol();
var $37 = Symbol();
var $44 = Symbol();
var $46 = Symbol();
var $47 = Symbol();
var $51 = Symbol();
var $53 = Symbol();
var $54 = Symbol();
var $55 = Symbol();
var $58 = Symbol();
var $60 = Symbol();
var $61 = Symbol();
var $62 = Symbol();
var $63 = Symbol();
var $64 = Symbol();
var $65 = Symbol();
var $66 = Symbol();
var $67 = Symbol();
var $68 = Symbol();
var $71 = Symbol();
var $73 = Symbol();
var $74 = Symbol();
var $75 = Symbol();
var $76 = Symbol();
var $77 = Symbol();
var $78 = Symbol();
var $79 = Symbol();
var $80 = Symbol();
var $81 = Symbol();
var $83 = Symbol();
var $85 = Symbol();
var $86 = Symbol();
var $87 = Symbol();
var $88 = Symbol();
var $89 = Symbol();
var $90 = Symbol();
var $91 = Symbol();
var $92 = Symbol();
var $93 = Symbol();
var $95 = Symbol();
var $97 = Symbol();
var $98 = Symbol();
var $99 = Symbol();
var $100 = Symbol();
var $101 = Symbol();
var $102 = Symbol();
var $103 = Symbol();
var $104 = Symbol();
var $105 = Symbol();
var $106;
var $107 = getRenderContext();
var $108 = Symbol();
var $109;
var $110;
var $$up$2 = Symbol.for("##up");
var $placeChild$2 = Symbol.for("#placeChild");
var $beforeReconcile$3 = Symbol.for("#beforeReconcile");
var $afterVisit$4 = Symbol.for("#afterVisit");
var $afterReconcile$3 = Symbol.for("#afterReconcile");
use_dom_bind();
var value = 100;
var App = class extends Component {
  round_weight(weight) {
    return Math.round(weight / 2.5) * 2.5;
  }
  get_adjusted_one_rep_max() {
    return value * 0.9;
  }
  get_weight(percentage) {
    let result = this.round_weight((this.get_adjusted_one_rep_max() * percentage - 45) / 2);
    if (result > 0) {
      return result;
    } else {
      return 0;
    }
    ;
  }
  render_cell(percentage, reps) {
    var $12, $2 = getRenderContext(), $4, $5, $6, $8, $11, $122, $14, $18, $20;
    ($4 = $5 = 1, $12 = $2[$3]) || ($4 = $5 = 0, $12 = $2[$3] = $12 = createElement("div", null, "e-af", null));
    $4 || ($12[$$up$2] = $2._);
    ($6 = $12[$7]) || ($12[$7] = $6 = createElement("p", $12, null, null));
    $8 = percentage, $8 === $12[$10] && $4 || ($12[$9] = $6[$placeChild$2]($12[$10] = $8, 384, $12[$9]));
    ;
    $4 || ($11 = createElement("div", $12, null, null));
    ($122 = $12[$13]) || ($12[$13] = $122 = createElement("h1", $11, null, null));
    renderContext.context = $12[$16] || ($12[$16] = {_: $122}), $14 = this.get_weight(percentage), renderContext.context = null, $14 === $12[$17] && $4 || ($12[$15] = $122[$placeChild$2]($12[$17] = $14, 384, $12[$15]));
    ;
    ($18 = $12[$19]) || ($12[$19] = $18 = createElement("p", $11, null, null));
    $20 = reps, $20 === $12[$22] && $4 || ($12[$21] = $18[$placeChild$2]($12[$22] = $20, 384, $12[$21]));
    ;
    ;
    return $12;
  }
  render() {
    var $23, $24, $25, $27, $29, $30, $32, $33, $35, $36, $38, $39, $40, $41, $42, $43, $45, $48, $49, $50, $52, $56, $57, $59, $69, $70, $72, $82, $84, $94, $96;
    $23 = this;
    $23[$beforeReconcile$3]();
    ($24 = $25 = 1, $23[$26] === 1) || ($24 = $25 = 0, $23[$26] = 1);
    (!$24 || $25 & 2) && $23.flagSelf$("e-ak");
    ($29 = $30 = 1, $27 = $23[$28]) || ($29 = $30 = 0, $23[$28] = $27 = createElement("input", $23, "e_ak", null));
    $29 || ($27.placeholder = "1RM");
    $29 || $27.bind$("data", {get: function() {
      return value;
    }, set: function(v$) {
      value = v$;
    }});
    $29 || !$27.setup || $27.setup($30);
    $27[$afterVisit$4]($30);
    ;
    $24 || ($32 = createElement("input", $23, "e_ak", null));
    $24 || ($32.placeholder = "Workout Name");
    ;
    ($35 = $36 = 1, $33 = $23[$34]) || ($35 = $36 = 0, $23[$34] = $33 = createElement("input", $23, "e_ak", null));
    $38 = Date().split(" ").slice(0, 4).join(" "), $38 === $23[$37] || ($33.placeholder = $23[$37] = $38);
    ;
    $24 || ($39 = createElement("div", $23, "container e_ak", null));
    $24 || ($40 = createElement("div", $39, "row e_ak", null));
    $24 || ($41 = createElement("div", $40, "e-aq e_ak", null));
    $24 || ($42 = createElement("p", $41, "e_ak", "1RM"));
    ;
    ($43 = $23[$44]) || ($23[$44] = $43 = createElement("h2", $41, "e_ak", null));
    $45 = value, $45 === $23[$47] && $24 || ($23[$46] = $43[$placeChild$2]($23[$47] = $45, 384, $23[$46]));
    ;
    ;
    $24 || ($48 = createElement("div", $40, "e-at e_ak", null));
    $24 || ($49 = createElement("p", $48, "e_ak", "90%"));
    ;
    ($50 = $23[$51]) || ($23[$51] = $50 = createElement("h1", $48, "e_ak", null));
    renderContext.context = $23[$54] || ($23[$54] = {_: $50}), $52 = this.round_weight(this.get_adjusted_one_rep_max()), renderContext.context = null, $52 === $23[$55] && $24 || ($23[$53] = $50[$placeChild$2]($23[$55] = $52, 384, $23[$53]));
    ;
    ;
    ;
    $24 || ($56 = createElement("h1", $39, "e_ak", "Warm Up"));
    ;
    ($57 = $23[$58]) || ($23[$58] = $57 = createElement("div", $39, "row e_ak", null));
    renderContext.context = $23[$61] || ($23[$61] = {_: $57}), $59 = this.render_cell(0.4, "x5"), renderContext.context = null, $59 === $23[$62] && $24 || ($23[$60] = $57[$placeChild$2]($23[$62] = $59, 128, $23[$60]));
    renderContext.context = $23[$64] || ($23[$64] = {_: $57}), $59 = this.render_cell(0.5, "x5"), renderContext.context = null, $59 === $23[$65] && $24 || ($23[$63] = $57[$placeChild$2]($23[$65] = $59, 0, $23[$63]));
    renderContext.context = $23[$67] || ($23[$67] = {_: $57}), $59 = this.render_cell(0.6, "x3"), renderContext.context = null, $59 === $23[$68] && $24 || ($23[$66] = $57[$placeChild$2]($23[$68] = $59, 256, $23[$66]));
    ;
    $24 || ($69 = createElement("h1", $39, "e_ak", "Workout"));
    ;
    ($70 = $23[$71]) || ($23[$71] = $70 = createElement("div", $39, "row e_ak", null));
    renderContext.context = $23[$74] || ($23[$74] = {_: $70}), $72 = this.render_cell(0.65, "x5"), renderContext.context = null, $72 === $23[$75] && $24 || ($23[$73] = $70[$placeChild$2]($23[$75] = $72, 128, $23[$73]));
    renderContext.context = $23[$77] || ($23[$77] = {_: $70}), $72 = this.render_cell(0.75, "x5"), renderContext.context = null, $72 === $23[$78] && $24 || ($23[$76] = $70[$placeChild$2]($23[$78] = $72, 0, $23[$76]));
    renderContext.context = $23[$80] || ($23[$80] = {_: $70}), $72 = this.render_cell(0.85, "x5+"), renderContext.context = null, $72 === $23[$81] && $24 || ($23[$79] = $70[$placeChild$2]($23[$81] = $72, 256, $23[$79]));
    ;
    ($82 = $23[$83]) || ($23[$83] = $82 = createElement("div", $39, "row e_ak", null));
    renderContext.context = $23[$86] || ($23[$86] = {_: $82}), $84 = this.render_cell(0.7, "x3"), renderContext.context = null, $84 === $23[$87] && $24 || ($23[$85] = $82[$placeChild$2]($23[$87] = $84, 128, $23[$85]));
    renderContext.context = $23[$89] || ($23[$89] = {_: $82}), $84 = this.render_cell(0.8, "x3"), renderContext.context = null, $84 === $23[$90] && $24 || ($23[$88] = $82[$placeChild$2]($23[$90] = $84, 0, $23[$88]));
    renderContext.context = $23[$92] || ($23[$92] = {_: $82}), $84 = this.render_cell(0.9, "x3+"), renderContext.context = null, $84 === $23[$93] && $24 || ($23[$91] = $82[$placeChild$2]($23[$93] = $84, 256, $23[$91]));
    ;
    ($94 = $23[$95]) || ($23[$95] = $94 = createElement("div", $39, "row e_ak", null));
    renderContext.context = $23[$98] || ($23[$98] = {_: $94}), $96 = this.render_cell(0.75, "x5"), renderContext.context = null, $96 === $23[$99] && $24 || ($23[$97] = $94[$placeChild$2]($23[$99] = $96, 128, $23[$97]));
    renderContext.context = $23[$101] || ($23[$101] = {_: $94}), $96 = this.render_cell(0.85, "x3"), renderContext.context = null, $96 === $23[$102] && $24 || ($23[$100] = $94[$placeChild$2]($23[$102] = $96, 0, $23[$100]));
    renderContext.context = $23[$104] || ($23[$104] = {_: $94}), $96 = this.render_cell(0.95, "x1+"), renderContext.context = null, $96 === $23[$105] && $24 || ($23[$103] = $94[$placeChild$2]($23[$105] = $96, 256, $23[$103]));
    ;
    ;
    $23[$afterReconcile$3]($25);
    return $23;
  }
};
defineTag("app-e-bc", App, {});
mount((($109 = $110 = 1, $106 = $107[$108]) || ($109 = $110 = 0, $106 = $107[$108] = $106 = createComponent(App, null, null, null)), $109 || ($106[$$up$2] = $107._), $109 || $107.sym || !$106.setup || $106.setup($110), $107.sym || $106[$afterVisit$4]($110), $106));
//__FOOT__
