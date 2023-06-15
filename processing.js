const fs = require('fs');
function deg2Rad(deg){  
  return deg/(180/Math.PI);
}
function rad2Deg(rad){  
  return rad*(180/Math.PI);
}
function crossProduct(a, b) {
  if (a.length !== 3 || b.length !== 3) {
    throw new Error('Vectors must be 3-dimensional');
  }

  const result = [
    a[1] * b[2] - a[2] * b[1],
    a[2] * b[0] - a[0] * b[2],
    a[0] * b[1] - a[1] * b[0]
  ];

  return result;
}
function squareRootOfSum(...numbers) {
  const sumOfSquares = numbers.reduce((sum, num) => {
    return sum + Math.pow(num, 2);
  }, 0);

  const squareRoot = Math.sqrt(sumOfSquares);
  return squareRoot;
}


function readCSVFile(filePath, filePath2, callback) { //Process the raw data which we collected into a useable format (not to be used in online operation)
    const values = [];
    const destinations = [];
    fs.readFile(filePath, 'utf-8', (err, data) => {
      if (err) {
        console.error('Error reading the file:', err);
        callback([]);
        return;
      }
  
      const rows = data.split('\n');
      const headers = rows[0].split(',');
  
      let buff = [];
  
      for (let i = 1; i < rows.length; i++) {
        const rowValues = rows[i].split(',');
  
        if (rowValues.length === 1 && rowValues[0].trim() === 'NEW RUN') {
          if (buff.length > 0) {
            values.push(buff);
            buff = [];
          }
        } else if (rowValues.length === headers.length) {
          const obj = {};
  
          for (let j = 0; j < headers.length; j++) {
            obj[headers[j]] = Number(rowValues[j]);
          }
  
          buff.push(obj);
        }
      }
      values.push(buff);
      fs.readFile(filePath2, 'utf-8', (err, data) => {
        if (err) {
          console.error('Error reading the file:', err);
          callback([]);
          return;
        }
  
        const rows = data.split('\n');
        const headers = ['x','y'];
  
        for (let i = 1; i < rows.length; i++) {
          const rowValues = rows[i].split(',');
          const obj = {};
  
          for (let j = 0; j < headers.length; j++) {
            obj[headers[j]] = Number(rowValues[j]);
          }
  
          destinations.push(obj);
        }
        callback([values, destinations]);
      });
    });
  }
  


