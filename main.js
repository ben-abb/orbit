import * as THREE from 'three';
import $ from "jquery";

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

const textureLoader = new THREE.TextureLoader();
const texture = textureLoader.load('earth.png');

const geometry = new THREE.SphereGeometry(1,32,32);
const material = new THREE.MeshBasicMaterial({ map: texture });
//const material = new THREE.MeshBasicMaterial({color:0x1542ff});
const cube = new THREE.Mesh(geometry,material); //takes a geometry, applies a material.

scene.add(cube);

const geometry2 = new THREE.BoxGeometry(0.1,0.1,0.1);
const material2 = new THREE.MeshBasicMaterial({color:0xb5b5b5});
const cube2 = new THREE.Mesh(geometry2,material2); //takes a geometry, applies a material.

scene.add(cube2);
cube2.position.x = 5;
camera.position.z=10;
camera.position.y=2;





var initialCoordinates=[0,0];
var displayCoordinates=[0,0];
var mouseDownCoordinates=[0,0];
var relativeCursor=[0,0];
var globalCursor=[0,0];
var newMove=true;
var zoomAmount=10;

window.a=0;
window.b=0;


var craftCoordinates=[3,0,0];
var craftCoordinatesPrevious=[3,0,-.015];
var planetCoordinates=[0,0,0];
var planetVector=[];
var distanceToPlanet;
var bigG=.001;
var normalPlanetVector=[];
var gravityVector=[];
var craftCoordinatesPlaceholder=[];

var progradeVector=[];
var retrogradeVector=[];
var radialOutVector=[];
var radialInVector=[];
var normalVector=[];
var antiNormalVector=[];

var progradeVectorNormalized=[];
var retrogradeVectorNormalized=[];
var radialOutVectorNormalized=[];
var radialInVectorNormalized=[];
var normalVectorNormalized=[];
var antiNormalVectorNormalized=[];

var prograde = false;
var retrograde = false;
var radialOut = false;
var radialIn = false;
var normal = false;
var antiNormal = false;

var thrustMultiplier = 0.00001;

//line stuff

var maxLinePoints=10000;
var linePoints = new Float32Array(maxLinePoints * 3); //creates the array equal to 3x the length of the max points, so it can store x,y,z for each point. it's just a 1d array.

var lineGeometry = new THREE.BufferGeometry();


var lineMaterial = new THREE.LineBasicMaterial({color:0xd4d4d4});
var line = new THREE.Line(lineGeometry,lineMaterial);
scene.add(line);


