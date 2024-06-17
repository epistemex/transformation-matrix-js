/*!
  2D Transformation Matrix v3.0.0
  (c) Epistemex.com 2014-2018, 2024
  License: MIT
*/

/**
 * 2D transformation matrix object initialized with identity matrix.
 *
 * The matrix can synchronize a canvas 2D context by supplying the context
 * as an argument, or later apply current absolute transform to an
 * existing context.
 *
 * To synchronize a DOM element you can use [`toCSS()`]{@link Matrix#toCSS} or [`toCSS3D()`]{@link Matrix#toCSS3D}.
 * together with for example the `style.transform` property.
 *
 * @param {CanvasRenderingContext2D} [context] - Optional context to sync with Matrix
 * @param {HTMLElement} [element=null] - DOM Element to synchronize
 * @prop {number} a - scale x
 * @prop {number} b - shear y
 * @prop {number} c - shear x
 * @prop {number} d - scale y
 * @prop {number} e - translate x
 * @prop {number} f - translate y
 * @prop {CanvasRenderingContext2D} [context] - set or get current synchronized 2D context
 * @prop {HTMLElement} [element] - get current synchronized DOM element
 * @prop {boolean} [useCSS3D=false] - is a DOM element is defined for sync., choose whether to use 2D (false) or 3D (true) matrix to sync it.
 * @constructor
 * @license MIT license
 * @copyright Epistemex.com 2014-2018, 2024
 */
function Matrix(context, element) {

  let _el;

  this._t = this.transform;

  this.a = this.d = 1;
  this.b = this.c = this.e = this.f = 0;

  // sync context
  if ( context )
    (this.context = context).setTransform(1, 0, 0, 1, 0, 0);

  // sync DOM element
  Object.defineProperty(this, 'element', {
    get: function() {return _el;},
    set: function(el) {
      if ( !_el ) {
        this._px = this._getPX();
        this.useCSS3D = false;
      }
      _el = el;
      (this._st = _el.style)[ this._px ] = this.toCSS();
    }
  });

  if ( element ) this.element = element;
}

/**
 * Returns a new matrix that transforms a triangle `t1` into another triangle
 * `t2`, or throws an exception if it is impossible.
 *
 * Note: the method can take both arrays and literal objects.
 * Just make sure that both arguments (`t1`, `t2`) are of the same type.
 *
 * @param {{px: number, py: number, qx: number, qy: number, rx: number, ry: number}|Array} t1 - Object or array containing the three points for the triangle.
 * For object use obj.px, obj.py, obj.qx, obj.qy, obj.rx and obj.ry. For arrays provide the points in the order [px, py, qx, qy, rx, ry], or as point array [{x:,y:}, {x:,y:}, {x:,y:}]
 * @param {{px: number, py: number, qx: number, qy: number, rx: number, ry: number}|Array} t2 - See description for t1.
 * @param {CanvasRenderingContext2D} [context] - optional canvas 2D context to use for the matrix
 * @returns {Matrix}
 * @throws Exception is matrix becomes not invertible
 * @static
 */
Matrix.fromTriangles = function(t1, t2, context) {

  const m1 = new Matrix();
  const m2 = new Matrix(context);
  let r1, r2, rx1, ry1, rx2, ry2;

  if ( Array.isArray(t1) ) {
    if ( typeof t1[ 0 ] === 'number' ) {
      rx1 = t1[ 4 ];
      ry1 = t1[ 5 ];
      rx2 = t2[ 4 ];
      ry2 = t2[ 5 ];
      r1 = [ t1[ 0 ] - rx1, t1[ 1 ] - ry1, t1[ 2 ] - rx1, t1[ 3 ] - ry1, rx1, ry1 ];
      r2 = [ t2[ 0 ] - rx2, t2[ 1 ] - ry2, t2[ 2 ] - rx2, t2[ 3 ] - ry2, rx2, ry2 ];
    }
    else {
      rx1 = t1[ 2 ].x;
      ry1 = t1[ 2 ].y;
      rx2 = t2[ 2 ].x;
      ry2 = t2[ 2 ].y;
      r1 = [ t1[ 0 ].x - rx1, t1[ 0 ].y - ry1, t1[ 1 ].x - rx1, t1[ 1 ].y - ry1, rx1, ry1 ];
      r2 = [ t2[ 0 ].x - rx2, t2[ 0 ].y - ry2, t2[ 1 ].x - rx2, t2[ 1 ].y - ry2, rx2, ry2 ];
    }
  }
  else {
    r1 = [ t1.px - t1.rx, t1.py - t1.ry, t1.qx - t1.rx, t1.qy - t1.ry, t1.rx, t1.ry ];
    r2 = [ t2.px - t2.rx, t2.py - t2.ry, t2.qx - t2.rx, t2.qy - t2.ry, t2.rx, t2.ry ];
  }

  m1.setTransform.apply(m1, r1);
  m2.setTransform.apply(m2, r2);

  return m2.multiply(m1.inverse());
};

