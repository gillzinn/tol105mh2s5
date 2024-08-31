"use strict";

var canvas;
var gl;

var points = [];

var NumTimesToSubdivide = 3;

window.onload = function init()
{
    canvas = document.getElementById( "gl-canvas" );

    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    //
    //  Initialize our data for the Sierpinski Gasket
    //

    // First, initialize the corners of our gasket with three points.

    var vertices = [
        vec2(  -1,  -1 ),
        vec2(  1, -1 ), 
        vec2(  1,  1 ),
        vec2( -1, 1 ),        
    ];

    divideTriangle( vertices[0], vertices[1], vertices[2], vertices[3],  NumTimesToSubdivide);
    
                  
    //
    //  Configure WebGL
    //
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );

    //  Load shaders and initialize attribute buffers

    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    // Load the data into the GPU

    var bufferId = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );

    // Associate out shader variables with our data buffer

    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    render();
};

function triangle( a, b, c ,d)
{
    points.push( a, b, c, d );
}

function divideTriangle( a, b, c, d, count )
{

    // check for end of recursion

    if ( count === 0 ) {
        triangle( a, b, c, d );
    }
    else {

        //bisect the sides

        var ab = mix( a, b, 0.25 );
        var ab2 = mix( a, b, 0.75 );
        var bc = mix( b, c, 0.25 );
        var bc2 = mix( b, c, 0.75 );
        var cd = mix( c, d, 0.25 );
        var cd2 = mix( c, d, 0.75 );
        var ad = mix( a, d, 0.25 );
        var ad2 = mix( a, d, 0.75 );

        --count;

        // three new triangles

        divideTriangle( a, ab, ad, vec2(ab[1], ad[0]),count );
        divideTriangle( ad, vec2(ab[1], ad[0]), ad2, vec2(ad2[0], ab[1]),count );
        divideTriangle( d, cd2, ad2, vec2(ad2[0], ab[1]), count );

        divideTriangle( ab, ab2, vec2(ab2[1],ad[0]), vec2(ab[1], ad[0]), count );
        divideTriangle( cd, vec2(ab[1], ad2[0]), cd2, vec2(ab2[1], ad2[0]), count );

        divideTriangle( b, bc, ab2, vec2(ab2[1], bc[0]), count );
        divideTriangle( bc, bc2, vec2(ab2[1], bc[0]), vec2(ab2[1], bc2[0]), count );
        divideTriangle( bc2, vec2(cd[1], bc2[0]), cd, c, count );
        
        
        
    }
}

function render()
{
    gl.clear( gl.COLOR_BUFFER_BIT );
    gl.drawArrays( gl.TRIANGLE_FAN, 0, points.length );
}
