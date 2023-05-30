const fs = require('fs');
function deg2Rad(deg){  
  return deg/(180/Math.PI);
}
function readCSVFile(filePath, callback) {
  fs.readFile(filePath, 'utf-8', (err, data) => {
    if (err) {
      console.error('Error reading the file:', err);
      callback([]);
      return;
    }
    
    const rows = data.split('\n');
    const headers = rows[0].split(',');
    const values = [];
    const destinations = [];
    let k = 0;
    let buff = [];
    
    for (let i = 1; i < rows.length; i++) {
      const rowValues = rows[i].split(',');
      
      if (rowValues.length === 1 && rowValues[0].trim() === 'Initialising') {
        k++;
        if (buff.length > 0) {
          values.push(buff);
          buff = [];
        }
      } else if (rowValues.length === 1 && rowValues[0].trim() === 'Start') {
        k++;
        if (buff.length > 0) {
          values.push(buff);
          buff = [];
        }
      } else if (rowValues[0] === 'Destination:') {
        const obj = {
          x: rowValues[1],
          y: rowValues[2]
        };
        destinations.push(obj);
      } else if (rowValues.length === headers.length) {
        const obj = {};
        
        for (let j = 0; j < headers.length; j++) {
          obj[headers[j]] = Number(rowValues[j]);
        }
        
        buff.push(obj);
      }
    }
    
    callback([values, destinations]);
  });
}


const filePath = 'C:\\DAPP2\\imutestData.csv';
readCSVFile(filePath,([values,destinations])=>{
const initTest = [];
const initTrain = [];
const movingTest = [];
const movingTrain = [];
const destTest = [];
const destTrain = [];
let j  = 0;
for (let i = 0; i < 41;i++){
        if (i<21){
          initTrain.push(values[2*i]);
          movingTrain.push(values[2*i+1]);
      }else{
        initTest.push(values[2*i]);
        movingTest.push(values[2*i+1]);
      }
}
for(let i = 0; i < destinations.length; i++){
    if (i<21){
        destTrain.push(destinations[i]);
    }else{
        destTest.push(destinations[i]);
}}
for(let north = 0; north<360; north+=360){
  let score = {
    points:0,
    angle:north
  }
for(let iter = 0; iter < initTrain.length; iter++){
let coordinates = {
    xang: 0,
    yang: 0,
    zang: 0,
    x:0,
    y:0,
    z:0
}
let aves = {
    Xa:0,Ya:0,Za:0,Xgr:0,Ygr:0,Zgr:0,Xma:0,Yma:0,Zma:0
}
let b = initTrain[iter].length;
for(let a = 0; a < b; a++){

    Object.entries(initTrain[iter][a]).forEach(([prop,val])=>{
        aves[prop] += val/b;
    })    
}
//console.log(aves);

coordinates.xang = Math.atan2(-aves.Ya,aves.Za)*180/Math.PI;
coordinates.yang = Math.atan2(aves.Xa,aves.Za)*180/Math.PI;
coordinates.zang = Math.atan2(aves.Ya,aves.Xa)*180/Math.PI;
//USE ACCEL FOR TRUE Z
//COMPARE TRUE XY PLANE TO MAGNETIC FOR TRUE XYs
let maxAbsolute = Math.max(Math.abs(coordinates.xang),Math.abs(coordinates.yang),Math.abs(coordinates.zang));
if (Math.abs(coordinates.xang) === maxAbsolute){ 
  coordinates.xang = Math.atan2(-aves.Yma,aves.Zma)*180/Math.PI+north;
}else if (Math.abs(coordinates.yang) === maxAbsolute){ 
  coordinates.yang = Math.atan2(aves.Xma,aves.Zma)*180/Math.PI+north;
}else if(Math.abs(coordinates.zang)=== maxAbsolute){
  coordinates.zang = Math.atan2(aves.Yma,aves.Xma)*180/Math.PI+north;
}
let updateVector = {
    x: 0,
    y: 0,
    xvBuff:0,
    yvBuff:0,
    zvBuff:0,
    xaBuff:0,
    yaBuff:0,
    zaBuff:0,
    xvang: 0,
    yvang: 0,
    zvang: 0
}

for(let it = 0 ;it<movingTrain[iter].length;it++){
    coordinates.xang += (updateVector.xvang + movingTrain[iter][it].Xgr)*0.05;
    updateVector.xvang += movingTrain[iter][it].Xgr;
    coordinates.yang += (updateVector.yvang + movingTrain[iter][it].Ygr)*0.05;
    updateVector.yvang += movingTrain[iter][it].Ygr;
    coordinates.zang += (updateVector.zvang + movingTrain[iter][it].Zgr)*0.05;
    updateVector.zvang += movingTrain[iter][it].Zgr;
    i = movingTrain[iter][it].Xa*Math.cos(deg2Rad(coordinates.yang))*Math.cos(deg2Rad(coordinates.zang))+movingTrain[iter][it].Ya*Math.sin(deg2Rad(-coordinates.zang))*Math.cos(deg2Rad(coordinates.yang))+movingTrain[iter][it].Za*Math.sin(deg2Rad(coordinates.yang))*Math.cos(deg2Rad(coordinates.zang));
    j = movingTrain[iter][it].Ya*Math.cos(deg2Rad(coordinates.zang))*Math.cos(deg2Rad(coordinates.xang))+movingTrain[iter][it].Za*Math.sin(deg2Rad(-coordinates.xang))*Math.cos(deg2Rad(coordinates.zang))+movingTrain[iter][it].Xa*Math.sin(deg2Rad(coordinates.zang))*Math.cos(deg2Rad(coordinates.xang));
    k = movingTrain[iter][it].Za*Math.cos(deg2Rad(coordinates.xang))*Math.cos(deg2Rad(coordinates.yang))+movingTrain[iter][it].Xa*Math.sin(deg2Rad(-coordinates.yang))*Math.cos(deg2Rad(coordinates.xang))+movingTrain[iter][it].Ya*Math.sin(deg2Rad(coordinates.xang))*Math.cos(deg2Rad(coordinates.yang))-1000;
    xvinc = (updateVector.xaBuff + i)*0.05*9.81/1000;
    updateVector.xaBuff = i;
    updateVector.x += (updateVector.xvBuff+xvinc/2)*0.1;
    updateVector.xvBuff += xvinc;
    
    yvinc = (updateVector.yaBuff + j)*0.05*9.81/1000;
    updateVector.yaBuff =j;
    updateVector.y += (updateVector.yvBuff+yvinc/2)*0.1;
    updateVector.yvBuff += yvinc;
    
    zvinc = (updateVector.yaBuff + k)*0.05*9.81/1000;
    updateVector.zaBuff =k;
    updateVector.z += (updateVector.zvBuff+zvinc/2)*0.1;
    updateVector.zvBuff += zvinc;
}
coordinates.x += updateVector.x;
coordinates.y += updateVector.y;
coordinates.z += updateVector.z;
score.points += Math.sqrt((coordinates.x-destinations[iter].x)**2 + (coordinates.y-destinations[iter].y)**2);
//console.log(coordinates.x);
}
//console.log(score.points);
}
});