/**
 * Create a matrix from a transform list from an SVG shape. The list
 * can be for example baseVal (i.e. `shape.transform.baseVal`).
 *
 * The resulting matrix has all transformations from that list applied
 * in the same order as the list.
 *
 * @param {SVGTransformList} tList - transform list from an SVG shape.
 * @param {CanvasRenderingContext2D} [context] - optional canvas 2D context to use for the matrix
 * @param {HTMLElement} [dom] - optional DOM element to use for the matrix
 * @returns {Matrix}
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/SVGTransformList|MDN / SVGTransformList}
 */
Matrix.fromSVGTransformList = function(tList, context, dom) {

  const m = new Matrix(context, dom);
  let i = 0;

  while( i < tList.length )
    m.multiply(tList[ i++ ].matrix);

  return m;
};

/**
 * Create and transform a new matrix based on given matrix values, or
 * provide SVGMatrix or a (2D) DOMMatrix, WebKitCSSMatrix or another
 * instance of a generic Matrix.
 *
 * @example
 *
 * var m = Matrix.from(1, 0.2, 0, 2, 120, 97);
 * var m = Matrix.from(domMatrix, ctx);
 * var m = Matrix.from(svgMatrix);
 * var m = Matrix.from(cssMatrix);
 * var m = Matrix.from(matrix);
 * var m = Matrix.from(vector [,pre-x] [,pre-y] [,doScale]);
 *
 * @param {*} a - number representing `a` in [a-f], or a Matrix object containing properties a-f. Vector is given as an object with properties x and y.
 * @param {*} [b] - b property if `a` is not a matrix object, or optional canvas 2D context.
 * If vector is input this will be pre-translate for x.
 * @param {number} [c] - If vector is input this will be pre-translate for y.
 * @param {number} [d] - If vector is input, set this to true to use scale and translate of 1,
 * false to use hypotenuse as translate distance instead and no scale.
 * @param {number} [e]
 * @param {number} [f]
 * @param {CanvasRenderingContext2D} [context] - optional canvas context to synchronize
 * @param {HTMLElement} [dom] - optional DOM element to use for the matrix
 * @returns {Matrix}
 * @static
 */
Matrix.from = function(a, b, c, d, e, f, context, dom) {

  const m = new Matrix(context, dom);

  if ( typeof a === 'number' ) {
    m.setTransform(a, b, c, d, e, f);
  }
  else if ( typeof a.x === 'number' ) {		// vector
    const q = Math.sqrt(a.x * a.x + a.y * a.y);
    let scale = 1;
    let dist = 1;

    if ( d ) scale = q;
    else dist = q;

    m
      .translate(b || 0, c || 0)
      .rotateFromVector(a)
      .scaleU(scale)
      .translate(dist, 0);
  }
  else {
    if ( typeof a.is2D === 'boolean' && !a.is2D ) throw 'Cannot use 3D DOMMatrix.';
    if ( b ) m.context = b;
    if ( c ) m.element = c;
    m.multiply(a);
  }

  return m;
};

