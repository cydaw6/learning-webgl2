let canvas = document.querySelector("canvas");
let gl = canvas.getContext("webgl2");
if(!gl){
    console.error("no webgl2");
}


let vertexShaderSource = `#version 300 es
// un attribut est une entrée vers le shader de sommets
in vec4 a_position;

void main(){
    //gl_Position est une variable spéciale déjà présente dans tous shader de sommet
    gl_Position = a_position;
}
`;

let fragmentShaderSource = `#version 300 es
// les shaders n'on pas de précision par défaut. On peu prendre highp
// par exemple (high precision)
precision highp float;

// on doit déclarer la sortie
out vec4 outColor;

void main(){
    outColor = vec4(1,0,0.5,1);
}
`;

//
// On créer une fonction qui va créer le shader = uploader la source GLSL et compiler
//
function createShader(gl, type, source){
    let shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    let success = gl.getShaderParemter(shader, gl.COMPILE_STATUS);
    if(success){
        return shader;
    }
    console.log(gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
}

// On créer nos dos shader grâce à la fonction
let vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
let fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

