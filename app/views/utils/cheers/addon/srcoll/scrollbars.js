import CodeMirror from 'codemirror';

const minButtonSize = 10;

class Bar {
  constructor(cls, orientation, scroll) {
    this.orientation = orientation;
    this.scroll = scroll;
    this.screen = 1;
    this.total = 1;
    this.size = 1;
    this.pos = 0;
    this.hideTimer = null;

    this.node = document.createElement('div');
    this.node.className = `${cls}-${orientation}`;
    this.inner = this.node.appendChild(document.createElement('div'));

    this.bindEvents();
  }

  bindEvents() {
    const self = this;
    CodeMirror.on(this.inner, 'mousedown', (e) => {
      if (e.which !== 1) {
        return;
      }
      CodeMirror.e_preventDefault(e);
      const axis = self.orientation === 'horizontal' ? 'pageX' : 'pageY';
      const start = e[axis];
      const startpos = self.pos;
      function done() {
        CodeMirror.off(document, 'mousemove', move); // eslint-disable-line
        CodeMirror.off(document, 'mouseup', done);
      }
      function move(event) {
        if (event.which !== 1) {
          return done();
        }
        self.moveTo(startpos + ((e[axis] - start) * (self.total / self.size)));
      }
      CodeMirror.on(document, 'mousemove', move);
      CodeMirror.on(document, 'mouseup', done);
    });

    CodeMirror.on(this.node, 'click', (e) => {
      CodeMirror.e_preventDefault(e);
      const innerBox = self.inner.getBoundingClientRect();
      let where;
      if (self.orientation === 'horizontal') {
        if (e.clientX < innerBox.left) {
          where = -1;
        } else if (e.clientX > innerBox.right) {
          where = 1;
        } else {
          where = 0;
        }
      } else if (e.clientY < innerBox.top) {
        where = -1;
      } else if (e.clientY > innerBox.bottom) {
        where = 1;
      } else {
        where = 0;
      }
      self.moveTo(self.pos + (where * self.screen));
    });

    function onWheel(e) {
      const moved = CodeMirror.wheelEventPixels(e)[self.orientation === 'horizontal' ? 'x' : 'y'];
      const oldPos = self.pos;
      self.moveTo(self.pos + moved);
      if (self.pos !== oldPos) {
        CodeMirror.e_preventDefault(e);
      }
    }

    CodeMirror.on(this.node, 'mousewheel', onWheel);
    CodeMirror.on(this.node, 'DOMMouseScroll', onWheel);
  }

  setPos(pos, force) {
    let currentPos = pos;
    if (currentPos < 0) {
      currentPos = 0;
    }
    if (pos > this.total - this.screen) {
      currentPos = this.total - this.screen;
    }
    if (!force && currentPos === this.pos) {
      return false;
    }
    this.pos = currentPos;
    this.inner.style[this.orientation === 'horizontal' ? 'left' : 'top'] = `${(currentPos * (this.size / this.total))}px`;
    if (this.show) {
      this.autoHide();
    }
    return true;
  }

  clearHideTimer() {
    if (this.hideTimer) {
      clearTimeout(this.hideTimer);
      this.hideTimer = null;
    }
  }

  show() {
    // Cancel hide
    this.clearHideTimer();
    this.node.classList.add('show');
  }

  hide() {
    this.clearHideTimer();
    this.hideTimer = setTimeout(() => {
      this.node.classList.remove('show');
      clearTimeout(this.hideTimer);
      this.hideTimer = null;
    }, 1000);
  }

  autoHide() {
    if (this.hideTimer) {
      clearTimeout(this.hideTimer);
      this.hideTimer = setTimeout(() => {
      }, 1000);
    }
  }

  moveTo(pos) {
    if (this.setPos(pos)) {
      this.scroll(pos, this.orientation);
    }
  }

  update(scrollSize, clientSize, barSize) {
    const sizeChanged = this.screen !== clientSize
      || this.total !== scrollSize
      || this.size !== barSize;

    if (sizeChanged) {
      this.screen = clientSize;
      this.total = scrollSize;
      this.size = barSize;
    }

    let buttonSize = this.screen * (this.size / this.total);

    if (buttonSize < minButtonSize) {
      this.size -= minButtonSize - buttonSize;
      buttonSize = minButtonSize;
    }

    this.inner.style[this.orientation === 'horizontal' ? 'width' : 'height'] = `${buttonSize}px`;
    this.setPos(this.pos, sizeChanged);
  }
}

class Scrollbars {
  constructor(place, scroll, cm) {
    const cls = 'CodeMirror-overlayscroll';
    this.addClass = 'CodeMirror-overlayscroll';
    this.horiz = new Bar(cls, 'horizontal', scroll);
    place(this.horiz.node);
    this.vert = new Bar(cls, 'vertical', scroll);
    place(this.vert.node);
    this.width = null;
    this.bindEvents(cm);
    this.focus = false;
  }

  bindEvents(cm) {
    // editor on focus, show srcollbar
    cm.on('focus', () => {
      this.horiz.show();
      this.vert.show();
      this.focus = true;
    });

    // editor on blur, hide scrollbar
    cm.on('blur', () => {
      this.horiz.hide();
      this.vert.hide();
      this.focus = false;
    });

    cm.on('scroll', () => {
      if (!this.focus) {
        this.horiz.show();
        this.vert.show();
        this.horiz.hide();
        this.vert.hide();
      }
    });
  }

  update(measure) {
    if (this.width == null) {
      const style = window.getComputedStyle ? window.getComputedStyle(this.horiz.node) : this.horiz.node.currentStyle;
      if (style) this.width = parseInt(style.height, 10);
    }
    const width = this.width || 0;
    const needsH = measure.scrollWidth > measure.clientWidth + 1;
    const needsV = measure.scrollHeight > measure.clientHeight + 1;
    this.vert.node.style.display = needsV ? 'block' : 'none';
    this.horiz.node.style.display = needsH ? 'block' : 'none';

    if (needsV) {
      this.vert.update(measure.scrollHeight, measure.clientHeight, measure.viewHeight - (needsH ? width : 0));
      this.vert.node.style.bottom = needsH ? `${width}px` : '0';
    }
    if (needsH) {
      this.horiz.update(measure.scrollWidth, measure.clientWidth, measure.viewWidth - (needsV ? width : 0) - measure.barLeft);
      this.horiz.node.style.right = needsV ? `${width}px` : '0';
      this.horiz.node.style.left = `${measure.barLeft}px`;
    }
    return {
      right: needsV ? width : 0,
      bottom: needsH ? width : 0,
    };
  }

  setScrollTop(pos) {
    this.vert.setPos(pos);
  }

  setScrollLeft(pos) {
    this.horiz.setPos(pos);
  }

  clear() {
    const parent = this.horiz.node.parentNode;
    parent.removeChild(this.horiz.node);
    parent.removeChild(this.vert.node);
  }
}

CodeMirror.scrollbarModel.overlay = Scrollbars;