function animate(){
    if (!isAnimating) return;
    
    $('.prograde').on('mousedown', function() {
        prograde = true;
    }).on('mouseup mouseleave', function() {
        prograde = false;
    });
    
    $('.retrograde').on('mousedown', function() {
        retrograde = true;
    }).on('mouseup mouseleave', function() {
        retrograde = false;
    });
    $('.radialOut').on('mousedown', function() {
        radialOut = true;
    }).on('mouseup mouseleave', function() {
        radialOut = false;
    });
    
    $('.radialIn').on('mousedown', function() {
        radialIn = true;
    }).on('mouseup mouseleave', function() {
        radialIn = false;
    });
    
    $('.normal').on('mousedown', function() {
        normal = true;
    }).on('mouseup mouseleave', function() {
        normal = false;
    });
    
    $('.antiNormal').on('mousedown', function() {
        antiNormal = true;
    }).on('mouseup mouseleave', function() {
        antiNormal = false;
    });
    
    
    
    

    craftCoordinatesPlaceholder=[
        craftCoordinates[0],
        craftCoordinates[1],
        craftCoordinates[2],
    ];

    planetVector=[
        planetCoordinates[0]-craftCoordinates[0],
        planetCoordinates[1]-craftCoordinates[1],
        planetCoordinates[2]-craftCoordinates[2],
    ];
    

    distanceToPlanet=Math.sqrt(planetVector[0]**2+planetVector[1]**2+planetVector[2]**2);

    
    normalPlanetVector=[
        planetVector[0]/distanceToPlanet,
        planetVector[1]/distanceToPlanet,
        planetVector[2]/distanceToPlanet,
    ];
    
    gravityVector=[
        normalPlanetVector[0]*(bigG*1/distanceToPlanet**2),
        normalPlanetVector[1]*(bigG*1/distanceToPlanet**2),
        normalPlanetVector[2]*(bigG*1/distanceToPlanet**2),
    ];    
    
    //console.log(craftCoordinates);
    
    craftCoordinates=[
        2*craftCoordinates[0]-craftCoordinatesPrevious[0]+gravityVector[0],
        2*craftCoordinates[1]-craftCoordinatesPrevious[1]+gravityVector[1],
        2*craftCoordinates[2]-craftCoordinatesPrevious[2]+gravityVector[2],
    ]
    
    craftCoordinatesPrevious=[
        craftCoordinatesPlaceholder[0],    
        craftCoordinatesPlaceholder[1],    
        craftCoordinatesPlaceholder[2]    
    ];
    
    
    
    
        progradeVector=[
            craftCoordinates[0]-craftCoordinatesPrevious[0],
            craftCoordinates[1]-craftCoordinatesPrevious[1],
            craftCoordinates[2]-craftCoordinatesPrevious[2]
        ];
        progradeVectorNormalized=normalizeVector(progradeVector);
    
    
        retrogradeVector=[
            craftCoordinatesPrevious[0]-craftCoordinates[0],
            craftCoordinatesPrevious[1]-craftCoordinates[1],
            craftCoordinatesPrevious[2]-craftCoordinates[2]
        ];
        retrogradeVectorNormalized=normalizeVector(retrogradeVector);
    
    
        radialOutVector=[
            craftCoordinates[0]-planetVector[0],
            craftCoordinates[1]-planetVector[1],
            craftCoordinates[2]-planetVector[2]
        ];
        radialOutVectorNormalized=normalizeVector(radialOutVector);
    
    
        radialInVector=[
            planetVector[0]-craftCoordinates[0],
            planetVector[1]-craftCoordinates[1],
            planetVector[2]-craftCoordinates[2]
        ];
        radialInVectorNormalized=normalizeVector(radialInVector);
    
        normalVector=[
            (progradeVector[1]*radialOutVector[2])-(progradeVector[2]*radialOutVector[1]),
            (progradeVector[2]*radialOutVector[0])-(progradeVector[0]*radialOutVector[2]),
            (progradeVector[0]*radialOutVector[1])-(progradeVector[1]*radialOutVector[0])
        ];
        normalVectorNormalized=normalizeVector(normalVector);
    
        antiNormalVector=[
            normalVector[0]*-1,
            normalVector[1]*-1,
            normalVector[2]*-1,
        ];
        antiNormalVectorNormalized=normalizeVector(antiNormalVector);
    
    
    if(prograde){}else{progradeVector=[0,0,0];progradeVectorNormalized=[0,0,0];}
    
    if(retrograde){}else{retrogradeVector=[0,0,0];retrogradeVectorNormalized=[0,0,0];}

    if(radialOut){}else{radialOutVector=[0,0,0];radialOutVectorNormalized=[0,0,0];}
    
    if(radialIn){}else{radialInVector=[0,0,0];radialInVectorNormalized=[0,0,0];}
    
    if(normal){}else{normalVector=[0,0,0];normalVectorNormalized=[0,0,0];}
    
    if(antiNormal){}else{antiNormalVector=[0,0,0];antiNormalVectorNormalized=[0,0,0];}
    
    
    for(var i=0;i<3;i++){
    craftCoordinates[i]=[
        craftCoordinates[i]+progradeVectorNormalized[i]+retrogradeVectorNormalized[i]+radialOutVectorNormalized[i]+radialInVectorNormalized[i]+normalVectorNormalized[i]+antiNormalVectorNormalized[i]
    ];
    }
    
    
    camera.position.x = zoomAmount*Math.cos(a)*Math.cos(b);
    camera.position.y = zoomAmount*Math.sin(b);
    camera.position.z = zoomAmount*Math.sin(a)*Math.cos(b);

    cube2.position.x = craftCoordinates[0]
    cube2.position.y = craftCoordinates[1]
    cube2.position.z = craftCoordinates[2]
    
    /*
    works for a cube 'looking' at middle, but not camera. welp...
    camera.rotation.y = .5*Math.PI-a;
    camera.rotation.z = .5*Math.PI+b;*/
    
    camera.lookAt(cube.position);
    
    
    calculateFuturePoints();
    
    
    


    renderer.render(scene,camera);
}
renderer.setAnimationLoop(animate);


function normalizeVector(vector){
    var vectorLength=Math.sqrt(vector[0]**2+vector[1]**2+vector[2]**2);
    var c0=vector[0]/vectorLength*thrustMultiplier;
    var c1=vector[1]/vectorLength*thrustMultiplier;
    var c2=vector[2]/vectorLength*thrustMultiplier;
    return [c0,c1,c2];
}


var futureCurrentPosition=[];
var futurePreviousPosition=[];
var futurePoints=[];
var futurePointsToCalculate=10000;
var futurePositionPlaceholder=[];
var futurePlanetVector=[];
var futureDistanceToPlanet;
var futureNormalPlanetVector=[];
var futureGravityVector=[];


