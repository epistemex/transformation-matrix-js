2D Affine Transformation Matrix
===============================

An affine transformation matrix (3x3) class for JavaScript that performs
various transformations such as rotate, scale, translate, skew, shear, add,
subtract, multiply, divide, inverse, decomposing, animation, converting 
to and from a SVG matrix, creating matrix from triangles and more (full 
HTML documentation is included).

It's primarily intended for situations where you need to track or create
transforms and want to apply it permanently/manually to your own points
and polygons.

The matrix can optionally synchronize a canvas 2D context so that the
transformations on the canvas matches pixel perfect the local
transformations of the Matrix object. It can be used to synchronize DOM
elements using the toCSS() / toCSS3D() methods.

Optional Node support.

No dependencies.


Install
=======

Download zip and extract to folder.

git via HTTPS:

    $ git clone https://github.com/epistemex/transformation-matrix-js.git

git via SSH:

    $ git clone git@github.com:epistemex/transformation-matrix-js.git

Using Bower:

    $ bower install transformation-matrix-js

Using NPM

    $ npm install transformation-matrix-js


Usage
=====

Browser
-------

Just include the script and create a new instance:

    var matrix = new Matrix([context]);

You can supply an optional canvas 2D context as argument, which will be
synchronized with the transformations that are applied to the matrix
object.

Node
----

Using it with Node - use npm to install the package first, then:

    var Matrix = require("transformation-matrix-js").Matrix;
    var matrix = new Matrix();

Quick overview
--------------

Static methods:

	Matrix.fromTriangles(t1, t2);       // returns matrix needed to produce t2 from t1
	Matrix.fromSVGMatrix(svgMatrix);    // create new matrix from SVGMatrix
	Matrix.fromSVGAnimList(tList);		// create new matrix from an SVG animation list
	
Some of the methods:

    interpolateAnim();           	// decomposed interpolation (prevents flipping)
    toString();
    toJSON();
    toCSS();
    toCSS3D();
    toSVGMatrix();					// creates a SVGMatrix from current transforms
    toArray();
	toTypedArray();					// binary array
    rotate(angle);    		    	// angle in radians
    rotateDeg(angle);   		    // angle in degrees
    rotateFromVector(x, y);      	// use a vector to set angle
    translate(x, y);
    translateX(x);
    translateY(y);
    scale(sx, sy);
    scaleX(sx);
    scaleY(sy);
    scaleU(f);                    	// scale both x and y
    shear(sx, sy);
    shearX(sx);
    shearY(sy);
    skew(ax, ay);                	// angle in radians
    skewX(ax);
    skewY(ay);
    transform(a, b, c, d, e, f);
    setTransform(a, b, c, d, e, f);
    multiply(matrix);				// multiply with another matrix
    divide();                    	// divide matrix on another matrix
    divideScalar();              	// divide matrix by scalar value
    inverse();
    decompose([lu]);             	// BETA decompose matrix using QR or LU
    determinant();               	// get determinant of current matrix
	reset();
    clone();
    isInvertible();
	isValid();
    reflectVector(x, y)         	// reflects vector on normal (=current x-axis);
    concat(childMatrix)

Get current transform matrix properties:

    matrix.a;						// scale x
    matrix.b;						// shear y
    matrix.c;						// shear x
    matrix.d;						// scale y
    matrix.e;						// translate x
    matrix.f;						// translate y

(see also `decompose()`).

Apply to a point:

    tPoint = matrix.applyToPoint( x, y );

Apply to an Array with point objects or point pair values:

    tPoints = matrix.applyToArray( [{x: x1, y: y1}, {x: x2, y: y2}, ...] );
    tPoints = matrix.applyToArray( [x1, y1, x2, y2, ...] );
    tPoints = matrix.applyToTypedArray(...);

or apply to a canvas context (other than optionally referenced in constructor):

    matrix.applyToContext( myContext );

Get inverse transformation matrix (the matrix you need to apply to get back
to an identity matrix from whatever the matrix contains):

    invMatrix = matrix.inverse();

or

    var invMatrix;

    if (matrix.isInvertible()) {                 	// check if we can inverse
        invMatrix = matrix.inverse();
    }

You can interpolate between current and a new matrix. The function
returns a new matrix:

    iMatrix = matrix.interpolate( matrix2, t );     // t = [0.0, 1.0]
    iMatrix = matrix.interpolateAnim( matrix2, t );

The former does a naive interpolation which works fine with translate
and scale. The latter is better suited when there is for example rotation
involved to avoid "flipping" (and is what the browsers are using) utilizing
decomposition.

Check if there is any transforms applied:

    state = matrix.isIdentity();        			// true if identity

Check if two matrices are identical:

    state = matrix.isEqual( matrix2 );        		// true if equal

Reset matrix to an identity matrix:

    matrix.reset();

Methods are chainable:

    matrix.rotateDeg(45).translate(100, 120);     	// rotate, then translate

To synchronize a DOM element:

    elem.style.transform = matrix.toCSS();        	// some browsers may need prefix

Tip: you can also use a SVGMatrix directly as source for methods taking a matrix.

See documentation for full overview and usage.


Contributors
============

- Ken "Fyrstenberg" Nilsen (creator) (https://github.com/epistemex)
- Leon Sorokin (https://github.com/leeoniya)
- Henry Ruhs (https://github.com/redaxmedia)
- Matthieu Dumas (https://github.com/solendil)

See Change.log for details.


License
=======

Released under [MIT license](http://choosealicense.com/licenses/mit/). You can use this class in both commercial and non-commercial projects provided that full header (minified and developer versions) is included.

*&copy; 2014-2016 Epistemex*

![Epistemex](http://i.imgur.com/wZSsyt8.png)