const filePath = 'C:\\DAPP2\\imutest1.csv';
const filePath2 = 'C:\\DAPP2\\DAPP IMU Data  - Sheet1.csv';
readCSVFile(filePath,filePath2,([values,destinations])=>{
const initTrain = [];
const movingTrain = [];
const destTrain = [];
let j  = 0;
for (let i = 0; i < 31;i++){//sort the raw data into the different trials so it can be properly calculated from
  let buffinit = [];
  //console.log(buffinit);
  let buffmoving = [];
            for (let j = 0; j<100;j++){
                if (j<10){
                buffinit.push(values[i][j]);
                }else{buffmoving.push(values[i][j]);}}
  //console.log(buffinit);
  initTrain.push(buffinit);
  movingTrain.push(buffmoving);
}
for(let i = 0; i < destinations.length; i++){//processes the intended output data into a useable format
    if (i%10 === 0){
        destTrain.push(destinations[i]);
    }}

for(let Tnorth = 320; Tnorth<360; Tnorth+=1000){//Iteratively orients the orthogonal axis of the room with magnetic north (determined before online use) 
  let score = {
    points:0,
    angle:Tnorth
  }
  let data = [];
for(let iter = 0; iter < initTrain.length; iter++){ //Trialing the algorithm

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
for(let a = 0; a < b; a++){ //Orients the axis based on the average measurements during the initialisation process based on the relationship between gravity, true z and magnetic north pointing outside of the xy plane

    Object.entries(initTrain[iter][a]).forEach(([prop,val])=>{
        aves[prop] += val/b;
    })    
}
//console.log(aves);
const magA = squareRootOfSum(aves.Xa,aves.Ya,aves.Za);  
const magM =squareRootOfSum(aves.Xma,aves.Yma,aves.Zma);
let down = [aves.Xa/magA,-aves.Ya/magA,-aves.Za/magA];
const east = crossProduct(down,[aves.Xma/magM,-aves.Yma/magM,-aves.Zma/magM]);
const north = crossProduct(east,down);
down = [-down[0],-down[1],-down[2]];
const rot = [];
rot.push(north);
rot.push(east);
rot.push(down);
coordinates.xang = rad2Deg(-Math.atan2(-rot[1][2], rot[2][2]));
coordinates.yang = rad2Deg(-Math.asin(rot[0][2]));
coordinates.zang = rad2Deg(-Math.atan2(-rot[0][1], rot[0][0]))+Tnorth;
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
let data2 =[];
//for(let it = 0 ;it<movingTrain[iter].length;it++){ //Trapezium method of real time integration
for(let it = 0 ;it<90;it++){
    coordinates.xang += (updateVector.xvang + movingTrain[iter][it].Xgr-aves.Xgr)*0.025; //Update the orientation angles to the average position during the interval   - set to averages
    coordinates.yang += (updateVector.yvang + movingTrain[iter][it].Ygr-aves.Ygr)*0.025; //assuming that the angular velocity is constant in the time period (0.1 seconds)
    coordinates.zang += (updateVector.zvang + movingTrain[iter][it].Zgr-aves.Zgr)*0.025;
    const Bsin = Math.sin(deg2Rad(coordinates.yang));
    const Bcos = Math.cos(deg2Rad(coordinates.yang));
    const Asin = Math.sin(deg2Rad(coordinates.zang));
    const Acos = Math.cos(deg2Rad(coordinates.zang));
    const Gsin = Math.sin(deg2Rad(coordinates.xang));
    const Gcos = Math.cos(deg2Rad(coordinates.xang));
    const i = ((movingTrain[iter][it].Xa)*Bcos*Gcos+(movingTrain[iter][it].Ya)*(Bsin*Asin*Gcos-Acos*Gsin)+(movingTrain[iter][it].Za)*(Acos*Bsin*Gcos+Asin*Gsin))*9.81/1000;//Find the acceleration in the true coordinate system and convert to ms^-2
    const j = ((movingTrain[iter][it].Xa)*Bcos*Gsin+(movingTrain[iter][it].Ya)*(Bsin*Asin*Gsin+Acos*Gcos)+(movingTrain[iter][it].Za)*(Acos*Bsin*Gsin-Asin*Gcos))*9.81/1000;
    xvinc = (updateVector.xaBuff + i)/2; //calculate the average acceleration in x during the period
    updateVector.xaBuff = i; //store acceleration for next iteration
    updateVector.x += (updateVector.xvBuff+xvinc/20)/10; //increase displacement by average velocity x = (v + at/2)t
    updateVector.xvBuff += xvinc/10; //store velocity for next iteration v = u + at
    //repeat for Y
    yvinc = (updateVector.yaBuff + j)/2;
    updateVector.yaBuff =j;
    updateVector.y += (updateVector.yvBuff+yvinc/20)/10;
    updateVector.yvBuff += yvinc/10;
    coordinates.xang += (updateVector.xvang + movingTrain[iter][it].Xgr-aves.Xgr)*0.025;//Update the orientation angles to the final position during the interval
    coordinates.yang += (updateVector.yvang + movingTrain[iter][it].Ygr-aves.Ygr)*0.025;
    coordinates.zang += (updateVector.zvang + movingTrain[iter][it].Zgr-aves.Zgr)*0.025;
    updateVector.xvang = movingTrain[iter][it].Xgr-aves.Xgr; //store angular velocity for next iteration
    updateVector.yvang = movingTrain[iter][it].Ygr-aves.Ygr;
    updateVector.zvang = movingTrain[iter][it].Zgr-aves.Zgr;
    //console.log(updateVector)
    if (it%10 === 9){ //Every second send an update of position
        coordinates.x += updateVector.x;
        coordinates.y += updateVector.y;
        updateVector.x = 0;
        updateVector.y = 0;
        //console.log(Math.sqrt((coordinates.x-destinations[iter*10+(it+1)/10].x)**2 + (coordinates.y-destinations[iter*10+(it+1)/10].y)**2));
        data2.push([coordinates.x,destinations[iter*10+(it+1)/10].x,coordinates.y,destinations[iter*10+(it+1)/10].y]);
       }
}
data.push(data2);

score.points += Math.sqrt((coordinates.x-destinations[iter*10+9].x)**2 + (coordinates.y-destinations[iter*10+9].y)**2); //Calculate the distance from the correct position
}
console.log(data);
//console.log(score.points/31);
//console.log(score);
}
});