function calculateFuturePoints(){
    futurePoints=[];
    futureCurrentPosition=[
            craftCoordinates[0],
            craftCoordinates[1],
            craftCoordinates[2]
        ];
    futurePreviousPosition=[
    craftCoordinatesPrevious[0],
    craftCoordinatesPrevious[1],
    craftCoordinatesPrevious[2]
    ];

        
        
        
        
        for(var i=0;i<futurePointsToCalculate;i++){//you need a condition that says, 'if this point is < this far away to craftCoordinates and is more than, for ex, 30 steps out, fill the rest with craft coordinate so it doesn't f up the look of the orbit due to the lack of precision in future orbits.
            
            futurePositionPlaceholder=[
        futureCurrentPosition[0],
        futureCurrentPosition[1],
        futureCurrentPosition[2],
    ];

    futurePlanetVector=[
        planetCoordinates[0]-futureCurrentPosition[0],  //planetcoordinates must be altered if planet will move.
        planetCoordinates[1]-futureCurrentPosition[1],
        planetCoordinates[2]-futureCurrentPosition[2],
    ];
    

    futureDistanceToPlanet=Math.sqrt(futurePlanetVector[0]**2+futurePlanetVector[1]**2+futurePlanetVector[2]**2);

    
    futureNormalPlanetVector=[
        futurePlanetVector[0]/futureDistanceToPlanet,
        futurePlanetVector[1]/futureDistanceToPlanet,
        futurePlanetVector[2]/futureDistanceToPlanet,
    ];
    
    futureGravityVector=[
        futureNormalPlanetVector[0]*(bigG*1/futureDistanceToPlanet**2),
        futureNormalPlanetVector[1]*(bigG*1/futureDistanceToPlanet**2),
        futureNormalPlanetVector[2]*(bigG*1/futureDistanceToPlanet**2),
    ];    
    
    //console.log(craftCoordinates);
    
    futureCurrentPosition=[
        2*futureCurrentPosition[0]-futurePreviousPosition[0]+futureGravityVector[0],
        2*futureCurrentPosition[1]-futurePreviousPosition[1]+futureGravityVector[1],
        2*futureCurrentPosition[2]-futurePreviousPosition[2]+futureGravityVector[2],
    ]
            
            futurePoints.push(futureCurrentPosition[0]);
            futurePoints.push(futureCurrentPosition[1]);
            futurePoints.push(futureCurrentPosition[2]);
    
    futurePreviousPosition=[
        futurePositionPlaceholder[0],    
        futurePositionPlaceholder[1],    
        futurePositionPlaceholder[2]    
    ];
            
            
            //end
        }
        
    setLinePoints();
        
    
    
}





var pointCount=0;
function setLinePoints(){
    
    var far=new Float32Array(futurePoints);
    line.geometry.setAttribute('position', new THREE.BufferAttribute(far, 3));
    lineGeometry.attributes.position.needsUpdate=true;
    
}



//orbit camera

let lastScrollTop = 0;
$(window).on("wheel touchmove", function(e) {
  let st = $(this).scrollTop();
  if (e.originalEvent.deltaY > 0 || e.originalEvent.touches?.[0].clientY < lastScrollTop) {
    zoomAmount=zoomAmount*1.05;
  } else {
    zoomAmount=zoomAmount/1.05;
  }
  lastScrollTop = e.originalEvent.touches?.[0].clientY || st;
});



$(document).ready(function() {
    let isMouseDown = false;

    // Detect when the mouse button is pressed
    $("canvas").mousedown(function() {
        isMouseDown = true;
        newMove=true;
    });

    // Detect when the mouse button is released
    $("canvas").mouseup(function() {
        isMouseDown = false;
        initialCoordinates=[displayCoordinates[0],displayCoordinates[1]];
    });

    // Track mouse movement only when the mouse is held down
    $("canvas").mousemove(function(e) {
        if(newMove){
            newMove=false;
            mouseDownCoordinates=[e.pageX,e.pageY];
        }
        
        globalCursor=[e.pageX,e.pageY];
        relativeCursor=[
            globalCursor[0]-mouseDownCoordinates[0],
            globalCursor[1]-mouseDownCoordinates[1]
        ];
        
        displayCoordinates=[
            initialCoordinates[0]+relativeCursor[0],
            Math.max(Math.min(initialCoordinates[1]+relativeCursor[1],Math.PI*50),-1*Math.PI*50)
        ];
        
        
        
        if (isMouseDown) {
            a=displayCoordinates[0]/100;
            b=displayCoordinates[1]/100;
        }
    });
    

});
      
      
//fully chatgpt until 'here'. hopefully work?      
let isAnimating = true;
document.getElementById('toggle').addEventListener('click', toggleAnimation);

function toggleAnimation() {
  isAnimating = !isAnimating;
  if (isAnimating) animate();
}
      
//here