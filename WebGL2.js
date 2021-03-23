
let vertexShaderSource = `#version 300 es

// un attribut est une entrée (in) vers le shader de sommets
in vec4 a_position;

void main(){
    //gl_Position est une variable spéciale 
    // déjà présente dans tous shader de sommet
    gl_Position = a_position;
}
`;

let fragmentShaderSource = `#version 300 es

// les shaders n'ont pas de précision par défaut. On peu prendre highp
// par exemple (high precision)
precision highp float;

// on doit déclarer la sortie
out vec4 outColor;

void main(){
    outColor = vec4(1, 0, 0.5, 1);
}
`;


//
// On créer une fonction qui va permettre de créer le shader : uploader la source GLSL et compiler
//
function createShader(gl, type, source){
    let shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    let success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if(success){
        return shader;
    }

    console.log(gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    
}


//
// On créer une fonction pour lier ces deux shader pour créer "programme" GLSL sur le GPU 
//
function createProgram(gl, vertexShader, fragmentShader){
    let program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program); // lie le programme à Webgl pour lui dire de l'utiliser
    let success = gl.getProgramParameter(program, gl.LINK_STATUS);
    if(success){
        return program;
    }

    console.log(gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
}

function main(){

    let canvas = document.querySelector("canvas");
    let gl = canvas.getContext("webgl2");
    if(!gl){
        console.error("no webgl2");
        return;
    }

    // On créer nos deux shader grâce à la fonction
    let vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    let fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

    
    // On créer le programme
    let program = createProgram(gl, vertexShader, fragmentShader);

    // on créer un objet qui sera notre entrée pour donner des informations au shader
    // ici sur l'attribut "a_position"
    let positionAttributeLocation = gl.getAttribLocation(program, "a_position");

    // On créer un buffer
    // les attributs récup les données depuis les buffers
    let positionBuffer = gl.createBuffer();

    // on lie le buffer de position
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    // On ajoute des données dans le buffer créé
    // ex: 3 points
    let positions = [
        0, 0,
        0, 0.5,
        0.7, 0,
    ];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW) // ou DYNAMIC_DRAW si on prévois de faire plein de rafraichissement


    // Maintenant qu'on a ajouté des donénes au buffer on doit dire à l'attribut comment les récupérer
    // On créer une collection d'état d'attributs un "Vertex Array Object" (extrait de sommets)
    let vao = gl.createVertexArray();

    // On doit le définir en tant que tableau de sommets actuel afin que tous les paramètres d'attributs 
    // s'appliquent à cet ensemble d'états d'attributs.
    gl.bindVertexArray(vao);


    // on active les attributs qui seront utilisés lors de la manipulation des positions
    gl.enableVertexAttribArray(positionAttributeLocation);

    // On indique comment le faire
    let size = 2;               // dans notre exemple : x, y - donc 2
    let type = gl.FLOAT;        // ce sont des flottants 32bit
    let normalize = false;      // ne pas normaliser les données
    let stride = 0;             // 0 = avancer vers size * sizeof(type) à chaque iteration pour avoir la position suivante 
    let offset = 0;             // commencer au début du buffer
    gl.vertexAttribPointer(positionAttributeLocation, size, type, normalize, stride, offset);
    // la partie caché de ce fonctionnement est que la vertexAttribIPointer() lier l'ARRAY_BUFFER courant à l'attribut
    // donc ici cet attribut "a_position" est lié à positionBuffer
    // On est maintenant libre de lier ce qu'on veut à l'ARRAY_BUFFER



    // Clear the canvas
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    // On dit à WebGL d'utiliser notre programme
    gl.useProgram(program);

    // On lui dit quels buffers utiliser 
    // et comment en obtenir les données pour les fournir aux attributs des shader
    gl.bindVertexArray(vao);

    // Et enfin on lui demande d'executer notre programme GLSL
    let primitiveType = gl.TRIANGLES;
    let dataOffset = 0;
    let count = 3;
    gl.drawArrays(primitiveType, dataOffset, count);
}

main();

//https://webgl2fundamentals.org/webgl/lessons/webgl-resizing-the-canvas.html