Matrix.prototype = {

  _getPX: function() {
    const lst = [ 't', 'oT', 'msT', 'mozT', 'webkitT', 'khtmlT' ];
    let i = 0, p;
    const style = document.createElement('div').style;

    while( p = lst[ i++ ] )
      if ( typeof style[ p + 'ransform' ] !== 'undefined' ) return p + 'ransform';
  },

  /**
   * Concatenates transforms of this matrix onto the given child matrix and
   * returns a new matrix. This instance is used on left side.
   *
   * @param {Matrix|SVGMatrix} cm - child matrix to apply concatenation to
   * @returns {Matrix} - new Matrix instance
   */
  concat: function(cm) {
    return this.clone().multiply(cm);
  },

  /**
   * Flips the horizontal values.
   * @returns {Matrix}
   */
  flipX: function() {
    return this._t(-1, 0, 0, 1, 0, 0);
  },

  /**
   * Flips the vertical values.
   * @returns {Matrix}
   */
  flipY: function() {
    return this._t(1, 0, 0, -1, 0, 0);
  },

  /**
   * Reflects incoming (velocity) vector on the normal which will be the
   * currently transformed x-axis. Call when a trigger condition is met.
   *
   * @param {number} x - vector end point for x (start = 0)
   * @param {number} y - vector end point for y (start = 0)
   * @returns {{x: number, y: number}}
   */
  reflectVector: function(x, y) {

    const v = this.applyToPoint(0, 1);
    const d = (v.x * x + v.y * y) * 2;

    x -= d * v.x;
    y -= d * v.y;

    return { x, y };
  },

  /**
   * Shorthand to reset current matrix to an identity matrix.
   * @returns {Matrix}
   */
  reset: function() {
    return this.setTransform(1, 0, 0, 1, 0, 0);
  },

  /**
   * Rotates current matrix by angle (accumulative).
   * @param {number} angle - angle in radians
   * @returns {Matrix}
   */
  rotate: function(angle) {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    return this._t(cos, sin, -sin, cos, 0, 0);
  },

  /**
   * Converts a vector given as `x` and `y` to angle, and
   * rotates (accumulative). x can instead contain an object with
   * properties x and y and if so, y parameter will be ignored.
   * @param {number|*} x
   * @param {number} [y]
   * @returns {Matrix}
   */
  rotateFromVector: function(x, y) {
    return this.rotate(typeof x === 'number' ? Math.atan2(y, x) : Math.atan2(x.y, x.x));
  },

  /**
   * Helper method to make a rotation based on an angle in degrees.
   * @param {number} angle - angle in degrees
   * @returns {Matrix}
   */
  rotateDeg: function(angle) {
    return this.rotate(angle * Math.PI / 180);
  },

  /**
   * Scales current matrix uniformly and accumulative.
   * @param {number} f - scale factor for both x and y (1 does nothing)
   * @returns {Matrix}
   */
  scaleU: function(f) {
    return this._t(f, 0, 0, f, 0, 0);
  },

  /**
   * Scales current matrix accumulative.
   * @param {number} sx - scale factor x (1 does nothing)
   * @param {number} sy - scale factor y (1 does nothing)
   * @returns {Matrix}
   */
  scale: function(sx, sy) {
    return this._t(sx, 0, 0, sy, 0, 0);
  },

  /**
   * Scales current matrix on x axis accumulative.
   * @param {number} sx - scale factor x (1 does nothing)
   * @returns {Matrix}
   */
  scaleX: function(sx) {
    return this._t(sx, 0, 0, 1, 0, 0);
  },

  /**
   * Scales current matrix on y axis accumulative.
   * @param {number} sy - scale factor y (1 does nothing)
   * @returns {Matrix}
   */
  scaleY: function(sy) {
    return this._t(1, 0, 0, sy, 0, 0);
  },

  /**
   * Converts a vector given as `x` and `y` to normalized scale.
   * @param x
   * @param y
   * @returns {Matrix}
   */
  scaleFromVector: function(x, y) {
    return this.scaleU(Math.sqrt(x * x + y * y));
  },

  /**
   * Apply shear to the current matrix accumulative.
   * @param {number} sx - amount of shear for x
   * @param {number} sy - amount of shear for y
   * @returns {Matrix}
   */
  shear: function(sx, sy) {
    return this._t(1, sy, sx, 1, 0, 0);
  },

  /**
   * Apply shear for x to the current matrix accumulative.
   * @param {number} sx - amount of shear for x
   * @returns {Matrix}
   */
  shearX: function(sx) {
    return this._t(1, 0, sx, 1, 0, 0);
  },

  /**
   * Apply shear for y to the current matrix accumulative.
   * @param {number} sy - amount of shear for y
   * @returns {Matrix}
   */
  shearY: function(sy) {
    return this._t(1, sy, 0, 1, 0, 0);
  },

  /**
   * Apply skew to the current matrix accumulative. Angles in radians.
   * Also see [`skewDeg()`]{@link Matrix#skewDeg}.
   * @param {number} ax - angle of skew for x
   * @param {number} ay - angle of skew for y
   * @returns {Matrix}
   */
  skew: function(ax, ay) {
    return this.shear(Math.tan(ax), Math.tan(ay));
  },

  /**
   * Apply skew to the current matrix accumulative. Angles in degrees.
   * Also see [`skew()`]{@link Matrix#skew}.
   * @param {number} ax - angle of skew for x
   * @param {number} ay - angle of skew for y
   * @returns {Matrix}
   */
  skewDeg: function(ax, ay) {
    return this.shear(Math.tan(ax / 180 * Math.PI), Math.tan(ay / 180 * Math.PI));
  },

  /**
   * Apply skew for x to the current matrix accumulative. Angles in radians.
   * Also see [`skewDeg()`]{@link Matrix#skewDeg}.
   * @param {number} ax - angle of skew for x
   * @returns {Matrix}
   */
  skewX: function(ax) {
    return this.shearX(Math.tan(ax));
  },

  /**
   * Apply skew for y to the current matrix accumulative. Angles in radians.
   * Also see [`skewDeg()`]{@link Matrix#skewDeg}.
   * @param {number} ay - angle of skew for y
   * @returns {Matrix}
   */
  skewY: function(ay) {
    return this.shearY(Math.tan(ay));
  },

  /**
   * Set current matrix to new absolute matrix.
   * @param {number} a - scale x
   * @param {number} b - shear y
   * @param {number} c - shear x
   * @param {number} d - scale y
   * @param {number} e - translate x
   * @param {number} f - translate y
   * @returns {Matrix}
   */
  setTransform: function(a, b, c, d, e, f) {
    this.a = a;
    this.b = b;
    this.c = c;
    this.d = d;
    this.e = e;
    this.f = f;
    return this._x();
  },

  /**
   * Translate current matrix accumulative.
   * @param {number} tx - translation for x
   * @param {number} ty - translation for y
   * @returns {Matrix}
   */
  translate: function(tx, ty) {
    return this._t(1, 0, 0, 1, tx, ty);
  },

  /**
   * Translate current matrix on x-axis accumulative.
   * @param {number} tx - translation for x
   * @returns {Matrix}
   */
  translateX: function(tx) {
    return this._t(1, 0, 0, 1, tx, 0);
  },

  /**
   * Translate current matrix on y-axis accumulative.
   * @param {number} ty - translation for y
   * @returns {Matrix}
   */
  translateY: function(ty) {
    return this._t(1, 0, 0, 1, 0, ty);
  },

  /**
   * Multiplies current matrix with new matrix values. Also see [`multiply()`]{@link Matrix#multiply}.
   *
   * @param {number} a2 - scale x
   * @param {number} b2 - skew y
   * @param {number} c2 - skew x
   * @param {number} d2 - scale y
   * @param {number} e2 - translate x
   * @param {number} f2 - translate y
   * @returns {Matrix}
   */
  transform: function(a2, b2, c2, d2, e2, f2) {
    const a1 = this.a;
    const b1 = this.b;
    const c1 = this.c;
    const d1 = this.d;
    const e1 = this.e;
    const f1 = this.f;

    /* matrix column order is:
     *   a c e
     *   b d f
     *   0 0 1
     */
    this.a = a1 * a2 + c1 * b2;
    this.b = b1 * a2 + d1 * b2;
    this.c = a1 * c2 + c1 * d2;
    this.d = b1 * c2 + d1 * d2;
    this.e = a1 * e2 + c1 * f2 + e1;
    this.f = b1 * e2 + d1 * f2 + f1;

    return this._x();
  },

  /**
   * Multiplies current matrix with source matrix.
   * @param {Matrix|DOMMatrix|SVGMatrix} m - source matrix to multiply with.
   * @returns {Matrix}
   */
  multiply: function(m) {
    return this._t(m.a, m.b, m.c, m.d, m.e, m.f);
  },

  /**
   * Divide this matrix on input matrix which must be invertible.
   * @param {Matrix} m - matrix to divide on (divisor)
   * @throws Exception if input matrix is not invertible
   * @returns {Matrix}
   */
  divide: function(m) {
    return this.multiply(m.inverse());
  },

  /**
   * Divide current matrix on scalar value != 0.
   * @param {number} d - divisor
   * @throws Exception if divisor is zero
   * @returns {Matrix}
   */
  divideScalar: function(d) {

    if ( !d ) throw 'Division by zero';

    this.a /= d;
    this.b /= d;
    this.c /= d;
    this.d /= d;
    this.e /= d;
    this.f /= d;

    return this._x();
  },

  /**
   * Get an inverse matrix of current matrix. The method returns a new
   * matrix with values you need to use to get to an identity matrix.
   * Context from parent matrix is not applied to the returned matrix.
   *
   * @param {boolean} [cloneContext=false] - clone current context to resulting matrix
   * @param {boolean} [cloneDOM=false] - clone current DOM element to resulting matrix
   * @throws Exception is input matrix is not invertible
   * @returns {Matrix} - new Matrix instance
   */
  inverse: function(cloneContext, cloneDOM) {

    const m = new Matrix(cloneContext ? this.context : null, cloneDOM ? this.element : null);
    const dt = this.determinant();

    if ( !dt ) throw 'Matrix is not invertible.';

    m.a = this.d / dt;
    m.b = -this.b / dt;
    m.c = -this.c / dt;
    m.d = this.a / dt;
    m.e = (this.c * this.f - this.d * this.e) / dt;
    m.f = -(this.a * this.f - this.b * this.e) / dt;

    return m;
  },

  /**
   * Interpolate this matrix with another and produce a new matrix.
   * `t` is a value in the range [0.0, 1.0] where 0 is this instance and
   * 1 is equal to the second matrix. The `t` value is not clamped.
   *
   * Context from parent matrix is not applied to the returned matrix.
   *
   * Note: this interpolation is naive. For animation containing rotation,
   * shear or skew use the [`interpolateAnim()`]{@link Matrix#interpolateAnim} method instead
   * to avoid unintended flipping.
   *
   * @param {Matrix|SVGMatrix} m2 - the matrix to interpolate with.
   * @param {number} t - interpolation [0.0, 1.0]
   * @param {CanvasRenderingContext2D} [context] - optional context to affect
   * @param {HTMLElement} [dom] - optional DOM element to use for the matrix
   * @returns {Matrix} - new Matrix instance with the interpolated result
   */
  interpolate: function(m2, t, context, dom) {

    const m = new Matrix(context, dom);

    m.a = this.a + (m2.a - this.a) * t;
    m.b = this.b + (m2.b - this.b) * t;
    m.c = this.c + (m2.c - this.c) * t;
    m.d = this.d + (m2.d - this.d) * t;
    m.e = this.e + (m2.e - this.e) * t;
    m.f = this.f + (m2.f - this.f) * t;

    return m._x();
  },

  /**
   * Interpolate this matrix with another and produce a new matrix.
   * `t` is a value in the range [0.0, 1.0] where 0 is this instance and
   * 1 is equal to the second matrix. The `t` value is not constrained.
   *
   * Context from parent matrix is not applied to the returned matrix.
   *
   * To obtain easing `t` can be preprocessed using easing-functions
   * before being passed to this method.
   *
   * Note: this interpolation method uses decomposition which makes
   * it suitable for animations (in particular where rotation takes
   * places).
   *
   * @param {Matrix} m2 - the matrix to interpolate with.
   * @param {number} t - interpolation [0.0, 1.0]
   * @param {CanvasRenderingContext2D} [context] - optional context to affect
   * @param {HTMLElement} [dom] - optional DOM element to use for the matrix
   * @returns {Matrix} - new Matrix instance with the interpolated result
   */
  interpolateAnim: function(m2, t, context, dom) {

    const m = new Matrix(context, dom);
    const d1 = this.decompose();
    const d2 = m2.decompose();
    const t1 = d1.translate;
    const t2 = d2.translate;
    const s1 = d1.scale;

    // QR order (t-r-s-sk)
    m.translate(t1.x + (t2.x - t1.x) * t, t1.y + (t2.y - t1.y) * t);
    m.rotate(d1.rotation + (d2.rotation - d1.rotation) * t);
    m.scale(s1.x + (d2.scale.x - s1.x) * t, s1.y + (d2.scale.y - s1.y) * t);
    //todo test skew scenarios

    return m._x();
  },

  /**
   * Decompose the current matrix into simple transforms using either
   * QR (default) or LU decomposition.
   *
   * @param {boolean} [useLU=false] - set to true to use LU rather than QR decomposition
   * @returns {*} - an object containing current decomposed values (translate, rotation, scale, skew)
   * @see {@link https://en.wikipedia.org/wiki/QR_decomposition|More on QR decomposition}
   * @see {@link https://en.wikipedia.org/wiki/LU_decomposition|More on LU decomposition}
   */
  decompose: function(useLU) {

    const a = this.a;
    const b = this.b;
    const c = this.c;
    const d = this.d;
    const pi = Math.PI;

    const translate = { x: this.e, y: this.f };
    let rotation = 0;
    let scale = { x: 1, y: 1 };
    let skew = { x: 0, y: 0 };

    const determ = a * d - b * c;	// determinant(), skip DRY here...
    let r, s;

    if ( useLU ) {
      if ( a ) {
        skew = { x: Math.atan(c / a), y: Math.atan(b / a) };
        scale = { x: a, y: determ / a };
      }
      else if ( b ) {
        rotation = pi * 0.5;
        scale = { x: b, y: determ / b };
        skew.x = Math.atan(d / b);
      }
      else { // a = b = 0
        scale = { x: c, y: d };
        skew.x = pi * 0.25;
      }
    }
    else {
      // Apply the QR-like decomposition.
      if ( a || b ) {
        r = Math.sqrt(a * a + b * b);
        rotation = b > 0 ? Math.acos(a / r) : -Math.acos(a / r);
        scale = { x: r, y: determ / r };
        skew.x = Math.atan((a * c + b * d) / (r * r));
      }
      else if ( c || d ) {
        s = Math.sqrt(c * c + d * d);
        rotation = pi * 0.5 - (d > 0 ? Math.acos(-c / s) : -Math.acos(c / s));
        scale = { x: determ / s, y: s };
        skew.y = Math.atan((a * c + b * d) / (s * s));
      }
      else { // a = b = c = d = 0
        scale = { x: 0, y: 0 };
      }
    }

    return {
      translate: translate,
      rotation : rotation,
      scale    : scale,
      skew     : skew
    };
  },

  /**
   * Returns the determinant of the current matrix.
   * @returns {number}
   */
  determinant: function() {
    return this.a * this.d - this.b * this.c;
  },

  /**
   * Apply current matrix to `x` and `y` of a point.
   * Returns a point object.
   *
   * @param {number} x - value for x
   * @param {number} y - value for y
   * @returns {{x: number, y: number}} A new transformed point object
   */
  applyToPoint: function(x, y) {
    return {
      x: x * this.a + y * this.c + this.e,
      y: x * this.b + y * this.d + this.f
    };
  },

  /**
   * Apply current matrix to array with point objects or point pairs.
   * Returns a new array with points in the same format as the input array.
   *
   * A point object is an object literal:
   *
   *     {x: x, y: y}
   *
   * so an array would contain either:
   *
   *     [{x: x1, y: y1}, {x: x2, y: y2}, ... {x: xn, y: yn}]
   *
   * or
   *
   *     [x1, y1, x2, y2, ... xn, yn]
   *
   * @param {Array} points - array with point objects or pairs
   * @returns {Array} A new array with transformed points
   */
  applyToArray: function(points) {

    const mxPoints = [];
    let i = 0, p, l;

    if ( typeof points[ 0 ] === 'number' ) {
      l = points.length;

      while( i < l ) {
        p = this.applyToPoint(points[ i++ ], points[ i++ ]);
        mxPoints.push(p.x, p.y);
      }
    }
    else {
      while( p = points[ i++ ] ) {
        mxPoints.push(this.applyToPoint(p.x, p.y));
      }
    }

    return mxPoints;
  },

  /**
   * Apply current matrix to a typed array with point pairs. Although
   * the input array may be an ordinary array, this method is intended
   * for more performant use where typed arrays are used. The returned
   * array is regardless always returned as a `Float32Array`.
   *
   * @param {*} points - (typed) array with point pairs [x1, y1, ..., xn, yn]
   * @param {boolean} [use64=false] - use Float64Array instead of Float32Array
   * @returns {*} A new typed array with transformed points
   */
  applyToTypedArray: function(points, use64) {

    const mxPoints = use64 ? new Float64Array(points.length) : new Float32Array(points.length);
    let i = 0;

    while( i < points.length ) {
      const p = this.applyToPoint(points[ i ], points[ i + 1 ]);
      mxPoints[ i++ ] = p.x;
      mxPoints[ i++ ] = p.y;
    }

    return mxPoints;
  },

  /**
   * Apply to any canvas 2D context object. This does not affect the
   * context that optionally was referenced in constructor unless it is
   * the same context.
   *
   * @param {CanvasRenderingContext2D} context - target context
   * @returns {Matrix}
   */
  applyToContext: function(context) {
    context.setTransform(this.a, this.b, this.c, this.d, this.e, this.f);
    return this;
  },

  /**
   * Apply to any DOM element. This does not affect the DOM element
   * that optionally was referenced in constructor unless it is
   * the same element.
   *
   * The method will auto-detect the correct browser prefix if any.
   *
   * @param {HTMLElement} element - target DOM element
   * @param {boolean} [use3D=false] - use 3D transformation matrix instead of 2D
   * @returns {Matrix}
   */
  applyToElement: function(element, use3D) {
    if ( !this._px ) this._px = this._getPX();
    element.style[ this._px ] = use3D ? this.toCSS3D() : this.toCSS();
    return this;
  },

  /**
   * Instead of creating a new instance of a Matrix, DOMMatrix or SVGMatrix
   * the current settings of this instance can be applied to an external
   * object of a different (or same) type. You can also pass in an
   * empty literal object.
   *
   * Note that the properties a-f will be set regardless of if they
   * already exist or not.
   *
   * @param {*} obj - target object.
   * @returns {Matrix}
   */
  applyToObject: function(obj) {
    obj.a = this.a;
    obj.b = this.b;
    obj.c = this.c;
    obj.d = this.d;
    obj.e = this.e;
    obj.f = this.f;
    return this;
  },

  /**
   * Returns true if matrix is an identity matrix (no transforms applied).
   * @returns {boolean}
   */
  isIdentity: function() {
    return this.a === 1 && !this.b && !this.c && this.d === 1 && !this.e && !this.f;
  },

  /**
   * Returns true if matrix is invertible
   * @returns {boolean}
   */
  isInvertible: function() {
    return !this._q(this.determinant(), 0);
  },

  /**
   * The method is intended for situations where scale is accumulated
   * via multiplications, to detect situations where scale becomes
   * "trapped" with a value of zero. And in which case scale must be
   * set explicitly to a non-zero value.
   *
   * @returns {boolean}
   */
  isValid: function() {
    return !(this.a * this.d);
  },

  /**
   * Compares current matrix with another matrix. Returns true if equal
   * (within epsilon tolerance).
   * @param {Matrix|SVGMatrix} m - matrix to compare this matrix with
   * @returns {boolean}
   */
  isEqual: function(m) {

    return this._q(this.a, m.a) &&
      this._q(this.b, m.b) &&
      this._q(this.c, m.c) &&
      this._q(this.d, m.d) &&
      this._q(this.e, m.e) &&
      this._q(this.f, m.f);
  },

  /**
   * Clones current instance and returning a new matrix.
   * @param {boolean} [noContext=false] don't clone context reference if true
   * @returns {Matrix} - a new Matrix instance with identical transformations as this instance
   */
  clone: function(noContext) {
    return new Matrix(noContext ? null : this.context).multiply(this);
  },

  /**
   * Returns an array with current matrix values.
   * @returns {Array}
   */
  toArray: function() {
    return [ this.a, this.b, this.c, this.d, this.e, this.f ];
  },

  /**
   * Returns a binary 32-bit floating point typed array.
   * @returns {*}
   */
  toTypedArray: function() {
    return new Float32Array([ this.a, this.b, this.c, this.d, this.e, this.f ]);
  },

  /**
   * Generates a string that can be used with CSS `transform`.
   * @example
   *     element.style.transform = m.toCSS();
   * @returns {string}
   */
  toCSS: function() {
    return 'matrix(' + this.toArray() + ')';
  },

  /**
   * Generates a `matrix3d()` string that can be used with CSS `transform`.
   * Although the matrix is for 2D use you may see performance benefits
   * on some devices using a 3D CSS transform instead of a 2D one.
   * @example
   *     element.style.transform = m.toCSS3D();
   * @returns {string}
   */
  toCSS3D: function() {
    const n2 = ',0,0,';
    return 'matrix3d(' + this.a + ',' + this.b + n2 + this.c + ',' + this.d + n2 + n2 + ',1,0,' + this.e + ',' + this.f + ',0,1)';
  },

  /**
   * Returns a JSON compatible string of current matrix.
   * @returns {string}
   */
  toJSON: function() {
    return '{"a":' + this.a + ',"b":' + this.b + ',"c":' + this.c + ',"d":' + this.d + ',"e":' + this.e + ',"f":' + this.f + '}';
  },

  /**
   * Returns a string with current matrix as comma-separated list.
   * @param {number} [fixLen=4] - truncate decimal values to number of digits
   * @returns {string}
   */
  toString: function(fixLen) {
    fixLen = fixLen || 4;
    return 'a=' + this.a.toFixed(fixLen) +
      ' b=' + this.b.toFixed(fixLen) +
      ' c=' + this.c.toFixed(fixLen) +
      ' d=' + this.d.toFixed(fixLen) +
      ' e=' + this.e.toFixed(fixLen) +
      ' f=' + this.f.toFixed(fixLen);
  },

  /**
   * Returns a string with current matrix as comma-separated values
   * string with line-end (CR+LF).
   * @returns {string}
   */
  toCSV: function() {
    return this.toArray().join() + '\r\n';
  },

  /**
   * Convert current matrix into a `DOMMatrix`. If `DOMMatrix` is not
   * supported, a `null` is returned.
   *
   * @returns {DOMMatrix}
   * @see {@link https://drafts.fxtf.org/geometry/#dommatrix|MDN / SVGMatrix}
   */
  toDOMMatrix: function() {
    let m = null;
    if ( 'DOMMatrix' in window ) {
      m = new DOMMatrix();
      m.a = this.a;
      m.b = this.b;
      m.c = this.c;
      m.d = this.d;
      m.e = this.e;
      m.f = this.f;
    }
    return m;
  },

  /**
   * Convert current matrix into a `SVGMatrix`. If `SVGMatrix` is not
   * supported, a `null` is returned.
   *
   * @returns {SVGMatrix}
   * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/SVGMatrix|MDN / SVGMatrix}
   */
  toSVGMatrix: function() {

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    let svgMatrix = null;

    if ( svg ) {
      svgMatrix = svg.createSVGMatrix();
      svgMatrix.a = this.a;
      svgMatrix.b = this.b;
      svgMatrix.c = this.c;
      svgMatrix.d = this.d;
      svgMatrix.e = this.e;
      svgMatrix.f = this.f;
    }

    return svgMatrix;
  },

  /**
   * Compares floating point values with some tolerance (epsilon)
   * @param {number} f1 - float 1
   * @param {number} f2 - float 2
   * @returns {boolean}
   * @private
   */
  _q: function(f1, f2) {
    return Math.abs(f1 - f2) < 1e-14;
  },

  /**
   * Apply current absolute matrix to context if defined, to sync it.
   * @returns {Matrix}
   * @private
   */
  _x: function() {

    if ( this.context ) {
      this.context.setTransform(this.a, this.b, this.c, this.d, this.e, this.f);
    }

    if ( this._st ) {
      this._st[ this._px ] = this.useCSS3D ? this.toCSS3D() : this.toCSS();
    }

    return this;
  }
};

// Node support
if ( typeof exports !== 'undefined' ) {
  module.exports.Matrix = Matrix;
}
