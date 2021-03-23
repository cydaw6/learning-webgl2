



const canvas = document.querySelector("canvas");
// Initialisation du context WebGl
const gl = canvas.getContext("webgl2") || canvas.getContext("experimental-webgl2");
// Continuer seulement si WebGL ests diponible et fonctionnel
if(!gl){
    alert('Erreur. Il est possible que votre navigateur ne supporte pas WebGL.');
}


//Créer les donnes de sommets
/*
const vertexData = [

    // Front
    0.5, 0.5, 0.5,
    0.5, -.5, 0.5,
    -.5, 0.5, 0.5,
    -.5, 0.5, 0.5,
    0.5, -.5, 0.5,
    -.5, -.5, 0.5,

    // Left
    -.5, 0.5, 0.5,
    -.5, -.5, 0.5,
    -.5, 0.5, -.5,
    -.5, 0.5, -.5,
    -.5, -.5, 0.5,
    -.5, -.5, -.5,

    // Back
    -.5, 0.5, -.5,
    -.5, -.5, -.5,
    0.5, 0.5, -.5,
    0.5, 0.5, -.5,
    -.5, -.5, -.5,
    0.5, -.5, -.5,

    // Right
    0.5, 0.5, -.5,
    0.5, -.5, -.5,
    0.5, 0.5, 0.5,
    0.5, 0.5, 0.5,
    0.5, -.5, 0.5,
    0.5, -.5, -.5,

    // Top
    0.5, 0.5, 0.5,
    0.5, 0.5, -.5,
    -.5, 0.5, 0.5,
    -.5, 0.5, 0.5,
    0.5, 0.5, -.5,
    -.5, 0.5, -.5,

    // Bottom
    0.5, -.5, 0.5,
    0.5, -.5, -.5,
    -.5, -.5, 0.5,
    -.5, -.5, 0.5,
    0.5, -.5, -.5,
    -.5, -.5, -.5,
];
*/



function spherePointCloud(pointCount){
    let points = [];
    for(let i = 0; i < pointCount; i++){
        const r = () => Math.random() - 0.5; // -.5 < x < 0.5 
        const inputPoint = [r(), r(), r()];
        points.push(...inputPoint);
    }
    return points;
}

const vertexData = spherePointCloud(1e5);

function randomColor(){
    return [Math.random(), Math.random(), Math.random()];
}


let colorData = [];

for(let face = 0; face < 6; face++){
    let faceColor = randomColor();
    for(let vertex = 0 ; vertex < 6; vertex++){
        colorData.push(...faceColor);
    }

}

// Créer un buffer des sommets
const positionBuffer = gl.createBuffer();
// lien le buffer à celui des sommets 
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    // charger les données de sommets dans le buffer
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexData), gl.STATIC_DRAW); //ou dynamic_draw (quand on sait qu'on va beaucoup rafraichir)


// Créer un buffer des couleurs
const colorBuffer = gl.createBuffer();
// définir le buffer créer comme celui des données 
gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    // charger les données de sommets dans le buffer
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colorData), gl.STATIC_DRAW); //ou dynamic_draw 

// Créer le shader de sommet
const vertexShader = gl.createShader(gl.VERTEX_SHADER);
gl.shaderSource(vertexShader, `
precision mediump float;

attribute vec3 position;
attribute vec3 color;
varying vec3 vColor;

uniform mat4 matrix;

void main(){
    // sortie du shader de sommets
    vColor = vec3(position.xy, 1);
    gl_Position = matrix * vec4(position, 1); // l'ordre des opération avec matrice compte !
}
`);
gl.compileShader(vertexShader);

// Créer le shader de fragment
const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
gl.shaderSource(fragmentShader, `
precision mediump float;
varying vec3 vColor;

void main(){
    gl_FragColor = vec4(vColor, 1);
}
`);
gl.compileShader(fragmentShader);

// Créer le programme
const program = gl.createProgram();
    // attacher les shaders au programme
gl.attachShader(program, vertexShader);
gl.attachShader(program, fragmentShader);
gl.linkProgram(program);

// Activer les attribus des sommets
const positionLocation = gl.getAttribLocation(program, `position`); // fait la ref d'où se trouve les position dans le shader de sommets
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
gl.enableVertexAttribArray(positionLocation); // "enable" car les attribus sont desactivé par defaut
gl.vertexAttribPointer(positionLocation, 3, gl.FLOAT, false, 0, 0); // Décrit à webgl comment il devrait récupérer les attribues des données du buffer actuellement bindé | 3 pour x,y,z; float car FLoat32Array


const colorLocation = gl.getAttribLocation(program, `color`); 
gl.enableVertexAttribArray(colorLocation);
gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
gl.vertexAttribPointer(colorLocation, 3, gl.FLOAT, false, 0, 0);

// dire à webgl quel programme utiliser
gl.useProgram(program);
gl.enable(gl.DEPTH_TEST);

//on va appliquer les opération de matrice après la création du programme mais avant l'affichage
const uniformLocations = {
    matrix:  gl.getUniformLocation(program, `matrix`),
};


//https://glmatrix.net/docs/
const modelMatrix = glMatrix.mat4.create();
const viewMatrix = glMatrix.mat4.create();
// pour la redefinition de la taille de fenêtre
const projectionMatrix = glMatrix.mat4.create();
glMatrix.mat4.perspective(projectionMatrix,
    // field-of-view (angle, radians)
    70 * (Math.PI/180),
    canvas.width/canvas.height, // aspect W/H
    1e-4,// near cull distance
    10 // far cull distance    
);

/*
//faire le scale et rotation avant la translation 
glMatrix.mat4.scale(modelMatrix, modelMatrix, [0.25, 0.25, 0.25]);
glMatrix.mat4.translate(modelMatrix, modelMatrix, [0.2, 0.5, -5]);
*/

const mvMatrix = glMatrix.mat4.create();
const mvpMatrix = glMatrix.mat4.create();



//glMatrix.mat4.rotateZ(matrix, matrix, Math.PI/2);

glMatrix.mat4.translate(modelMatrix, modelMatrix, [0, 0, 0]);

glMatrix.mat4.translate(viewMatrix, viewMatrix, [0, 0.1, 2]);
glMatrix.mat4.invert(viewMatrix, viewMatrix);

function animate(){
    requestAnimationFrame(animate);
    //glMatrix.mat4.rotateX(modelMatrix, modelMatrix, Math.PI/2/100);
    glMatrix.mat4.rotateY(modelMatrix, modelMatrix, Math.PI/2/100);
    glMatrix.mat4.multiply(mvMatrix, viewMatrix, modelMatrix);
    glMatrix.mat4.multiply(mvpMatrix, projectionMatrix, mvMatrix);
    gl.uniformMatrix4fv(uniformLocations.matrix, false, mvpMatrix);
    gl.drawArrays(gl.POINTS, 0, vertexData.length / 3); // 0 : sur quel sommet commencer; 3 : nombre de sommets

}

animate();
    


